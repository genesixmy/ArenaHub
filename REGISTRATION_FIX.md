# Fix: Masalah RLS Policy Semasa Registration

## Masalah
```
Gagal membuat profil: new row violates row-level security policy for table "users"
```

## Punca
Masalah ini terjadi kerana Row-Level Security (RLS) policy menghalang pembuatan user profile semasa pendaftaran. Setelah `signUp()`, session mungkin tidak tersedia dengan serta-merta di server-side untuk membuat insert ke table `users`.

## Penyelesaian

Penyelesaian menggunakan **database trigger** yang akan automatik membuat user profile apabila user signup di Supabase Auth.

### Langkah-langkah:

#### 1. Run Migration SQL

1. Buka **Supabase Dashboard** projek anda
2. Pergi ke **SQL Editor**
3. Copy kandungan fail `supabase/migrations/004_fix_user_registration.sql`
4. Paste dan **Run** query tersebut

#### 2. Test Registration

1. Cuba daftar user baru di `/auth/register`
2. Registration sepatutnya berjaya sekarang
3. User profile akan auto-created oleh database trigger

## Apa Yang Berubah?

### Sebelum (❌ Error):
```typescript
// Manual insert ke users table - FAIL kerana RLS
const { error: profileError } = await supabase.from('users').insert({
  id: authData.user.id,
  email: formData.email,
  full_name: formData.fullName,
  // ...
});
```

### Selepas (✅ Berjaya):
```typescript
// Trigger automatik create user profile
const { data: authData } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
      institution_id: formData.institutionId,
      role: 'student',
    },
  },
});
// Profile auto-created by database trigger ✨
```

## Cara Trigger Berfungsi

1. User signup via `supabase.auth.signUp()`
2. Row baru dibuat di table `auth.users`
3. **Trigger `on_auth_user_created`** diaktifkan
4. Function `handle_new_user()` dipanggil (menggunakan `SECURITY DEFINER` untuk bypass RLS)
5. Row baru auto-created di table `public.users` dengan data dari `raw_user_meta_data`

## Code Yang Diubah

### Files Modified:
- ✅ `supabase/migrations/004_fix_user_registration.sql` (NEW)
- ✅ `src/app/auth/actions.ts` (UPDATED)

### Perubahan Detail:

**src/app/auth/actions.ts:**
- Removed manual `insert` to `users` table
- Added user metadata (full_name, institution_id, role) to `signUp()` options
- Trigger akan handle user profile creation

## Verify Fix

Untuk verify trigger berfungsi, run query ini di SQL Editor:

```sql
-- Check trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

## Troubleshooting

### Trigger tidak berfungsi?

1. Pastikan migration sudah run successfully
2. Check function `handle_new_user()` wujud:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. Check trigger `on_auth_user_created` wujud:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

### Masih error selepas run migration?

1. Delete user yang error dari Supabase Auth:
   - Dashboard > Authentication > Users
   - Delete user yang gagal register

2. Cuba register semula

3. Check logs di Supabase Dashboard > Logs untuk error details

## Notes

- ✅ Fix menggunakan database trigger (best practice Supabase)
- ✅ `SECURITY DEFINER` membolehkan trigger bypass RLS
- ✅ User metadata digunakan untuk populate user profile
- ✅ Institution ID tetap dapat disimpan dengan betul
- ✅ No manual profile creation needed in application code

---

**Status**: ✅ FIXED - Registration sepatutnya berfungsi dengan baik sekarang!

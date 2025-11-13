# 🔧 Troubleshooting Guide - ArenaHub

Panduan penyelesaian masalah untuk isu-isu biasa di ArenaHub.

## 📝 Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Database Issues](#database-issues)
3. [Common Errors](#common-errors)

---

## Authentication Issues

### ❌ Error: "Email signups are disabled"

**Punca:** Feature email signup tidak diaktifkan di Supabase Dashboard.

**Penyelesaian:**

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project ArenaHub anda
3. Pergi ke **Authentication** → **Providers**
4. Pastikan **Email** provider adalah **ENABLED** (hijau/turned on)
   - Jika tidak, klik toggle untuk enable
5. Pergi ke **Authentication** → **Settings**
6. Scroll ke bahagian **Email Auth**
7. Pastikan **"Enable email signup"** adalah **ON** (checked) ✅
8. Klik **Save**
9. Cuba register semula

**Screenshot lokasi:**
```
Dashboard → Authentication → Providers → Email [ENABLED ✅]
Dashboard → Authentication → Settings → Enable email signup [ON ✅]
```

---

### ❌ Error: "Email not confirmed"

**Punca:** Email confirmation diaktifkan tetapi user tidak verify email.

**Penyelesaian untuk Development:**

1. Buka Supabase Dashboard → **Authentication** → **Settings**
2. Cari **"Enable email confirmations"**
3. **MATIKAN** (turn OFF/unchecked) ❌
4. Klik **Save**
5. Cuba register atau login semula

**Penyelesaian untuk Production:**

Email confirmation patut diaktifkan untuk production. User perlu:
1. Check email inbox (dan spam folder)
2. Klik link verification dalam email
3. Lepas tu boleh login

---

### ❌ Error: "Invalid login credentials"

**Kemungkinan punca:**

1. **Email atau password salah** - Cuba reset password
2. **User belum register** - Pergi ke `/auth/register` untuk daftar
3. **Account tidak wujud dalam `users` table** - Mungkin berlaku jika registration partially failed

**Penyelesaian:**

1. Cuba register akaun baharu dengan email yang berbeza
2. Atau check dalam Supabase Dashboard → **Authentication** → **Users**
   - Jika user ada tapi masih error, check table `users` di **Table Editor**
   - Pastikan ada matching record dengan user ID yang sama

---

### ❌ Tidak boleh login walaupun password betul

**Punca:** User ada dalam `auth.users` tetapi tiada dalam table `users`

**Penyelesaian:**

1. Buka Supabase Dashboard → **SQL Editor**
2. Check user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```
3. Check jika ada dalam users table:
```sql
SELECT * FROM users WHERE email = 'your-email@example.com';
```
4. Jika TIDAK ada dalam `users` table, register semula atau create manually:
```sql
INSERT INTO users (id, email, full_name, username, role, institution_id)
VALUES (
  'user-id-dari-auth-users',
  'your-email@example.com',
  'Your Name',
  'your-username',
  'student',
  'institution-id'
);
```

---

## Database Issues

### ❌ Error: "Gagal memuatkan senarai institusi"

**Punca:** Migration belum run atau table `institutions` kosong.

**Penyelesaian:**

1. Check jika migrations sudah run:
   - Buka Supabase → **Table Editor**
   - Pastikan table `institutions` wujud
2. Jika table tidak wujud, run migrations:
   - Copy `supabase/migrations/001_initial_schema.sql`
   - Paste di **SQL Editor** dan Run
   - Copy `supabase/migrations/002_seed_data.sql`
   - Paste di **SQL Editor** dan Run
3. Verify ada data:
```sql
SELECT COUNT(*) FROM institutions;
```
4. Jika kosong, seed data manually atau run migration 002 semula

---

### ❌ Error: "row level security policy violation"

**Punca:** RLS policies tidak dikonfigurasi dengan betul atau user tidak authenticated.

**Penyelesaian:**

1. **Pastikan user authenticated:**
   - Login dahulu sebelum cuba access data
   - Check browser console untuk authentication errors

2. **Verify RLS policies:**
   - Buka Supabase → **Authentication** → **Policies**
   - Pastikan setiap table ada policies
   - Jika tidak, run migration 001 semula

3. **Temporary workaround (DEVELOPMENT ONLY):**
   - Jika nak disable RLS untuk testing:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```
   - **JANGAN BUAT INI UNTUK PRODUCTION!**

---

## Common Errors

### ❌ Error: "Tiada institusi dijumpai. Sila hubungi admin."

**Punca:** Database tidak ada institutions atau RLS block access.

**Penyelesaian:**

1. Run seed data:
```sql
-- Insert sample institutions
INSERT INTO institutions (name, type, city, state, logo_url) VALUES
  ('Universiti Teknologi Malaysia', 'university', 'Johor Bahru', 'Johor', NULL),
  ('Universiti Malaya', 'university', 'Kuala Lumpur', 'Wilayah Persekutuan', NULL),
  ('Universiti Kebangsaan Malaysia', 'university', 'Bangi', 'Selangor', NULL);
```

2. Check RLS policies untuk table `institutions` - pastikan public SELECT enabled

---

### ❌ Error: "Pendaftaran gagal" (generic error)

**Troubleshooting steps:**

1. Check browser console (`F12` → Console tab)
2. Check Network tab untuk API response
3. Common causes:
   - Institution ID tidak valid
   - Email format tidak betul
   - Password terlalu pendek (<8 characters)
   - Email sudah wujud dalam database

**Solution:**
- Fix validation errors
- Try dengan email yang berbeza
- Check Supabase logs: Dashboard → **Logs** → **API Logs**

---

### ❌ Cannot access admin panel (`/admin`)

**Punca:** User role bukan `admin`.

**Penyelesaian:**

1. Promote user ke admin menggunakan SQL:
```sql
-- Method 1: Using helper function
SELECT promote_user_to_admin('your-email@example.com');

-- Method 2: Direct update
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

2. Logout dan login semula
3. Navigate to `/admin`

**Verify:**
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

---

### ❌ Development server tidak start

**Common issues:**

1. **Port 3000 already in use:**
```bash
# Kill existing process
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

2. **Environment variables not loaded:**
```bash
# Check if .env.local exists
cat .env.local

# If not, copy from example
cp .env.local.example .env.local
# Then edit with your credentials
```

3. **Node modules issues:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 Masih Ada Masalah?

Jika masalah anda tidak ada dalam panduan ini:

1. **Check logs:**
   - Browser Console (`F12` → Console)
   - Network tab untuk API errors
   - Supabase Dashboard → Logs

2. **Verify setup:**
   - Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) semula
   - Check [SETUP_ADMIN.md](./SETUP_ADMIN.md) untuk admin setup

3. **Common debugging commands:**
```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check institutions
SELECT * FROM institutions LIMIT 5;

-- Check latest registrations
SELECT email, full_name, role, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Check auth users
SELECT email, created_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

4. **Reset database (last resort):**
   - Drop all tables di Table Editor
   - Run all migrations dari awal
   - Reseed data

---

## 📖 Useful Links

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Panduan setup lengkap
- [SETUP_ADMIN.md](./SETUP_ADMIN.md) - Panduan setup admin account
- [README.md](./README.md) - Overview & quick start
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [Supabase Docs](https://supabase.com/docs) - Official documentation

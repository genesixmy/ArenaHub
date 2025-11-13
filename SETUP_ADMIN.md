# Panduan: Membuat User & Admin Account

## 🔐 Cara Membuat User Biasa

### Langkah 1: Pastikan Email Confirmation Disabled

1. Buka Supabase Dashboard → **Authentication** → **Settings**
2. Scroll ke bahagian **Email Auth**
3. Pastikan **"Enable Email Confirmations"** adalah **OFF** (unchecked)
4. Save changes

### Langkah 2: Register User Baru

1. Buka aplikasi di browser: `http://localhost:3000`
2. Pergi ke **Register** page: `/auth/register`
3. Isi maklumat:
   - Email
   - Password
   - Full Name
   - Pilih Institution (contoh: UTM, UM, dll)
4. Klik **Daftar**
5. Anda akan dapat login terus tanpa perlu verify email

**Role default**: Semua user baru akan dapat role `student`

---

## 👑 Cara Membuat Admin Account

### Method 1: Gunakan Helper Function (DISYORKAN)

#### Langkah 1: Run Migration

1. Buka Supabase Dashboard → **SQL Editor**
2. Copy semua kandungan dari file `supabase/migrations/003_admin_helpers.sql`
3. Paste dan klik **Run**
4. Helper functions akan dibuat

#### Langkah 2: Register Account Biasa

1. Register account baru seperti biasa di `/auth/register`
2. Gunakan email yang anda nak jadikan admin (contoh: `admin@arenahub.com`)

#### Langkah 3: Promote ke Admin

1. Buka Supabase Dashboard → **SQL Editor**
2. Run query ini (gantikan email anda):

```sql
SELECT promote_user_to_admin('admin@arenahub.com');
```

3. Done! User tersebut sekarang adalah admin

#### Bonus: Tengok Semua Users

```sql
SELECT * FROM list_all_users();
```

---

### Method 2: Update Directly (ALTERNATIF)

Jika helper function tidak berfungsi, boleh update terus:

#### Langkah 1: Register Account Biasa

Register account baru di `/auth/register` dengan email yang anda nak jadikan admin

#### Langkah 2: Update Role Manually

1. Buka Supabase Dashboard → **SQL Editor**
2. Run query ini (gantikan email anda):

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'admin@arenahub.com';
```

3. Verify dengan query ini:

```sql
SELECT email, full_name, role
FROM users
WHERE email = 'admin@arenahub.com';
```

#### Langkah 3: Logout dan Login Balik

1. Logout dari aplikasi
2. Login semula dengan email admin
3. Anda sekarang ada akses admin

---

## 🎓 Cara Membuat Lecturer Account

### Option 1: Promote Terus (Untuk Testing)

```sql
SELECT promote_user_to_lecturer('lecturer@utm.my');
```

Atau:

```sql
UPDATE users
SET role = 'lecturer'
WHERE email = 'lecturer@utm.my';
```

### Option 2: Guna Sistem Permohonan (Production)

1. User register sebagai student
2. User submit lecturer application di dashboard
3. Admin approve application tersebut
4. Role akan auto-update ke `lecturer`

---

## 🔍 Troubleshooting

### Issue: "User not found" error

**Sebab**: User belum register lagi atau email salah

**Penyelesaian**:
1. Pastikan user dah register di aplikasi terlebih dahulu
2. Check email betul-betul (case sensitive)
3. List semua users untuk verify:

```sql
SELECT email, full_name, role FROM users ORDER BY created_at DESC;
```

### Issue: Role tidak berubah selepas update

**Sebab**: Browser cache atau session lama

**Penyelesaian**:
1. Logout dari aplikasi
2. Clear browser cache atau buka incognito window
3. Login balik

### Issue: RLS policy block access

**Sebab**: Row Level Security menghalang akses

**Penyelesaian**:
Run query sebagai authenticated user atau disable RLS temporarily:

```sql
-- HANYA UNTUK DEVELOPMENT - Jangan guna di production
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Update role
UPDATE users SET role = 'admin' WHERE email = 'admin@arenahub.com';

-- Enable balik RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Quick Reference: SQL Commands

### List all users

```sql
SELECT id, email, full_name, role, created_at
FROM users
ORDER BY created_at DESC;
```

### List all admins

```sql
SELECT email, full_name, created_at
FROM users
WHERE role = 'admin';
```

### List all lecturers

```sql
SELECT email, full_name, created_at
FROM users
WHERE role = 'lecturer';
```

### Count users by role

```sql
SELECT role, COUNT(*) as total
FROM users
GROUP BY role;
```

### Promote multiple users to admin

```sql
UPDATE users
SET role = 'admin'
WHERE email IN (
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
);
```

---

## 🎯 Recommended Setup untuk Development

1. **Create 1 Admin Account**
   ```sql
   SELECT promote_user_to_admin('admin@test.com');
   ```

2. **Create 2-3 Lecturer Accounts**
   ```sql
   SELECT promote_user_to_lecturer('lecturer1@utm.my');
   SELECT promote_user_to_lecturer('lecturer2@um.edu.my');
   ```

3. **Create 5-10 Student Accounts**
   - Just register normally (default role is student)

4. **Test Full Workflow**
   - Students create teams
   - Lecturers create tournaments
   - Admins manage institutions
   - Test lecturer applications

---

## 📝 Notes

- **Default role**: Semua user baru adalah `student`
- **Role types**: `student`, `lecturer`, `admin`
- **Email confirmation**: OFF untuk development, ON untuk production
- **Security**: Jangan share admin credentials
- **Best practice**: Guna email yang berbeza untuk setiap role semasa testing

---

Selamat mencuba! 🚀

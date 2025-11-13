# 📘 ArenaHub Setup Guide Lengkap

Panduan lengkap step-by-step untuk setup ArenaHub dari scratch.

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Creating First Admin User](#creating-first-admin-user)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Post-Deployment](#post-deployment)

---

## 1. Prerequisites

### Install Node.js

Download dan install Node.js 18.x atau lebih tinggi dari [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

### Install Git

Download dari [git-scm.com](https://git-scm.com/)

Verify:
```bash
git --version
```

### Create Accounts

1. **Supabase** - [supabase.com](https://supabase.com) (FREE tier)
2. **Vercel** - [vercel.com](https://vercel.com) (FREE tier)
3. **GitHub** - [github.com](https://github.com)

---

## 2. Supabase Setup

### Step 1: Create New Project

1. Login ke [app.supabase.com](https://app.supabase.com)
2. Klik **"New Project"**
3. Isi maklumat:
   - **Name:** ArenaHub (atau nama lain)
   - **Database Password:** Simpan password ini! (gunakan password manager)
   - **Region:** Singapore (paling dekat dengan Malaysia)
   - **Pricing Plan:** Free
4. Klik **"Create new project"**
5. Tunggu ~2 minit untuk setup siap

### Step 2: Get API Credentials

1. Pergi ke **Settings** (icon gear) > **API**
2. Copy dan simpan:
   - **Project URL** (contoh: `https://abcdefghijklm.supabase.co`)
   - **anon/public key** (contoh: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Run Database Migrations

#### Method 1: Via SQL Editor (Recommended)

1. Pergi ke **SQL Editor** di sidebar
2. Klik **"New query"**
3. Buka fail `supabase/migrations/001_initial_schema.sql` dari projek
4. Copy SEMUA kandungan
5. Paste ke SQL Editor
6. Klik **"Run"** atau tekan `Ctrl+Enter`
7. Tunggu sehingga selesai (akan ada green checkmark)
8. Ulangi untuk `002_seed_data.sql`

#### Verify Migration Success

Pergi ke **Table Editor**. Anda sepatutnya nampak tables:
- ✅ institutions
- ✅ users
- ✅ lecturer_applications
- ✅ tournaments
- ✅ teams
- ✅ team_members
- ✅ tournament_participants
- ✅ matches
- ✅ match_games

### Step 4: Configure Authentication

1. Pergi ke **Authentication** > **Providers**
2. Pastikan **Email** provider adalah **ENABLED** (hijau/turned on)
   - Jika tidak, klik toggle untuk enable
3. Pergi ke **Authentication** > **URL Configuration**
4. Add redirect URL untuk local development:
   ```
   http://localhost:3000/auth/callback
   ```

#### Untuk Development: Configure Email Settings

1. Pergi ke **Authentication** > **Settings**
2. **PENTING:** Pastikan **"Enable email signup"** adalah **ON** (checked) ✅
   - Tanpa ini, user tidak boleh register!
3. Cari **"Enable email confirmations"**
4. **Matikan** (turn OFF) untuk development ❌
   - Ini memudahkan testing tanpa perlu check email
5. Klik **Save**
6. **PENTING:** Untuk production, enable semula email confirmations!

### Step 5: Verify Row Level Security (RLS)

1. Pergi ke **Authentication** > **Policies**
2. Setiap table sepatutnya ada policies (dibuat via migration)
3. Verify:
   - institutions: Ada policies untuk SELECT, INSERT, UPDATE
   - users: Ada policies untuk SELECT, INSERT, UPDATE
   - Dan seterusnya...

---

## 3. Local Development Setup

### Step 1: Clone Repository

```bash
# Clone dari GitHub
git clone https://github.com/your-username/ArenaHub.git
cd ArenaHub
```

### Step 2: Install Dependencies

```bash
npm install
```

Ini akan install semua packages yang diperlukan. Proses akan ambil masa 1-3 minit.

### Step 3: Setup Environment Variables

```bash
# Copy example file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Paste credentials dari Supabase (Step 2.2)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**PENTING:**
- Jangan ada spacing atau quotes
- Jangan commit `.env.local` ke Git
- Pastikan `.env.local` ada dalam `.gitignore`

### Step 4: Run Development Server

```bash
npm run dev
```

Output sepatutnya:
```
> [email protected] dev
> next dev

   ▲ Next.js 15.1.0
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.3s
```

### Step 5: Test Application

Buka browser dan pergi ke [http://localhost:3000](http://localhost:3000)

Anda sepatutnya nampak homepage ArenaHub.

---

## 4. Creating First Admin User

Untuk mula guna platform, anda perlu buat admin user.

### Method 1: Via Supabase Dashboard (Recommended)

#### Step 1: Create Auth User

1. Pergi ke Supabase Dashboard
2. Klik **Authentication** > **Users**
3. Klik **"Add user"** > **"Create new user"**
4. Isi:
   - **Email:** admin@example.com
   - **Password:** Admin123!
   - **Auto Confirm User:** ✅ TICK ini
5. Klik **"Create user"**
6. Copy **User UID** (contoh: `550e8400-e29b-41d4-a716-446655440000`)

#### Step 2: Create User Profile

1. Pergi ke **Table Editor** > **users**
2. Klik **"Insert"** > **"Insert row"**
3. Isi:
   - **id:** Paste User UID dari step 1
   - **email:** admin@example.com
   - **full_name:** Admin ArenaHub
   - **username:** admin
   - **role:** admin (pilih dari dropdown)
   - **institution_id:** Leave NULL untuk admin
4. Klik **"Save"**

#### Step 3: Login

1. Pergi ke [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
2. Login dengan:
   - Email: admin@example.com
   - Password: Admin123!
3. Success! Anda sepatutnya masuk ke Dashboard
4. Klik **"Panel Admin"** untuk access admin features

### Method 2: Via Registration (Alternative)

1. Pergi ke [http://localhost:3000/auth/register](http://localhost:3000/auth/register)
2. Daftar account biasa (role akan jadi `student`)
3. Pergi ke Supabase Dashboard > Table Editor > users
4. Cari user yang baru didaftar
5. Edit row, tukar `role` kepada `admin`
6. Refresh page di browser

---

## 5. Testing

### Test User Flows

#### Test 1: Student Registration & Team Creation

1. Logout dari admin account
2. Register account baharu sebagai student
3. Login dengan student account
4. Dashboard > "Cipta Pasukan"
5. Isi maklumat team dan save

#### Test 2: Lecturer Application

1. Login sebagai student
2. Dashboard > "Mohon Jadi Lecturer"
3. Submit application
4. Login sebagai admin
5. Panel Admin > Review application
6. Approve application
7. Logout dan login semula sebagai student
8. Verify role dah bertukar jadi "Lecturer"

#### Test 3: Institution Management (Admin)

1. Login sebagai admin
2. Panel Admin > "Tambah Institusi Baharu"
3. Isi maklumat institusi
4. Save
5. Try register account baharu dan verify institusi baru ada dalam dropdown

### Check Database

Pergi ke Supabase Dashboard > Table Editor dan verify:
- Users table ada data
- Teams table ada data (jika dah create team)
- Institutions table ada seed data

---

## 6. Deployment

### Prepare for Production

#### 1. Update Environment Variables

Create `.env.production` atau update di Vercel later:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 2. Enable Email Confirmations (Recommended)

1. Supabase Dashboard > Authentication > Settings
2. Enable "Email confirmations"
3. Configure email templates di Authentication > Email Templates

### Deploy to Vercel

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit: ArenaHub MVP"
git push origin main
```

#### Step 2: Import to Vercel

1. Login ke [vercel.com](https://vercel.com)
2. Klik **"Add New"** > **"Project"**
3. Import GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

#### Step 3: Add Environment Variables

Dalam Vercel project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Step 4: Deploy

1. Klik **"Deploy"**
2. Tunggu ~2 minit
3. Done! App anda live di `https://your-app.vercel.app`

---

## 7. Post-Deployment

### Update Supabase Redirect URLs

1. Pergi ke Supabase Dashboard
2. Authentication > URL Configuration
3. Add production URL:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

### Create Production Admin User

Ulang Step 4 (Creating First Admin User) menggunakan production database.

### Test Production

1. Visit `https://your-app.vercel.app`
2. Register account
3. Login
4. Test all features

### Monitor

- **Vercel:** Analytics, Logs
- **Supabase:** Database Dashboard, Auth Logs

---

## 🎉 Congratulations!

ArenaHub anda sekarang dah live!

### Next Steps:

1. ✅ Tambah institusi-institusi Malaysia via Admin Panel
2. ✅ Invite lecturer untuk test
3. ✅ Create tournament pertama
4. ✅ Customize branding & colors
5. ✅ Share dengan community!

---

## ❓ Need Help?

Jika ada masalah, check:
1. [Troubleshooting](#troubleshooting) section dalam README.md
2. Supabase Logs (Dashboard > Logs)
3. Vercel Logs (Vercel Dashboard > Logs)
4. Browser Console (F12)

### Common Issues

**Database connection error**
- Check environment variables
- Verify Supabase project status
- Check RLS policies

**Auth not working**
- Verify redirect URLs
- Check email confirmation settings
- Verify middleware configuration

**Build failed on Vercel**
- Check build logs
- Verify all dependencies in package.json
- Check TypeScript errors locally: `npm run build`

---

Good luck! 🚀

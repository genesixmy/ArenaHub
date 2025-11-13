# ArenaHub

Platform pengurusan kejohanan esports yang fokus kepada sekolah dan universiti di Malaysia.

## 🎯 Objektif

ArenaHub membolehkan pelajar, guru, dan pensyarah menganjur, mengurus, dan menyertai kejohanan esports dengan sistem bracket automatik.

## ✨ Ciri-ciri Utama

### 1. User Authentication & Role Management
- 🔐 Daftar menggunakan email/password
- 👥 Tiga jenis role: `student`, `lecturer`, `admin`
- 📝 Sistem permohonan peranan lecturer
- 🛡️ Admin boleh tukar role pengguna

### 2. Institution Management
- 🏫 Student mesti pilih institusi semasa daftar
- ✅ Admin boleh tambah institusi baharu
- 📍 Sokongan untuk sekolah, universiti, dan kolej

### 3. Tournament Management
- 🏆 Lecturer & admin boleh cipta kejohanan
- 🎮 Sokong pelbagai game category
- 🔄 Auto-generate bracket (single elimination, double elimination, round robin, group stage)
- 📊 Kemaskini skor dan keputusan real-time

### 4. Team & Player Management
- ⚡ Student boleh cipta dan sertai pasukan
- 👑 Setiap pasukan ada kapten
- 🎯 Urus ahli pasukan dan roster

### 5. Branding & Personalization
- 🎨 Setiap tournament boleh custom banner & colors
- 🏢 Institusi ada halaman profil sendiri

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **Deployment:** Vercel (frontend) + Supabase (backend)
- **Version Control:** GitHub

## 📋 Prerequisites

Sebelum mula, pastikan anda ada:

- Node.js 18.x atau lebih tinggi
- npm atau yarn
- Akaun Supabase (free tier sudah mencukupi)
- Akaun Vercel (untuk deployment)

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ArenaHub.git
cd ArenaHub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

#### a. Buat Projek Supabase Baharu

1. Pergi ke [supabase.com](https://supabase.com)
2. Klik "New Project"
3. Isi maklumat projek (nama, password database, region)
4. Tunggu sehingga projek siap dibuat (~2 minit)

#### b. Run Database Migrations

1. Buka Supabase Dashboard > SQL Editor
2. Copy kandungan fail `supabase/migrations/001_initial_schema.sql`
3. Paste dan run query tersebut
4. Copy kandungan fail `supabase/migrations/002_seed_data.sql`
5. Paste dan run query tersebut

#### c. Enable Row Level Security

Row Level Security (RLS) sudah dikonfigurasi dalam migration. Pastikan ia enabled dengan pergi ke:
- Dashboard > Authentication > Policies

#### d. Configure Auth Settings

**PENTING: Ikuti langkah ini dengan teliti!**

1. Pergi ke Dashboard > Authentication > **Providers**
2. Pastikan **Email** provider adalah **ENABLED** (hijau)
3. Pergi ke Dashboard > Authentication > **Settings**
4. Pastikan **"Enable email signup"** adalah **ON** (checked) ✅
   - **Tanpa ini, registration akan error: "Email signups are disabled"**
5. Pastikan **"Enable Email Confirmations"** adalah **OFF** (unchecked) ❌ untuk development
   - Ini memudahkan testing tanpa perlu verify email
6. Klik **Save**
7. Untuk production, enable semula email confirmations

#### e. Setup Admin Account (PENTING!)

Selepas run migrations, anda perlu create admin account untuk akses penuh:

1. Run migration ketiga untuk helper functions:
   - Buka SQL Editor di Supabase
   - Copy & run `supabase/migrations/003_admin_helpers.sql`

2. Register user pertama di aplikasi (`/auth/register`)

3. Promote user tersebut ke admin:
   ```sql
   SELECT promote_user_to_admin('your-email@example.com');
   ```

📖 **Panduan lengkap**: Lihat [SETUP_ADMIN.md](./SETUP_ADMIN.md) untuk cara membuat admin, lecturer, dan user accounts.

### 4. Environment Variables

Copy `.env.local.example` ke `.env.local`:

```bash
cp .env.local.example .env.local
```

Kemudian isi dengan credentials Supabase anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Credentials boleh didapati di:
- Dashboard > Settings > API

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📁 Struktur Projek

```
ArenaHub/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── admin/             # Admin dashboard
│   │   ├── dashboard/         # User dashboard
│   │   ├── tournaments/       # Tournament pages
│   │   ├── teams/             # Team management
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── lib/                   # Utilities & helpers
│   │   ├── supabase/         # Supabase clients
│   │   ├── auth.ts           # Auth helpers
│   │   └── utils.ts          # Utility functions
│   └── types/                 # TypeScript types
│       └── database.types.ts  # Supabase generated types
├── supabase/
│   └── migrations/            # SQL migrations
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── package.json
```

## 🎮 Usage Guide

### Untuk Pelajar (Student)

1. **Daftar Akaun**
   - Pergi ke `/auth/register`
   - Isi maklumat dan pilih institusi
   - Default role: `student`

2. **Cipta Pasukan**
   - Dashboard > "Cipta Pasukan"
   - Anda akan jadi kapten
   - Jemput ahli lain

3. **Sertai Tournament**
   - Browse tournament yang tersedia
   - Daftar pasukan anda
   - Tunggu approval (jika perlu)

4. **Mohon Jadi Lecturer**
   - Dashboard > "Mohon Jadi Lecturer"
   - Isi borang permohonan
   - Admin akan review

### Untuk Lecturer

1. **Cipta Tournament**
   - Dashboard > "Cipta Tournament"
   - Set game category, format, max teams
   - Publish untuk pendaftaran

2. **Urus Tournament**
   - Lihat senarai team yang daftar
   - Generate bracket bila ready
   - Update scores dan keputusan

### Untuk Admin

1. **Lulus Permohonan Lecturer**
   - Admin Panel > "Permohonan Lecturer"
   - Review dan lulus/tolak

2. **Tambah Institusi**
   - Admin Panel > "Tambah Institusi Baharu"
   - Isi maklumat institusi

3. **Urus User Roles**
   - Admin Panel > "Urus Pengguna"
   - Tukar role mana-mana user

## 🗄️ Database Schema

### Tables

- **institutions** - Sekolah/Universiti
- **users** - User profiles (extends Supabase Auth)
- **lecturer_applications** - Permohonan lecturer
- **tournaments** - Kejohanan
- **teams** - Pasukan
- **team_members** - Ahli pasukan
- **tournament_participants** - Team dalam tournament
- **matches** - Perlawanan dalam bracket
- **match_games** - Individual games dalam best-of series

Untuk schema lengkap, lihat `supabase/migrations/001_initial_schema.sql`.

## 🚀 Deployment

### Deploy ke Vercel

1. Push code ke GitHub repository

2. Pergi ke [vercel.com](https://vercel.com)

3. Import projek GitHub anda

4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (production URL)

5. Deploy!

### Update Supabase Redirect URLs

Selepas deploy, update redirect URLs di Supabase:

1. Dashboard > Authentication > URL Configuration
2. Tambah production URL ke "Redirect URLs":
   ```
   https://your-app.vercel.app/auth/callback
   ```

## 🔒 Security Best Practices

1. **NEVER** commit `.env.local` ke Git
2. Enable Row Level Security (RLS) di Supabase
3. Use service role key hanya untuk server-side operations
4. Validate semua input di server-side
5. Enable email confirmations untuk production

## 🐛 Troubleshooting

### ❌ Common Issues

**"Email signups are disabled"**
- Enable email signup di Supabase Dashboard > Authentication > Providers & Settings
- Lihat panduan lengkap di [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**"Invalid API Key"**
- Pastikan environment variables betul
- Check spacing dan hidden characters
- Restart dev server selepas update .env.local

**"Institution not found"**
- Run seed migration (002_seed_data.sql)
- Atau tambah institusi via Admin Panel

**Auth tidak berfungsi**
- Check Supabase auth settings
- Verify RLS policies enabled
- Check middleware configuration

### 📖 Panduan Lengkap

Untuk troubleshooting lengkap dan penyelesaian masalah lain, lihat:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Panduan penyelesaian masalah lengkap
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup guide step-by-step
- [SETUP_ADMIN.md](./SETUP_ADMIN.md) - Panduan setup admin account

## 📝 TODO (Future Features)

- [ ] Tournament bracket visualization
- [ ] Live match updates
- [ ] Team chat/messaging
- [ ] Player statistics dashboard
- [ ] Email notifications
- [ ] File uploads untuk team logos & banners
- [ ] Tournament registration approval workflow
- [ ] Match scheduling system
- [ ] Leaderboard & rankings

## 🤝 Contributing

Pull requests are welcome! Untuk major changes, sila buka issue terlebih dahulu untuk discuss.

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

Untuk soalan atau bantuan:
- Open GitHub Issue
- Email: support@arenahub.example.com

---

**Built with ❤️ for Malaysian Esports Community**

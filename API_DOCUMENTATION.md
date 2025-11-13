# 📚 ArenaHub API Documentation

Dokumentasi lengkap untuk Server Actions dan Database Operations.

## 🏗️ Architecture

ArenaHub menggunakan:
- **Next.js 15 App Router** dengan Server Actions
- **Supabase** untuk database dan authentication
- **Row Level Security (RLS)** untuk data protection

## 🔐 Authentication

### Server Actions (`src/app/auth/actions.ts`)

#### `registerUser(formData)`

Daftar user baharu dan buat profile.

**Parameters:**
```typescript
{
  email: string;
  password: string;
  fullName: string;
  institutionId: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  data?: { user: User };
}
```

**Process:**
1. Create auth user via Supabase Auth
2. Generate unique username from name + user ID
3. Create user profile in `users` table
4. Default role: `student`

**Example:**
```typescript
const result = await registerUser({
  email: '[email protected]',
  password: 'secure123',
  fullName: 'Ahmad Abdullah',
  institutionId: 'uuid-here'
});
```

---

#### `loginUser(formData)`

Login user dengan email & password.

**Parameters:**
```typescript
{
  email: string;
  password: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  data?: AuthResponse;
}
```

**Example:**
```typescript
const result = await loginUser({
  email: '[email protected]',
  password: 'secure123'
});
```

---

#### `logoutUser()`

Logout current user.

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Example:**
```typescript
const result = await logoutUser();
```

---

#### `submitLecturerApplication(formData)`

Submit permohonan untuk jadi lecturer.

**Parameters:**
```typescript
{
  fullName: string;
  institutionId: string;
  phoneNumber: string;
  staffId?: string;
  department?: string;
  reason?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Validation:**
- User mesti login
- Tidak boleh ada pending application

**Example:**
```typescript
const result = await submitLecturerApplication({
  fullName: 'Dr. Ahmad',
  institutionId: 'uuid',
  phoneNumber: '0123456789',
  staffId: 'STAFF001',
  department: 'Computer Science'
});
```

---

## 👑 Admin Operations

### Server Actions (`src/app/admin/actions.ts`)

#### `approveLecturerApplication(applicationId)`

Lulus permohonan lecturer.

**Authorization:** Admin only

**Parameters:**
```typescript
applicationId: string
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Process:**
1. Update application status to `approved`
2. Set `reviewed_by` dan `reviewed_at`
3. Update user role to `lecturer`

**Example:**
```typescript
const result = await approveLecturerApplication('app-uuid');
```

---

#### `rejectLecturerApplication(applicationId, reason?)`

Tolak permohonan lecturer.

**Authorization:** Admin only

**Parameters:**
```typescript
applicationId: string;
reason?: string;
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Example:**
```typescript
const result = await rejectLecturerApplication(
  'app-uuid',
  'Maklumat tidak lengkap'
);
```

---

#### `createInstitution(formData)`

Tambah institusi baharu.

**Authorization:** Admin only

**Parameters:**
```typescript
{
  name: string;
  type: string;  // 'university' | 'college' | 'school'
  city?: string;
  state?: string;
  description?: string;
}
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  data?: Institution;
}
```

**Validation:**
- Nama institusi mesti unique
- Auto-generate slug dari nama

**Example:**
```typescript
const result = await createInstitution({
  name: 'Universiti Teknologi Malaysia',
  type: 'university',
  city: 'Johor Bahru',
  state: 'Johor'
});
```

---

#### `updateUserRole(userId, newRole)`

Tukar role user.

**Authorization:** Admin only

**Parameters:**
```typescript
userId: string;
newRole: 'student' | 'lecturer' | 'admin';
```

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

**Example:**
```typescript
const result = await updateUserRole('user-uuid', 'lecturer');
```

---

## 🗄️ Database Schema

### Tables Overview

| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| institutions | Sekolah/Universiti | ✅ |
| users | User profiles | ✅ |
| lecturer_applications | Permohonan lecturer | ✅ |
| tournaments | Kejohanan | ✅ |
| teams | Pasukan | ✅ |
| team_members | Ahli pasukan | ✅ |
| tournament_participants | Team dalam tournament | ✅ |
| matches | Perlawanan | ✅ |
| match_games | Individual games | ✅ |

### Row Level Security Policies

#### institutions

**SELECT:** Public (semua boleh view)
**INSERT:** Admin only
**UPDATE:** Admin only

#### users

**SELECT:** Public
**INSERT:** Own profile only (auth.uid() = id)
**UPDATE:** Own profile OR admin

#### lecturer_applications

**SELECT:** Own applications OR admin
**INSERT:** Own application only
**UPDATE:** Admin only (untuk approve/reject)

#### tournaments

**SELECT:** Public
**INSERT:** Lecturer or Admin
**UPDATE:** Organizer or Admin

#### teams

**SELECT:** Public
**INSERT:** Any authenticated user (captain_id = auth.uid())
**UPDATE:** Team captain only

#### team_members

**SELECT:** Public
**INSERT:** Team captain only
**DELETE:** Team captain only

#### tournament_participants

**SELECT:** Public
**INSERT:** Team captain (to register team)

#### matches & match_games

**SELECT:** Public
**INSERT/UPDATE/DELETE:** Tournament organizer or Admin

---

## 📊 Database Types

### User Roles

```typescript
type UserRole = 'student' | 'lecturer' | 'admin';
```

**Permissions:**
- **student:** Cipta team, join tournament, apply lecturer
- **lecturer:** Semua student + cipta tournament
- **admin:** Full access

### Application Status

```typescript
type ApplicationStatus = 'pending' | 'approved' | 'rejected';
```

### Tournament Status

```typescript
type TournamentStatus =
  | 'draft'         // Belum publish
  | 'registration'  // Buka pendaftaran
  | 'ongoing'       // Sedang berlangsung
  | 'completed'     // Selesai
  | 'cancelled';    // Dibatalkan
```

### Bracket Type

```typescript
type BracketType =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'group_stage';
```

### Match Status

```typescript
type MatchStatus =
  | 'scheduled'
  | 'ongoing'
  | 'completed'
  | 'cancelled';
```

---

## 🔧 Helper Functions

### Authentication Helpers (`src/lib/auth.ts`)

#### `getCurrentUser()`

Get current user profile (server-side only).

**Returns:** `User | null`

**Example:**
```typescript
const user = await getCurrentUser();
if (!user) {
  redirect('/auth/login');
}
```

---

#### `requireRole(allowedRoles)`

Require specific role(s) for access.

**Parameters:** `UserRole[]`

**Returns:** `User` (throws error if unauthorized)

**Example:**
```typescript
const user = await requireRole(['lecturer', 'admin']);
// User confirmed to have lecturer or admin role
```

---

#### `requireAdmin()`

Require admin role.

**Returns:** `User` (throws error if not admin)

**Example:**
```typescript
const admin = await requireAdmin();
// User confirmed to be admin
```

---

#### `requireLecturerOrAdmin()`

Require lecturer or admin role.

**Returns:** `User`

**Example:**
```typescript
const user = await requireLecturerOrAdmin();
// User can create tournaments
```

---

## 🛠️ Utility Functions (`src/lib/utils.ts`)

### `generateSlug(text: string): string`

Generate URL-friendly slug.

**Example:**
```typescript
generateSlug('Universiti Teknologi Malaysia')
// Output: 'universiti-teknologi-malaysia'
```

---

### `formatDate(date: string | Date): string`

Format date to Malaysian format.

**Example:**
```typescript
formatDate('2025-01-15')
// Output: '15 Januari 2025'
```

---

### `formatDateTime(date: string | Date): string`

Format datetime to Malaysian format with time.

**Example:**
```typescript
formatDateTime('2025-01-15T14:30:00')
// Output: '15 Jan 2025, 14:30'
```

---

### `formatCurrency(amount: number, currency?: string): string`

Format currency to MYR.

**Example:**
```typescript
formatCurrency(1000)
// Output: 'RM1,000.00'
```

---

### `getInitials(name: string): string`

Get initials from name (for avatars).

**Example:**
```typescript
getInitials('Ahmad Abdullah')
// Output: 'AA'
```

---

## 🔄 Database Triggers & Functions

### Auto-updated Fields

#### `updated_at` Trigger

Automatically update `updated_at` field pada UPDATE.

**Tables affected:**
- institutions
- users
- lecturer_applications
- tournaments
- teams
- matches

---

### `auto_add_captain_as_member`

Automatically add team captain as member when team is created.

**Trigger:** AFTER INSERT on `teams`

**Process:**
1. Team created dengan `captain_id`
2. Trigger auto-create entry dalam `team_members`
3. Captain role = 'captain'

---

## 🎯 Best Practices

### Server Actions

1. **Always validate input** sebelum database operations
2. **Check permissions** using auth helpers
3. **Return consistent response format**:
   ```typescript
   { success: boolean, error?: string, data?: any }
   ```
4. **Use revalidatePath** after mutations
5. **Handle errors gracefully**

### Database Queries

1. **Use RLS policies** untuk security
2. **Select only needed columns**:
   ```typescript
   .select('id, name, email')  // Good
   .select('*')                 // Avoid if possible
   ```
3. **Use indexes** (already created in migration)
4. **Handle null values** properly

### Client Components

1. **Validate on client** sebelum server action
2. **Show loading states**
3. **Use toast notifications** untuk feedback
4. **Handle errors** dari server actions

---

## 📝 Example Implementations

### Creating a Tournament (Future Feature)

```typescript
// Server Action
export async function createTournament(formData: TournamentFormData) {
  try {
    // 1. Check permissions
    const user = await requireLecturerOrAdmin();

    // 2. Validate input
    if (!formData.title || !formData.game_category) {
      return { success: false, error: 'Required fields missing' };
    }

    // 3. Generate slug
    const slug = generateSlug(formData.title);

    // 4. Insert to database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        ...formData,
        slug,
        organizer_id: user.id,
        institution_id: user.institution_id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // 5. Revalidate
    revalidatePath('/tournaments');

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Unauthorized` | Not logged in | Redirect to login |
| `Permission denied` | Insufficient role | Show error message |
| `Unique constraint violation` | Duplicate entry | Validate before insert |
| `Foreign key violation` | Referenced record missing | Check relationships |
| `RLS policy violation` | RLS blocking access | Check RLS policies |

### Error Response Format

```typescript
{
  success: false,
  error: "Human-readable error message"
}
```

---

## 📞 Support

Untuk bantuan atau soalan:
- Check troubleshooting di README.md
- Review Supabase logs
- Check browser console
- Open GitHub issue

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0-MVP

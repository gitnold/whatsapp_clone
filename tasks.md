# WhatsApp Clone — Group Chat App

#### design link
https://stitch.withgoogle.com/projects/1836804140770117650

## Tech Stack

- **Framework**: Next.js 16.2.10 (App Router, React 19.2)
- **Auth**: Supabase Auth (Google OAuth + email/password)
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS v4
- **Realtime**: Supabase Realtime (planned)

---

## Completed

### Database Schema (`src/db/schema.ts`)
- [x] `users` — id, email, fullName, avatarUrl, timestamps
- [x] `groups` — id, name, description, avatarUrl, createdBy, timestamps
- [x] `groupMembers` — id, groupId, userId, role, joinedAt (indexed)
- [x] `messages` — id, groupId, userId, content, createdAt (indexed)
- [x] `typingIndicators` — id, groupId, userId, isTyping, updatedAt

### Auth System
- [x] Supabase server client (`src/lib/supabase/server.ts`)
- [x] Supabase browser client (`src/lib/supabase/client.ts`)
- [x] Auth server actions (`src/app/actions/auth.ts`) — signup, login, logout, Google OAuth, getCurrentUser
- [x] Route protection proxy (`src/app/proxy.ts`) — Next.js 16 style (not middleware)

### Pages
- [x] Login page (`src/app/login/page.tsx`) — email/password + Google OAuth
- [x] Register page (`src/app/register/page.tsx`) — full name, email, password + Google OAuth
- [x] Root page (`src/app/page.tsx`) — redirects to /chat
- [x] Chat root page (`src/app/chat/page.tsx`) — sidebar + empty state
- [x] Group chat page (`src/app/chat/[groupId]/page.tsx`) — sidebar + messages + input

### Server Actions
- [x] Auth actions (`src/app/actions/auth.ts`)
- [x] Group actions (`src/app/actions/groups.ts`) — create, list, get, join, leave, search users, add member

### Components (created, need full implementation)
- [x] `ChatSidebar.tsx` — group list sidebar
- [x] `ChatMessages.tsx` — message list display
- [x] `MessageInput.tsx` — message composer
- [x] `EmptyChat.tsx` — referenced but not yet created
- [x] `GroupHeader.tsx` — referenced but not yet created

### Styling
- [x] WhatsApp theme CSS variables (`src/app/globals.css`)
- [x] Chat background pattern
- [x] Message bubble arrows
- [x] Typing indicator animation

---

## Pending

### Missing Components
- [x] `EmptyChat.tsx` — empty state when no group is selected
- [x] `GroupHeader.tsx` — group name, member count, settings button

### Group Management
- [x] Create group modal/form (currently redirects inline via server action)
- [x] Group info/settings page — view members, edit group, add/remove members
- [x] Member search + invite flow
- [x] Group admin role management (promote/demote)
- [x] Leave group confirmation dialog

### Realtime Features
- [ ] Supabase Realtime subscription for new messages
- [ ] Live typing indicators (send/receive)
- [ ] Online/offline status indicators
- [ ] Unread message counts (persisted)

### UI Polish
- [ ] Responsive design (mobile-first, collapsible sidebar)
- [ ] Message timestamps (relative: "today", "yesterday", date)
- [ ] Message grouping (consecutive messages from same user)
- [ ] Scroll-to-bottom on new message
- [ ] Group avatar upload (Supabase Storage)
- [ ] User avatar upload
- [ ] Emoji picker for messages
- [ ] Image/file sharing in messages

### Auth Polish
- [ ] Supabase Auth callback route handler (`/auth/callback`)
- [ ] Password reset flow
- [ ] Email confirmation handling
- [ ] Profile editing page

### Database
- [x] Run `drizzle-kit generate` and `drizzle-kit push` to apply schema
- [ ] Seed script for development

### Infrastructure
- [ ] Supabase project setup (URL + anon key in .env.local)
- [ ] Supabase Auth providers configured (Google OAuth)
- [ ] Supabase Realtime enabled for messages table
- [ ] Row Level Security (RLS) policies on all tables

### Testing
- [ ] Unit tests for server actions
- [ ] Component tests
- [ ] E2E auth flow tests

---

## File Structure

```
src/
├── app/
│   ├── actions/
│   │   ├── auth.ts              # signup, login, logout, Google OAuth
│   │   └── groups.ts            # CRUD groups, members, messages
│   ├── chat/
│   │   ├── [groupId]/
│   │   │   └── page.tsx         # group chat view
│   │   └── page.tsx             # chat root (group list)
│   ├── login/
│   │   └── page.tsx             # login form
│   ├── register/
│   │   └── page.tsx             # registration form
│   ├── globals.css              # WhatsApp theme
│   ├── layout.tsx               # root layout
│   ├── page.tsx                 # redirects to /chat
│   └── proxy.ts                 # auth route protection
├── components/
│   ├── ChatSidebar.tsx          # group list sidebar
│   ├── ChatMessages.tsx         # message list
│   ├── MessageInput.tsx         # message composer
│   ├── EmptyChat.tsx            # empty state (TODO)
│   └── GroupHeader.tsx          # group info header (TODO)
├── db/
│   ├── index.ts                 # drizzle client
│   └── schema.ts                # all table definitions
└── lib/
    ├── definitions.ts           # shared TypeScript types
    └── supabase/
        ├── client.ts            # browser Supabase client
        └── server.ts            # server Supabase client
```

---

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
```

---

## Getting Started

1. Create a Supabase project at https://supabase.com
2. Enable Google OAuth provider in Supabase Dashboard > Authentication > Providers
3. Copy project URL and anon key to `.env.local`
4. Copy database connection string to `.env.local`
5. Run `npm run db:push` to apply schema
6. Run `npm run dev` to start development server

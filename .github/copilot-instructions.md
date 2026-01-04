# AI Coding Assistant Instructions for Universal Inc. Tattoo Platform

## Project Overview
This is a full-stack tattoo artist directory and booking platform built with modern TypeScript. It connects customers with tattoo artists, featuring artist profiles, portfolio galleries, booking systems, reviews, and payment processing.

## Architecture
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS + Shadcn/ui components
- **Backend**: Node.js + Express + tRPC + TypeScript
- **Database**: MySQL + Drizzle ORM with migrations
- **Auth**: OAuth integration (Manus platform)
- **Payments**: Stripe with webhooks
- **Storage**: AWS S3 for portfolio images
- **AI Features**: OpenAI LLM, image generation, voice transcription
- **Maps**: Google Maps API for location-based artist search
- **Email**: Resend for notifications and artist invitations

## Key Directories & Files
- `client/src/` - React frontend with pages, components, hooks
- `server/` - Backend API with tRPC routers, database operations
- `shared/` - TypeScript types, constants, and utilities
- `drizzle/` - Database schema and migrations
- `server/_core/` - Core backend utilities (auth, env, LLM, etc.)
- `client/public/tattoo-shops.csv` - CSV data for Louisiana tattoo shops

## Development Workflow
```bash
# Start development server (hot reload)
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Update database schema
pnpm db:push
```

## Code Patterns & Conventions

### Database Operations
- Use `getDb()` for lazy database connection in `server/db.ts`
- Follow Drizzle patterns with `eq`, `and`, `or` for queries
- Schema uses camelCase columns, auto-increment IDs
- Relations use foreign keys to `users.id` and `artists.id`

### API Layer (tRPC)
- Define routers in `server/routers.ts` with `publicProcedure`/`protectedProcedure`
- Use Zod schemas for input validation
- Protected procedures check `ctx.user` for authentication
- Client calls via `trpc.[router].[procedure].useQuery/useMutation`

### Authentication
- OAuth flow redirects unauthorized users to login
- `TRPCClientError` with `UNAUTHED_ERR_MSG` triggers login redirect
- User context available in protected procedures as `ctx.user`
- OAuth callbacks handled at `/api/oauth/callback`

### UI Components
- Use Shadcn/ui components from `client/src/components/ui/`
- Follow existing patterns: `Card`, `Button`, `Dialog`, etc.
- Responsive design with Tailwind classes
- Dark theme support via `ThemeProvider`
- Cyberpunk neon design theme (purple/green gradients, glow effects)
- **Color Palette**:
  - Primary: Bright neon green (`oklch(0.70 0.25 150)`)
  - Secondary: Electric purple (`oklch(0.65 0.28 300)`)
  - Accent: Neon magenta (`oklch(0.75 0.30 330)`)
  - Background: Deep dark purple-black (`oklch(0.12 0.02 270)`)
  - Destructive: Neon red-orange (`oklch(0.60 0.25 25)`)
- **Typography**: Orbitron (headings) + Rajdhani (body) fonts
- **Effects**: Grid background pattern, neon glow effects, interactive button animations

### AI Features
- LLM chat: Use `invokeLLM()` from `server/_core/llm.ts`
- Image generation: Use `generateImage()` from `server/_core/imageGeneration.ts`
- Voice transcription: Use transcription service from `server/_core/voiceTranscription.ts`
- Message format: `{role, content}` with streaming support via Streamdown

### Maps Integration
- Google Maps API via `server/_core/map.ts`
- Use `makeRequest<T>()` for geocoding and places API calls
- Array parameters separated by `|` in API calls

### File Structure
- Components: `client/src/components/[ComponentName].tsx`
- Pages: `client/src/pages/[PageName].tsx`
- Hooks: `client/src/hooks/` or `client/src/_core/hooks/`
- Server utils: `server/_core/[utility].ts`
- Shared code: `shared/[category]/[file].ts`

### Subscription Tiers
- Free tier: 3 portfolio photos, limited features
- Premium tier: unlimited photos, booking acceptance, analytics
- Check limits via `getTierLimits(tier)` from `shared/tierLimits.ts`
- Show `UpgradePrompt` component for restricted features

### Review System
- Reviews with photos, helpful votes, artist responses
- Verified booking badges for authentic reviews
- Filtering by rating, sorting by recency/helpfulness
- Artist response capability (premium feature)

### Error Handling
- tRPC errors automatically redirect to login for auth issues
- Use try/catch in database operations
- Log errors to console with descriptive messages
- Webhook signature verification for Stripe payments

### Environment Variables
- Database: `DATABASE_URL`
- AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- OpenAI: `OPENAI_API_KEY`
- Email: `RESEND_API_KEY`
- Maps: `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`
- OAuth: `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`

## Common Tasks

### Adding a New API Endpoint
1. Add procedure to router in `server/routers.ts`
2. Implement database function in `server/db.ts`
3. Call from client using `trpc.[router].[procedure]`

### Creating a New Page
1. Add component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update navigation in `Header.tsx`

### Adding Database Schema Changes
1. Update `drizzle/schema.ts`
2. Run `pnpm db:push` to generate and apply migrations
3. Update TypeScript types (auto-generated)

### Implementing AI Features
- Use `invokeLLM()` from `server/_core/llm.ts` for chat
- Use `generateImage()` for AI image generation
- Use transcription service for voice-to-text
- Follow Message interface: `{role, content}`

### Adding Email Notifications
- Use `sendEmail()` from `server/email.ts`
- Templates for invitations, confirmations, receipts
- Resend service for reliable delivery

### Testing
- Use Vitest for unit tests
- Follow existing test patterns in test files
- Mock tRPC calls and database operations
- UAT tests in `tests/uat/` for end-to-end validation

## Important Notes
- Always use absolute paths with aliases (`@`, `@shared`)
- Database connections are lazy-loaded; handle null returns
- Stripe webhooks must be registered before Express JSON middleware
- OAuth callbacks are handled at `/api/oauth/callback`
- Free tier artists have feature restrictions - check `tierLimits.ts`
- Use `superjson` transformer for complex data types in tRPC
- CSV data import available for bulk artist/shop data
- Notification system for admin alerts via `notifyOwner()`
- Booking system supports pending/confirmed/cancelled/completed statuses</content>
<parameter name="filePath">c:\Users\dillo\OneDrive\Documents\GitHub\unversalinc.pro\.github\copilot-instructions.md
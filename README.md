# Trading Study Tracker

A comprehensive study management system built for futures traders to organize daily study routines, track recurring tasks, manage hierarchical goals, and monitor progress.

## Features

### 📋 Task Management
- **Recurring Tasks**: Create tasks with flexible recurrence patterns
  - Daily tasks
  - Weekly tasks (specific days)
  - Monthly tasks (specific day of month)
  - Custom intervals (every N days)
- **Task Completion**: Mark tasks complete with optional notes
- **Task History**: View completion history for each task

### 🎯 Goal Management
- **Hierarchical Goals**: Create parent goals with sub-tasks and checkpoints
- **Goal Types**:
  - **Quantitative**: Track numeric progress (e.g., "Study 10 hours")
  - **Qualitative**: Track status (Not Started, In Progress, Completed)
- **Goal Scopes**: Daily, Weekly, Monthly, and Yearly goals
- **Progress Tracking**: Visual progress bars and status indicators

### 📊 Progress & Analytics
- **Streak Tracking**: Monitor current and longest study streaks
- **Completion Calendar**: Visual calendar showing completed days
- **Trend Charts**: 30-day completion trends
- **Statistics**:
  - Total tasks completed
  - Average completions per day
  - Most productive day of the week
  - Current streak and longest streak

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Toast Notifications**: Success and error notifications
- **Loading States**: Skeleton screens during data fetching
- **Error Boundaries**: Graceful error handling

## Tech Stack

### Frontend
- **Next.js 16** with App Router
- **React 19** with Server Components
- **TypeScript** (strict mode)
- **TailwindCSS 4** with custom design tokens
- **Shadcn/ui** components
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Drizzle ORM** for type-safe database queries
- **PostgreSQL** (Neon serverless)
- **Server Actions** for API operations
- **Zod** for validation

### Development
- **ESLint** + **Prettier** for code quality
- **pnpm** for package management
- **Next.js Turbopack** for fast development

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd academy
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="your_postgresql_connection_string"
```

4. Run database migrations:
```bash
pnpm drizzle-kit push
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── actions/              # Server actions
│   │   ├── tasks.ts         # Task CRUD operations
│   │   ├── goals.ts         # Goal CRUD operations
│   │   └── analytics.ts     # Analytics queries
│   ├── tasks/               # Tasks page
│   ├── goals/               # Goals page
│   ├── progress/            # Progress page
│   └── page.tsx             # Main dashboard
├── components/
│   ├── ui/                  # Base UI components
│   ├── dashboard/           # Dashboard-specific components
│   ├── tasks/               # Task management components
│   ├── goals/               # Goal management components
│   ├── progress/            # Progress visualization components
│   ├── task-card.tsx        # Task display component
│   ├── goal-card.tsx        # Goal display component
│   ├── streak-calendar.tsx  # Calendar component
│   ├── progress-chart.tsx   # Chart component
│   └── ...
├── db/
│   ├── schema.ts            # Database schema
│   ├── drizzle.ts           # Database connection
│   └── migrations/          # Migration files
└── lib/
    ├── types.ts             # TypeScript types
    ├── dates.ts             # Date utilities
    ├── recurrence.ts        # Task recurrence logic
    └── progress.ts          # Progress calculations
```

## Usage

### Creating a Task

1. Navigate to the Tasks page
2. Click "Create Task"
3. Enter task details:
   - Title and description
   - Select recurrence pattern (daily, weekly, monthly, or custom)
   - Preview upcoming occurrences
4. Click "Create Task"

### Creating a Goal

1. Navigate to the Goals page
2. Click "Create Goal"
3. Enter goal details:
   - Title and description
   - Select goal type (quantitative or qualitative)
   - Set scope (daily, weekly, monthly, or yearly)
   - For quantitative: set target value and unit
   - For qualitative: set initial status
   - Optionally select a parent goal
   - Set start and end dates
4. Click "Create Goal"

### Completing a Task

1. From the dashboard, click the checkbox next to a task
2. Optionally add notes about the completion
3. Click "Complete Task"
4. Your streak will automatically update

### Viewing Progress

1. Navigate to the Progress page
2. View:
   - Current and longest streaks
   - Monthly completion calendar
   - 30-day trend chart
   - Active goal progress
   - Overall statistics

## Code Conventions

This project follows strict coding conventions documented in `CLAUDE.md`:

- TypeScript with full type coverage
- Arrow functions only
- Interfaces for objects, types for unions
- No default exports
- Server Components by default
- Client Components marked with `"use client"`
- Standardized API response format
- TSDoc comments for functions

## Database Schema

### Tables

1. **tasks** - Recurring study tasks
2. **taskCompletions** - Task completion records
3. **goals** - Hierarchical goals
4. **goalProgress** - Goal progress history
5. **streaks** - Streak tracking (singleton)

See `PLAN.md` for detailed schema documentation.

## API Routes

All API operations use Next.js Server Actions:

- `/app/actions/tasks.ts` - Task operations
- `/app/actions/goals.ts` - Goal operations
- `/app/actions/analytics.ts` - Analytics operations

## Contributing

1. Follow the code conventions in `CLAUDE.md`
2. Use the existing design system (custom Tailwind tokens)
3. Write TypeScript with proper types
4. Add TSDoc comments for functions
5. Test all features before submitting

## License

MIT

## Acknowledgments

- Built with Next.js 16 and React 19
- UI components from Shadcn/ui
- Icons from Lucide React
- Charts from Recharts

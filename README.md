# Daybook

Honest daily reflection — track your energy and output over time, without the noise.

**Live app:** [daybookhere.vercel.app](https://daybookhere.vercel.app/)

Daybook is a small, focused habit-tracking app. Each day you log how much energy you had, how much you got done, and whether you remained  stuck to your routine. Over time, it surfaces plain-language patterns from that data, no streaks to game, just a clear record.

## Features

- **Daily check-in** : Rate energy and output (1–5), note whether today matched your routine, and add an optional comment. One check-in per day.
- **Routine lock** : Set your anchor tasks for the week; once saved, the list locks for 7 days so you can't second-guess it mid-week.
- **History** : Browse past check-ins, most recent first.
- **Patterns** : AI-generated insights (via the Claude API) that read your check-in history and surface a plain-English observation, once you have enough data logged.
- **Settings** : See routine lock status and clear your local data.
- **Local-first storage** : Check-ins and routines are stored in `localStorage`; nothing leaves your browser except the anonymized data sent to generate a Patterns insight.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for unit/component tests
- [Anthropic API](https://docs.claude.com/) for the Patterns insight endpoint
- Deployed on [Vercel](https://vercel.com/)

## Getting started

### Prerequisites

- Node.js 18.18+
- An [Anthropic API key](https://console.anthropic.com/) if you want the Patterns feature to work locally

### Setup

```bash
git clone https://github.com/waleeja07-wk/daybook.git
cd daybook
npm install
```

Create a `.env.local` file in the project root:

```bash
ANTHROPIC_API_KEY=your-api-key-here
# Optional — defaults to claude-sonnet-4-5
ANTHROPIC_MODEL=claude-sonnet-4-5
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

### Build

```bash
npm run build
npm run start
```

## Project structure

```
app/
  page.tsx           # Today — daily check-in form / confirmation
  routine/           # Weekly routine editor (7-day lock)
  history/           # Past check-ins
  patterns/          # AI-generated insights
  settings/          # Routine status + data controls
  api/insights/      # Route that calls the Anthropic API
components/          # UI components (forms, panels, nav)
src/lib/storage.ts   # localStorage read/write helpers
src/types/           # Shared CheckIn / Routine types
```

## How data works

All check-in and routine data lives in the browser's `localStorage` — there's no database and no account system. The `/api/insights` route accepts your check-in history, forwards it to Claude to generate a short pattern observation, and returns that text; it does not persist anything server-side.

## License

MIT — see [LICENSE](./LICENSE).

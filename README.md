# Daybook

Honest daily reflection — track your energy and output over time, without the noise.

**Live app:** [daybookhere.vercel.app](https://daybookhere.vercel.app/)

Daybook is a small, focused habit-tracking app. Each day you log how much energy you had, how much you got done, and whether you stuck to your routine. Over time, it surfaces plain-language patterns from that data, no streaks to game, just a clear record.

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

6/6 tests passing across `src/lib/storage.test.ts` and `components/CheckInForm.test.tsx`.

**Note on test output:** if you see a `SyntaxError` printed in the terminal while tests run, that's expected — it's `console.error` output from `storage.test.ts`'s `"returns an empty list when stored check-ins are invalid JSON"` test. It intentionally writes malformed JSON into `localStorage` and asserts that `getAllCheckIns()` catches the parse failure and falls back to `[]` instead of crashing the app. The test still passes; the logged error is evidence the error handling works, not a failure.

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

## AI integration

The Patterns page calls `POST /api/insights` with the user's recent check-ins (date, energy level, output level, routine match, optional note). The route validates the payload server-side, requires at least 3 check-ins before calling out to Claude (`MIN_CHECK_INS`), and asks the model for a short, plain-English observation about the data — not advice, not a score, just a pattern worth noticing.

**Failure handling:** if the API key is missing, the upstream call fails, or Claude returns something that doesn't match the expected shape, the route returns a typed error (`MISSING_API_KEY`, `UPSTREAM_ERROR`, `INVALID_RESPONSE`, etc.) rather than a raw 500, and the Patterns page shows a calm fallback message instead of crashing.

## Deployment checklist

- **Environment variables:** `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) must be set in Vercel → Project Settings → Environment Variables. They are read server-side only and never exposed to the client.
- **Secrets hygiene:** `.env.local` is git-ignored and has never been committed (verified with `git log --all -- .env.local`).
- **AI failure mode:** if `/api/insights` fails for any reason (bad/missing key, upstream error, malformed response), the Patterns page falls back to a plain "couldn't generate an insight right now" message rather than an unhandled error.
- **Rollback plan:** revert the last commit on `main` (`git revert <sha>` or `git reset --hard <sha>` + force-push) — Vercel auto-redeploys on push to `main`.

## Known limitations / future improvements

- Data is local to a single browser — no sync across devices, no accounts.
- Patterns insights require a minimum of 3 check-ins before they'll generate.
- No offline queueing for the insights call; a failed request simply shows the fallback state until retried.

## License

MIT — see [LICENSE](./LICENSE).

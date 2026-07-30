# WorkFlow.md — AI-Assisted Workflow Drill 

## Setup
Feature: Settings form for the FlyRank capstone. Which was built twice on separate branches
`settingForm-v1` & `settingForm-v2` to compare a vague prompt against
a well-specified one.

## Round One: "build a setting form with validation"
A single-sentence prompt with no file references, no explicit field list, and no
verification step. The AI (Cursor Agent) produced a fully working form with:
- Fields: display name, email, bio, timezone, plus two notification checkboxes
- react-hook-form + zod validation
- Accessibility: `aria-labelledby` sections, `role="status"`/`role="alert"` for
  submit feedback, a screen-reader-only `<legend>`, and focus-visible outlines
  on interactive elements
- Loading/success/error UI states

**Honest note:** this round was less "vague" than was supposed to be. Because the prompt
named "validation" explicitly, and because Cursor had already been used earlier
in this project with `.cursor/rules/project.mdc` establishing react-hook-form +
zod as a convention, the AI produced production-quality output on the first try.
This weakened the intended contrast between rounds — the real lesson here was
about how much context does project rules provide, even to a "quick" prompt.

## Round Two: precise prompt
This prompt specified exactly two fields (name, email) explicitly required
react-hook-form + zod, referenced the project's rules file, and included a
verification step ("write it, then write tests and run them").

Result: a narrower form (2 fields vs. 4+) but with an accompanying test suite
(`SettingsForm.test.tsx`) that Round One never got, since Round One's prompt
never asked for tests.

## Concrete differences (from `git diff`)

1. **Scope control.** Round One's AI guessed at reasonable-seeming extra fields
   (bio, timezone, marketing emails) that were never requested. Round Two
   produced exactly what was asked for, nothing more. This is a real tradeoff:
   vague prompts can over-deliver in ways that add unreviewed surface to a
   codebase; precise prompts stay contained but require the developer to specify
   everything.

2. **Tests.** `git diff` shows `components/SettingsForm.test.tsx` as a new file
   only on the v2 branch (`new file mode 100644`). Round One shipped with zero
   automated tests.

3. **AI mistake #1 — import/export mismatch.** After merging Round Two's
   component, `app/settings/page.tsx` threw a runtime error: *"Element type is
   invalid... you might have mixed up default and named imports."* The AI had
   written `import { SettingsForm } from "@/components/SettingsForm"` (named
   import) against a component that used `export default`. Fixed by changing
   the import to `import SettingsForm from "@/components/SettingsForm"`.

4. **AI mistake #2 — wrong relative import path.** The generated test file
   imported the component via `"../SettingsForm"`, which assumes the test lives
   one directory below the component (a common `__tests__/` convention). Since
   the test file was placed directly alongside the component in `components/`,
   the correct path was `"./SettingsForm"`. This caused Vitest to fail with
   "Failed to resolve import" until corrected.

## Review effort
Round One: near-zero review effort — accepted as-is per the assignment's design.
Round Two: required diagnosing and fixing two real bugs before `npm run dev` and
`npm run test` succeeded. Total added time: roughly 30-40 min
beyond the initial code generation.

## Takeaway
The clearest lesson from this drill wasn't "vague prompt = bad code" — in this
case Round One's output was solid. It was that **precise prompts trade breadth
for reliability**: Round Two did exactly what was asked, included tests by
default, but still contained integration bugs that only surfaced when actually
wired into the rest of the app. Verification (running the dev server and the
test suite) — not the prompt's precision alone — is what caught both bugs.

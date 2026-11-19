# Hebrew Date Converter – project rules

Home assignment: a screen that receives a Gregorian date and converts it to a Hebrew date
using Hebcal's Hebrew Date Converter API (https://www.hebcal.com/converter).

## Rules

- Vanilla HTML/CSS/JS only. No frameworks, no build step, no npm dependencies.
- Files:
  - `index.html` – markup + small inline CSS.
  - `hebcal.js` – everything that knows about the Hebcal API.
  - `app.js` – form handling and DOM updates only.
- Load `hebcal.js` and `app.js` as two classic `<script>` tags (`hebcal.js` first).
  NOT ES modules, so `index.html` also works when opened directly from disk (`file://`).
- UI text is Hebrew: `<html lang="he" dir="rtl">`. Code, comments and commit messages are English.
- Always use `textContent`, never `innerHTML`, for anything coming from the API.
- Keep the code short and readable. The author must be able to explain every line on video.
- After each task: list exactly what to test manually. Do not commit until the author confirms.

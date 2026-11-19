# Hebrew Date Converter

A small web page. You choose a Gregorian date, and it shows the Hebrew date. It uses the Hebcal Hebrew Date Converter REST API (a web service that answers requests sent to a URL).

**[Live demo](https://oratia7.github.io/hebrew-date-converter/)** · [Repository](https://github.com/OrAtia7/hebrew-date-converter)

## How it works

- **`index.html`** – the page itself: the Hebrew right-to-left layout (date field, before/after sunset switch, result card) and the CSS styles.
- **`hebcal.js`** – the only file that talks to Hebcal. It builds the request URL, sends the request with a time limit, checks the answer, and turns problems into errors that `app.js` can tell apart. It returns `{ hebrew, gy, gm, gd, afterSunset }`.
- **`app.js`** – the user interface only. It handles the form, locks it while waiting, and shows the result or a clear error message.

The two scripts are loaded with normal `<script>` tags (not ES modules). Because of this, the page also works when you open the file directly from your computer.

## Run locally

Nothing to install, and no build step. Open `index.html` in a browser.

You need a modern browser (Chrome 103+, Firefox 100+, Safari 16+), because the code uses `AbortSignal.timeout`.

## Example

| Input | Hebrew date | Line under it |
|---|---|---|
| 2011-06-02, before sunset | כ״ט בְּאִיָיר תשע״א | 2 ביוני 2011, לפני השקיעה |
| 2011-06-02, after sunset | א׳ בְּסִיוָן תשע״א | 2 ביוני 2011, אחרי השקיעה |

The page shows the Hebrew date exactly as Hebcal sends it, including the vowel marks (niqqud) on the month name.
After-sunset results are shown in a dark "dusk" card with a moon icon.

## Design decisions

- **After-sunset option.** In the Hebrew calendar, a new day starts at sunset. So an evening date belongs to the next Hebrew day. A two-button switch (two radio buttons) lets the user choose. "After sunset" sends `gs=on` to Hebcal.
- **The result describes itself.** The line under the Hebrew date ("2 ביוני 2011, אחרי השקיעה") and the day/dusk style are built from Hebcal's *answer*, not from the form. So they always describe the date that was really converted. When the user changes the date or the switch, the old result disappears.
- **Today's date by default.** The date field starts with today's *local* date. We do not use `toISOString()`, because it uses UTC time. In Israel, it would still give yesterday's date until 2–3 AM.
- **The form locks while waiting.** During a request, the date field, the switch and the button are disabled. This stops double clicks from sending two requests, and it shows clearly that the page is working. A `finally` block unlocks them again, and the keyboard focus goes back to where it was.
- **8-second time limit.** `fetch` gets `AbortSignal.timeout(8000)`. If Hebcal does not answer in 8 seconds, the request stops and the user sees a clear message.
- **The answer is checked.** `hebcal.js` checks that every field we use is there and has the right type (text for the Hebrew date, whole numbers for the year, month and day). Data from an outside service should never be trusted without a check.
- **A clear message for each problem.**
  - Invalid date (HTTP 400): "התאריך לא תקין. בדוק אותו ונסה שוב."
  - No answer in time: "השירות לא הגיב בזמן. נסה שוב."
  - No connection: "לא הצלחנו להמיר את התאריך. בדוק את החיבור ונסה שוב."
  - Server error or a broken answer: "השירות לא זמין כרגע. נסה שוב מאוחר יותר."
- **All API code is in `hebcal.js`.** Only this file knows the URL, the parameter names and the shape of the JSON answer.
- **Safe output.** Everything from the API is put on the page with `textContent`, never `innerHTML`. So text from the API can never run as code.
- **Years 0–99 bug (found in testing).** `Date.UTC(50, ...)` changes the years 0–99 into 1900–1999, so a date in the year 50 showed "1950". The code now uses `setUTCFullYear`, which keeps the year as it is.
- **Hebcal's strict mode does not reject every invalid date (found in testing).** The docs say `strict=1` gives error 400 for invalid dates. But `2011-02-30` is not rejected: Hebcal quietly converts 2 March 2011 instead. Only text in a wrong format, like `abc`, gets a 400. The browser's date picker cannot create a date like 30 February. And because the line under the result comes from Hebcal's answer, it would still show the date that was really converted ("2 במרץ 2011").

## Tests

There are 5 unit tests (small automatic checks of one function). They use Node's built-in test runner, so there is nothing to install (Node 18 or newer):

```
npm test
```

- 2 tests check the request URL that `buildConverterUrl` builds.
- 3 tests check `getHebrewDate` with a fake `fetch`, so they do not need the internet: a good answer, an HTTP 400 error, and an answer with missing fields.

## Why the REST API and not the `@hebcal/core` JS library?

Hebcal suggests its `@hebcal/core` library for JavaScript apps, and the library would even work offline. But the assignment points to the REST API, and the goal here is to connect to an outside service: build the request, handle time limits and HTTP errors, and check the answer. All the API code is in `hebcal.js`, so moving to the library later would change only that one file.

## Attribution

Hebrew date conversion by [Hebcal.com](https://www.hebcal.com). Hebcal content is licensed under
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

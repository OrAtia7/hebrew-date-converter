# Hebrew Date Converter

A small web page that converts a Gregorian date to a Hebrew date using Hebcal's Hebrew Date Converter REST API.

**[Live demo](https://oratia7.github.io/hebrew-date-converter/)** · [Repository](https://github.com/OrAtia7/hebrew-date-converter)

## How it works

- **`index.html`** – the page: Hebrew RTL markup (date field, "after sunset" checkbox, result area) and inline CSS.
- **`hebcal.js`** – everything that knows about the Hebcal API: builds the request URL, calls it with a timeout,
  turns HTTP errors into errors the UI can tell apart, and returns `{ hebrew, gy, gm, gd, afterSunset }`.
- **`app.js`** – the UI only: handles the form, locks it during the request, and shows the result or a user-friendly error.

The two scripts are plain `<script>` tags (not ES modules), so the page also works when opened directly from disk.

## Run locally

No install and no build step. Open `index.html` in a browser.

## Example

| Input | Result |
|---|---|
| 2011-06-02 | 2 ביוני 2011: כ״ט בְּאִיָיר תשע״א |
| 2011-06-02, after sunset | 2 ביוני 2011 (אחרי השקיעה): א׳ בְּסִיוָן תשע״א |

The Hebrew date is displayed exactly as Hebcal returns it, including niqqud on the month name.

## Design decisions

- **After-sunset option.** The Hebrew day starts at sunset, so an evening date belongs to the next Hebrew day.
  The checkbox sends `gs=on` to Hebcal.
- **Self-describing result.** The label ("2 ביוני 2011 (אחרי השקיעה)") is built from the API *response*, not from
  the form, so it always describes the date that was actually converted. Changing the inputs clears the old result.
- **Form locking.** While a request is running, the date field, checkbox and button are disabled. This prevents
  double submits and makes the loading state visible. They are re-enabled in a `finally` block.
- **8-second timeout.** `fetch` gets `AbortSignal.timeout(8000)`, so a hanging request ends with a clear
  message instead of an endless "loading".
- **Clear error messages.** HTTP 400 (invalid date), timeout and network failure each get their own message.
- **API code isolated in `hebcal.js`.** Only this file knows the URL, the parameter names and the JSON shape.
- **Safe output.** Everything from the API is written with `textContent`, never `innerHTML`.

## Tests

The URL builder has unit tests using Node's built-in test runner (Node 18+, no dependencies):

```
npm test
```

## Why the REST API and not the `@hebcal/core` JS library?

Hebcal recommends its `@hebcal/core` library for JavaScript apps, and it would work offline. But the assignment points
to the REST API, and the goal here is integrating with an external service: building the request, handling timeouts
and HTTP errors, and validating the response. Because all API code lives in `hebcal.js`, switching to the library
later would only change that one file.

## Attribution

Hebrew date conversion by [Hebcal.com](https://www.hebcal.com). Hebcal content is licensed under
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

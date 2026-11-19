// Everything that knows about the Hebcal Hebrew Date Converter API lives here.
// Docs: https://www.hebcal.com/home/219/hebrew-date-converter-rest-api

const HEBCAL_CONVERTER_URL = 'https://www.hebcal.com/converter';
const REQUEST_TIMEOUT_MS = 8000;

// Builds the request URL for a Gregorian date string in "YYYY-MM-DD" format.
function buildConverterUrl(date, afterSunset) {
  const params = new URLSearchParams({
    date: date,
    cfg: 'json', // return JSON instead of HTML
    g2h: '1',    // convert Gregorian to Hebrew
    strict: '1', // return 400 for a malformed date (overflow dates like 2011-02-30 still roll over)
  });
  if (afterSunset) {
    params.set('gs', 'on'); // after sunset the Hebrew day has already moved to the next day
  }
  return `${HEBCAL_CONVERTER_URL}?${params}`;
}

// Calls the API and returns the converted date, e.g.
// { hebrew: "א׳ בְּסִיוָן תשע״א", gy: 2011, gm: 6, gd: 2, afterSunset: true }
//
// Errors the caller can tell apart:
//   - error.name === 'TimeoutError'  no answer within REQUEST_TIMEOUT_MS
//   - error.status (e.g. 400)        Hebcal answered with an HTTP error
//   - TypeError                      network failure (offline, DNS, CORS)
async function getHebrewDate(date, afterSunset) {
  const response = await fetch(buildConverterUrl(date, afterSunset), {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS), // abort the request if it takes too long
  });

  if (!response.ok) {
    const body = await response.text().catch(() => ''); // for debugging only
    console.error('Hebcal HTTP error', response.status, body);
    const error = new Error(`Hebcal request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  if (!data.hebrew) {
    throw new Error('Hebcal response is missing the "hebrew" field');
  }

  // The Gregorian fields come from the response, not from the form,
  // so they always describe the date that was actually converted.
  return {
    hebrew: data.hebrew,
    gy: data.gy,
    gm: data.gm,
    gd: data.gd,
    afterSunset: data.afterSunset,
  };
}

// Lets Node tests require this file. In the browser `module` doesn't exist, so this is skipped.
if (typeof module !== "undefined") module.exports = { buildConverterUrl, getHebrewDate };

// This file is the only place that talks to the Hebcal API.
// API docs: https://www.hebcal.com/home/219/hebrew-date-converter-rest-api

const HEBCAL_CONVERTER_URL = 'https://www.hebcal.com/converter';
const REQUEST_TIMEOUT_MS = 8000; // wait at most 8 seconds for an answer

// Makes the full request URL.
// date: a Gregorian date as text, like "2011-06-02".
// afterSunset: true if the time is after sunset.
function buildConverterUrl(date, afterSunset) {
  const params = new URLSearchParams({
    date: date,
    cfg: 'json', // we want the answer as JSON (data), not as a web page
    g2h: '1',    // convert Gregorian to Hebrew
    strict: '1', // answer with error 400 if the date text has a bad format.
                 // Note: a date like 2011-02-30 is NOT rejected. Hebcal moves it to 2 March.
  });
  if (afterSunset) {
    params.set('gs', 'on'); // after sunset, the Hebrew day has already changed to the next day
  }
  return `${HEBCAL_CONVERTER_URL}?${params}`;
}

// Checks that the answer has every field we use, with the right type.
function isValidConversion(data) {
  return Boolean(data)
    && typeof data.hebrew === 'string' && data.hebrew !== ''
    && Number.isInteger(data.gy)
    && Number.isInteger(data.gm)
    && Number.isInteger(data.gd)
    && typeof data.afterSunset === 'boolean';
}

// Asks Hebcal to convert the date and returns the answer, for example:
// { hebrew: "א׳ בְּסִיוָן תשע״א", gy: 2011, gm: 6, gd: 2, afterSunset: true }
//
// If something goes wrong, it throws an error. The caller can tell the errors apart:
//   - error.name is 'TimeoutError'  -> no answer within 8 seconds
//   - error.status is set (like 400) -> Hebcal answered with an HTTP error code
//   - the error is a TypeError       -> could not reach the server (for example, offline)
//   - any other error                -> the answer was broken or incomplete
async function getHebrewDate(date, afterSunset) {
  // AbortSignal.timeout cancels the request if it takes longer than the limit.
  const response = await fetch(buildConverterUrl(date, afterSunset), {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // response.ok is false for HTTP error codes, like 400 or 500.
  if (!response.ok) {
    const body = await response.text().catch(() => ''); // read the error text, only for the console
    console.error('Hebcal HTTP error', response.status, body);
    const error = new Error(`Hebcal request failed with status ${response.status}`);
    error.status = response.status; // keep the code, so app.js can choose the right message
    throw error;
  }

  const data = await response.json(); // turn the JSON text into a JavaScript object
  if (!isValidConversion(data)) {
    throw new Error('Hebcal response is missing fields or has wrong types');
  }

  // Return only the fields we need. The Gregorian date comes from the answer,
  // not from the form, so the screen always shows the date Hebcal really converted.
  return {
    hebrew: data.hebrew,
    gy: data.gy,
    gm: data.gm,
    gd: data.gd,
    afterSunset: data.afterSunset,
  };
}

// This line lets the Node tests load this file.
// In the browser, `module` does not exist, so the line does nothing.
if (typeof module !== "undefined") module.exports = { buildConverterUrl, getHebrewDate };

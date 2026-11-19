// Everything that knows about the Hebcal Hebrew Date Converter API lives here.
// Docs: https://www.hebcal.com/home/219/hebrew-date-converter-rest-api

const HEBCAL_CONVERTER_URL = 'https://www.hebcal.com/converter';

// Builds the request URL for a Gregorian date string in "YYYY-MM-DD" format.
function buildConverterUrl(date) {
  const params = new URLSearchParams({
    date: date,
    cfg: 'json', // return JSON instead of HTML
    g2h: '1',    // convert Gregorian to Hebrew
    strict: '1', // reject invalid dates instead of guessing
  });
  return `${HEBCAL_CONVERTER_URL}?${params}`;
}

// Calls the API and returns the Hebrew date as a string, e.g. "כ״ט בְּאִיָיר תשע״א".
async function getHebrewDate(date) {
  const response = await fetch(buildConverterUrl(date));
  if (!response.ok) {
    throw new Error(`Hebcal request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.hebrew) {
    throw new Error('Hebcal response is missing the "hebrew" field');
  }
  return data.hebrew;
}

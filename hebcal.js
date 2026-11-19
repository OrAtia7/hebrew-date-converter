// Everything that knows about the Hebcal Hebrew Date Converter API lives here.
// Docs: https://www.hebcal.com/home/219/hebrew-date-converter-rest-api

const HEBCAL_CONVERTER_URL = 'https://www.hebcal.com/converter';

// Builds the request URL for a Gregorian date string in "YYYY-MM-DD" format.
function buildConverterUrl(date, afterSunset) {
  const params = new URLSearchParams({
    date: date,
    cfg: 'json', // return JSON instead of HTML
    g2h: '1',    // convert Gregorian to Hebrew
    strict: '1', // reject invalid dates instead of guessing
  });
  if (afterSunset) {
    params.set('gs', 'on'); // after sunset the Hebrew day has already moved to the next day
  }
  return `${HEBCAL_CONVERTER_URL}?${params}`;
}

// Calls the API and returns the converted date, e.g.
// { hebrew: "א׳ בְּסִיוָן תשע״א", gy: 2011, gm: 6, gd: 2, afterSunset: true }
async function getHebrewDate(date, afterSunset) {
  const response = await fetch(buildConverterUrl(date, afterSunset));
  if (!response.ok) {
    throw new Error(`Hebcal request failed with status ${response.status}`);
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

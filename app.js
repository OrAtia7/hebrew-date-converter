// Form handling and DOM updates only. API logic lives in hebcal.js.

const form = document.getElementById('converter-form');
const dateInput = document.getElementById('gregorian-date');
const sunsetCheckbox = document.getElementById('after-sunset');
const result = document.getElementById('result');

// Formats a date like "2 ביוני 2011". UTC on both sides, so the user's
// timezone can never shift the day.
const gregorianFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

// Builds e.g. "2 ביוני 2011 (אחרי השקיעה): א׳ בְּסִיוָן תשע״א"
function describeConversion(conversion) {
  // setUTCFullYear rather than Date.UTC: Date.UTC turns years 0-99 into 1900-1999.
  const date = new Date(0);
  date.setUTCFullYear(conversion.gy, conversion.gm - 1, conversion.gd); // JS months start at 0
  let label = gregorianFormatter.format(date);
  if (conversion.afterSunset) {
    label += ' (אחרי השקיעה)';
  }
  return `${label}: ${conversion.hebrew}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  try {
    const conversion = await getHebrewDate(dateInput.value, sunsetCheckbox.checked);
    result.textContent = describeConversion(conversion);
  } catch (error) {
    console.error(error);
    result.textContent = 'לא הצלחנו להמיר את התאריך. נסה שוב.';
  }
});

// A shown result belongs to the old inputs, so clear it as soon as they change.
function clearResult() {
  result.textContent = '';
}
dateInput.addEventListener('input', clearResult);
sunsetCheckbox.addEventListener('change', clearResult);

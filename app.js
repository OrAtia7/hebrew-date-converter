// Form handling and DOM updates only. API logic lives in hebcal.js.

const form = document.getElementById('converter-form');
const dateInput = document.getElementById('gregorian-date');
const sunsetCheckbox = document.getElementById('after-sunset');
const convertButton = document.getElementById('convert-button');
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

// Turns an error from getHebrewDate into a message for the user.
function errorMessage(error) {
  if (error.status === 400) {
    return 'התאריך לא תקין. בדוק אותו ונסה שוב.';
  }
  if (error.name === 'TimeoutError') {
    return 'השירות לא הגיב בזמן. נסה שוב.';
  }
  return 'לא הצלחנו להמיר את התאריך. בדוק את החיבור ונסה שוב.';
}

// Shows text in the result box. `kind` is a CSS class: '' (success), 'loading' or 'error'.
function showResult(text, kind) {
  result.textContent = text;
  result.className = kind;
}

// Locks the form while a request is running, which also blocks double submits.
function setFormDisabled(disabled) {
  dateInput.disabled = disabled;
  sunsetCheckbox.disabled = disabled;
  convertButton.disabled = disabled;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  showResult('ממיר תאריך…', 'loading');
  setFormDisabled(true);

  try {
    const conversion = await getHebrewDate(dateInput.value, sunsetCheckbox.checked);
    showResult(describeConversion(conversion), '');
  } catch (error) {
    console.error(error);
    showResult(errorMessage(error), 'error');
  } finally {
    setFormDisabled(false); // runs after success and after failure
    dateInput.focus(); // disabling the form dropped focus; give it back for keyboard users
  }
});

// A shown result belongs to the old inputs, so clear it as soon as they change.
function clearResult() {
  showResult('', '');
}
dateInput.addEventListener('input', clearResult);
sunsetCheckbox.addEventListener('change', clearResult);

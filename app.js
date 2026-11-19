// Form handling and DOM updates only. API logic lives in hebcal.js.

const form = document.getElementById('converter-form');
const dateInput = document.getElementById('gregorian-date');
const sunsetFieldset = document.getElementById('sunset-fieldset');
const afterSunsetRadio = document.getElementById('after-sunset');
const convertButton = document.getElementById('convert-button');
const statusMessage = document.getElementById('status');
const resultCard = document.getElementById('result');
const resultHebrew = document.getElementById('result-hebrew');
const resultContext = document.getElementById('result-context');

// "YYYY-MM-DD" in the user's LOCAL timezone. (toISOString() uses UTC,
// so in Israel it would still show yesterday between midnight and 2-3 AM.)
function toLocalIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0'); // JS months start at 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
dateInput.value = toLocalIsoDate(new Date()); // default to today

// Formats a date like "2 ביוני 2011". UTC on both sides, so the user's
// timezone can never shift the day.
const gregorianFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

// Builds e.g. "2 ביוני 2011, אחרי השקיעה" from the API response, not from the form.
function describeContext(conversion) {
  // setUTCFullYear rather than Date.UTC: Date.UTC turns years 0-99 into 1900-1999.
  const date = new Date(0);
  date.setUTCFullYear(conversion.gy, conversion.gm - 1, conversion.gd); // JS months start at 0
  const timeOfDay = conversion.afterSunset ? 'אחרי השקיעה' : 'לפני השקיעה';
  return `${gregorianFormatter.format(date)}, ${timeOfDay}`;
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

// Shows a loading or error message. `kind` is a CSS class: '', 'loading' or 'error'.
function showStatus(text, kind) {
  statusMessage.textContent = text;
  statusMessage.className = kind;
}

// Fills the result card and shows it. After sunset it switches to the dark "dusk" theme.
function showConversion(conversion) {
  resultHebrew.textContent = conversion.hebrew;
  resultContext.textContent = describeContext(conversion);
  resultCard.classList.toggle('dusk', conversion.afterSunset === true);
  resultCard.hidden = false;
}

// A shown result belongs to the old inputs, so clear it as soon as they change.
function clearResult() {
  showStatus('', '');
  resultCard.hidden = true;
}

// Locks the form while a request is running, which also blocks double submits.
function setFormDisabled(disabled) {
  dateInput.disabled = disabled;
  sunsetFieldset.disabled = disabled; // disables both radios at once
  convertButton.disabled = disabled;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  clearResult();
  showStatus('ממיר תאריך…', 'loading');
  setFormDisabled(true);

  try {
    const conversion = await getHebrewDate(dateInput.value, afterSunsetRadio.checked);
    showStatus('', '');
    showConversion(conversion);
  } catch (error) {
    console.error(error);
    showStatus(errorMessage(error), 'error');
  } finally {
    setFormDisabled(false); // runs after success and after failure
    dateInput.focus(); // disabling the form dropped focus; give it back for keyboard users
  }
});

dateInput.addEventListener('input', clearResult);
sunsetFieldset.addEventListener('change', clearResult); // fires when either radio is picked

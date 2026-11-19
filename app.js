// This file handles the form and updates the page.
// It does not know anything about the Hebcal API. That is in hebcal.js.

// Find the page elements once, at the start.
const form = document.getElementById('converter-form');
const dateInput = document.getElementById('gregorian-date');
const sunsetFieldset = document.getElementById('sunset-fieldset');
const afterSunsetRadio = document.getElementById('after-sunset');
const convertButton = document.getElementById('convert-button');
const statusMessage = document.getElementById('status');
const resultCard = document.getElementById('result');
const resultHebrew = document.getElementById('result-hebrew');
const resultContext = document.getElementById('result-context');

// Turns a date into "YYYY-MM-DD" text, using the user's LOCAL time.
// (We do not use toISOString(), because it uses UTC time. In Israel, it would
// still give yesterday's date between midnight and 2-3 AM.)
function toLocalIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0'); // in JavaScript, January is month 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
dateInput.value = toLocalIsoDate(new Date()); // start with today's date

// Writes a date in Hebrew, like "2 ביוני 2011".
// Both the date and the formatter use UTC time, so the user's time zone
// can never move the date to the day before or after.
const gregorianFormatter = new Intl.DateTimeFormat('he-IL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

// Makes the line under the Hebrew date, like "2 ביוני 2011, אחרי השקיעה".
// It uses the API answer, not the form, so it always matches the converted date.
function describeContext(conversion) {
  // We use setUTCFullYear and not Date.UTC, because Date.UTC changes
  // the years 0-99 into 1900-1999 (year 50 would become 1950).
  const date = new Date(0);
  date.setUTCFullYear(conversion.gy, conversion.gm - 1, conversion.gd); // January is month 0
  const timeOfDay = conversion.afterSunset ? 'אחרי השקיעה' : 'לפני השקיעה';
  return `${gregorianFormatter.format(date)}, ${timeOfDay}`;
}

// Chooses the message the user sees for each kind of error.
function errorMessage(error) {
  if (error.status === 400) {
    return 'התאריך לא תקין. בדוק אותו ונסה שוב.';
  }
  if (error.name === 'TimeoutError') {
    return 'השירות לא הגיב בזמן. נסה שוב.';
  }
  if (error instanceof TypeError) { // fetch could not reach the server
    return 'לא הצלחנו להמיר את התאריך. בדוק את החיבור ונסה שוב.';
  }
  return 'השירות לא זמין כרגע. נסה שוב מאוחר יותר.'; // server error or a broken answer
}

// Shows a loading message or an error message.
// `kind` is a CSS class that sets the style: '' (none), 'loading' or 'error'.
function showStatus(text, kind) {
  statusMessage.textContent = text;
  statusMessage.className = kind;
}

// Puts the answer into the result card and shows the card.
// After sunset, the card uses the dark "dusk" style.
function showConversion(conversion) {
  resultHebrew.textContent = conversion.hebrew;
  resultContext.textContent = describeContext(conversion);
  resultCard.classList.toggle('dusk', conversion.afterSunset);
  resultCard.hidden = false;
}

// Hides the old result and any message.
// We call it when the user changes the date or the sunset option,
// because the old result no longer matches what the form shows.
function clearResult() {
  showStatus('', '');
  resultCard.hidden = true;
}

// Locks (or unlocks) the form while we wait for the answer.
// A locked button cannot be clicked twice, so we never send two requests.
function setFormDisabled(disabled) {
  dateInput.disabled = disabled;
  sunsetFieldset.disabled = disabled; // this locks both radio buttons at once
  convertButton.disabled = disabled;
}

// Runs when the user clicks the button (or presses Enter).
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  const focusedBefore = document.activeElement; // the element the user was on: the button, or the date field
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
    // "finally" runs after success and after an error.
    setFormDisabled(false);
    focusedBefore.focus(); // locking the form removed the focus, so give it back to the same element
  }
});

dateInput.addEventListener('input', clearResult);
sunsetFieldset.addEventListener('change', clearResult); // runs when either radio button is picked

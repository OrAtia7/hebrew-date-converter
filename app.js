// Form handling and DOM updates only. API logic lives in hebcal.js.

const form = document.getElementById('converter-form');
const dateInput = document.getElementById('gregorian-date');
const result = document.getElementById('result');

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the browser from reloading the page

  try {
    const hebrewDate = await getHebrewDate(dateInput.value);
    result.textContent = hebrewDate;
  } catch (error) {
    console.error(error);
    result.textContent = 'לא הצלחנו להמיר את התאריך. נסה שוב.';
  }
});

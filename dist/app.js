'use strict';

const answerDetails = [...document.querySelectorAll('#practice details.answer')];
const answerButton = document.querySelector('#toggle-answers');
const updateAnswerButton = () => {
  if (!answerButton) return;
  const allOpen = answerDetails.every((item) => item.open);
  answerButton.setAttribute('aria-expanded', String(allOpen));
  answerButton.querySelector('span').textContent = allOpen ? '전체 해설 접기' : '전체 해설 펼치기';
};
if (answerButton) {
  answerButton.addEventListener('click', () => {
    const expand = !answerDetails.every((item) => item.open);
    for (const item of answerDetails) item.open = expand;
    updateAnswerButton();
  });
  for (const item of answerDetails) item.addEventListener('toggle', updateAnswerButton);
}

let printState = null;
const expandForPrint = () => {
  if (printState) return;
  printState = [...document.querySelectorAll('details')].map((item) => [item, item.open]);
  for (const [item] of printState) item.open = true;
};
const restoreAfterPrint = () => {
  if (!printState) return;
  for (const [item, open] of printState) item.open = open;
  printState = null;
  updateAnswerButton();
};
window.addEventListener('beforeprint', expandForPrint);
window.addEventListener('afterprint', restoreAfterPrint);
document.querySelector('#print')?.addEventListener('click', () => {
  expandForPrint();
  window.print();
  restoreAfterPrint();
});

const currentPage = location.pathname.split('/').pop() || 'index.html';
for (const link of document.querySelectorAll('.sidebar nav a')) {
  const active = link.getAttribute('href') === currentPage;
  link.classList.toggle('active', active);
  if (active) link.setAttribute('aria-current', 'page');
}

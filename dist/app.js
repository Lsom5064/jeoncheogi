'use strict';

const answerDetails = [...document.querySelectorAll('#practice details.answer')];
const answerButton = document.querySelector('#toggle-answers');
const updateAnswerButton = () => {
  const allOpen = answerDetails.every((item) => item.open);
  answerButton.setAttribute('aria-expanded', String(allOpen));
  answerButton.querySelector('span').textContent = allOpen ? '전체 해설 접기' : '전체 해설 펼치기';
};
answerButton.addEventListener('click', () => {
  const expand = !answerDetails.every((item) => item.open);
  for (const item of answerDetails) item.open = expand;
  updateAnswerButton();
});
for (const item of answerDetails) item.addEventListener('toggle', updateAnswerButton);

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
document.querySelector('#print').addEventListener('click', () => {
  expandForPrint();
  window.print();
  restoreAfterPrint();
});

const navLinks = [...document.querySelectorAll('.sidebar nav a')];
const navSections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
let scrollPending = false;
const updateActiveSection = () => {
  let current = navSections[0];
  for (const section of navSections) {
    if (section.getBoundingClientRect().top <= 180) current = section;
  }
  for (const link of navLinks) {
    const active = link.getAttribute('href') === `#${current.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scrollPending = false;
};
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateActiveSection);
  }
}, { passive: true });
updateActiveSection();

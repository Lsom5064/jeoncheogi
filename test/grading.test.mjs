import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import '../dist/grading.js';
import {baseGrading,additionalQuestions} from '../content/questions.mjs';

const {grade,pickExam,summarize}=globalThis.LessonGrading;
const cases=[
  ['(과목코드, 학번)',baseGrading[1],'correct'],
  ['학번, 과목코드, 성적',baseGrading[1],'incorrect'],
  ['기본키 일부인 과목코드에 부분 함수 종속이 존재한다.',baseGrading[2],'correct'],
  ['과목코드에 부분 함수 종속이 존재하지 않는다.',baseGrading[2],'review'],
  ['부분종속',baseGrading[2],'review'],
  ['7 회',baseGrading[4],'correct'],
  ['-7',baseGrading[4],'incorrect'],
  ['7 or 8',baseGrading[4],'incorrect'],
  ['0.3',baseGrading[5],'incorrect'],
  ['단위 -> 통합 -> 시스템 -> 인수',baseGrading[9],'correct'],
  ['인수 시스템 통합 단위',baseGrading[9],'incorrect'],
  ['factory-method pattern',baseGrading[11],'correct'],
  ['가용성, 무결성, 기밀성',baseGrading[14],'correct'],
  ['not RBAC',baseGrading[16],'incorrect'],
  ['1, 2',baseGrading[19],'correct'],
  ['1 2',baseGrading[19],'incorrect'],
  ['[2,4,6]',baseGrading[21],'correct'],
  ['2,4,6',baseGrading[21],'incorrect'],
  ['DB 80.0',baseGrading[23],'correct'],
  ['SUBJECT AVG_SCORE\nDB 80.00',baseGrading[23],'correct'],
  ['DB 80 OS 77.5',baseGrading[23],'incorrect'],
  ['DB 8',baseGrading[23],'incorrect'],
  ['',baseGrading[24],'unanswered']
];
for (const [answer,rule,status] of cases) assert.equal(grade(answer,rule).status,status,answer);
for (const question of additionalQuestions) assert.equal(grade(question.expected,question.grading).status,'correct',`Expected answer ${question.id}`);
const context={window:{}};
runInNewContext(readFileSync(new URL('../dist/question-bank.js',import.meta.url),'utf8'),context);
const builtBank=context.window.LESSON_BANK;
assert.equal(builtBank.length,90);
assert.equal(new Set(builtBank.map((question)=>question.id)).size,90);
const generatedPages=readdirSync(new URL('../dist/',import.meta.url)).filter((file)=>file.endsWith('.html'));
assert.equal(generatedPages.filter((file)=>/^day-2026-10-\d{2}\.html$/.test(file)).length,21);
for (let day=5;day<=25;day++) {
  const date=`2026-10-${String(day).padStart(2,'0')}`;
  const page=readFileSync(new URL(`../dist/day-${date}.html`,import.meta.url),'utf8');
  assert.match(page,/오늘 배울 내용/);
  assert.match(page,/오늘의 직접 풀이/);
  assert.match(page,/data-question-id=/,`Daily practice questions ${date}`);
  assert.match(page,/<article class="daily-topic">/,`Daily theory topics ${date}`);
}
const firstDay=readFileSync(new URL('../dist/day-2026-10-05.html',import.meta.url),'utf8');
assert.match(firstDay,/커버리지와 MC\/DC/);
assert.match(firstDay,/JOIN과 결과 행 수/);
for (const slug of ['db','sql','c','java','python','network-os','sw-dev','sw-design','security-newtech']) {
  assert.ok(generatedPages.includes(`theory-${slug}.html`),`Theory route ${slug}`);
  assert.ok(generatedPages.includes(`practice-${slug}.html`),`Practice route ${slug}`);
}
assert.doesNotMatch(readFileSync(new URL('../dist/index.html',import.meta.url),'utf8'),/정처기 감자 참고/);
assert.match(builtBank.find((question)=>question.id===2).bodyHtml,/수강\(학번/);
assert.doesNotMatch(builtBank.find((question)=>question.id===2).bodyHtml,/1번 릴레이션/);
for (const question of builtBank) {
  assert.ok(question.bodyHtml&&question.answerHtml,`Question content ${question.id}`);
  assert.equal(grade(question.expected,question.grading).status,'correct',`Built expected answer ${question.id}`);
}
const pdfSet=pickExam(builtBank,'pdf-variant-1');
assert.deepEqual(Array.from(pdfSet,(question)=>question.id),Array.from({length:20},(_,i)=>61+i));
assert.equal(context.window.LESSON_EXAMS[0].ids.length,20);
assert.equal(summarize(pdfSet,Object.fromEntries(pdfSet.map((question)=>[question.id,question.expected]))).score,100);
assert.equal(summarize(pdfSet,{}).unanswered,20);
assert.equal(grade('4 32',pdfSet.find((question)=>question.id===71).grading).status,'incorrect');
assert.equal(grade('4 3 2',pdfSet.find((question)=>question.id===78).grading).status,'correct');
assert.equal(grade('32',additionalQuestions.find((question)=>question.id===53).grading).status,'incorrect');
assert.equal(grade('3    2',additionalQuestions.find((question)=>question.id===53).grading).status,'correct');
assert.equal(grade('A B',additionalQuestions.find((question)=>question.id===52).grading).status,'incorrect');
const sample=[{id:1,domain:'DB',grading:baseGrading[1]},{id:2,domain:'DB',grading:baseGrading[2]}];
assert.equal(summarize(sample,{1:'학번, 과목코드',2:'부분종속'},{2:'correct'}).score,100);
assert.equal(summarize(sample,{1:'wrong',2:'부분종속'},{1:'correct'}).correct,0);
const bank=Object.entries(baseGrading).map(([id,grading])=>({id:Number(id),domain:Number(id)<=3?'DB':Number(id)<=7?'네트워크/OS':Number(id)<=10?'SW개발':Number(id)<=13?'SW설계':Number(id)<=16?'보안/신기술':Number(id)<=18?'C언어':Number(id)<=20?'Java':Number(id)<=22?'Python':'SQL',grading})).concat(additionalQuestions);
for (let round=0;round<30;round++) {
  const selected=pickExam(bank,'mixed');
  assert.equal(selected.length,20);
  assert.equal(new Set(selected.map((question)=>question.id)).size,20);
  for (const domain of ['DB','네트워크/OS','SW개발','SW설계','보안/신기술','C언어','Java']) assert.equal(selected.filter((question)=>question.domain===domain).length,2);
  for (const domain of ['Python','SQL']) assert.equal(selected.filter((question)=>question.domain===domain).length,3);
}
assert.equal(pickExam(bank,'theory').length,10);
assert.equal(pickExam(bank,'coding').length,10);
console.log('Grading: aliases, order, signs, output formatting, rubric overrides, canonical answers and balanced exams passed.');

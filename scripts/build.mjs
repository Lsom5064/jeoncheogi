import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { baseGrading, additionalQuestions, sourceExams } from '../content/questions.mjs';
import { pdfMockQuestions, examSets } from '../content/pdf-mock.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const require = createRequire(import.meta.url);
const dependencyPaths = process.env.CODEX_DEPENDENCY_PATH ? [process.env.CODEX_DEPENDENCY_PATH] : [];
const markedModule = await import(pathToFileURL(require.resolve('marked', { paths: [root, ...dependencyPaths] })).href);
const marked = markedModule.marked ?? markedModule.default?.marked;
const { icons } = require(require.resolve('lucide', { paths: [root, ...dependencyPaths] }));
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name) => {
  const node = icons[name];
  const children = node[0] === 'svg' ? node[2] : node;
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${children.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${escape(value)}"`).join(' ')}></${tag}>`).join('')}</svg>`;
};

function groups(tokens, depth) {
  const result = [];
  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === depth) result.push({ title: token.text, tokens: [] });
    else if (result.length) result.at(-1).tokens.push(token);
  }
  return result;
}

function html(tokens) {
  return marked.parser(tokens).replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="학습 자료 표"><table>').replace(/<\/table>/g, '</table></div>');
}

const sourceNames = ['morning_class', 'problem_sheet', 'answer_key'];
mkdirSync(path.join(root, 'materials'), { recursive: true });
const documents = sourceNames.map((name) => {
  const destination = path.join(root, 'materials', `jeongcheogi_2026-10-25_${name}.md`);
  const previous = path.join(root, '..', `jeongcheogi_2026-10-25_${name}.md`);
  if (!existsSync(destination)) copyFileSync(previous, destination);
  return readFileSync(destination, 'utf8').replace(/\r\n/g, '\n');
});
const [lesson, questionDoc, answerDoc] = documents;
const sections = groups(marked.lexer(lesson), 2);
const section = (number) => sections.find((item) => item.title.startsWith(`${number}.`));
const detailed = readFileSync(path.join(root, 'materials', 'detailed_theory.md'), 'utf8');
const domains = groups(marked.lexer(detailed), 2).filter((group) => group.title !== '참고 범위');
const topicCount = domains.reduce((total, group) => total + group.tokens.filter((token) => token.type === 'heading' && token.depth === 3).length, 0);
const questionGroups = groups(marked.lexer(questionDoc), 2).flatMap((group) => groups(group.tokens, 3).map((question) => ({ ...question, domain: group.title.replace(/^[A-I]\. /, '') })));
const answers = groups(marked.lexer(answerDoc), 2).flatMap((group) => groups(group.tokens, 3));
const domainNames = ['DB', '네트워크/OS', 'SW개발', 'SW설계', '보안/신기술', 'C언어', 'Java', 'Python', 'SQL'];
const dailyFocus = {
  '2026-10-05': {'SW개발':[1,2,3,4],SQL:[4,5]},
  '2026-10-06': {'SW개발':[6],'보안/신기술':[4],SQL:[6]},
  '2026-10-07': {'SW개발':[5,6],SQL:[6,7]},
  '2026-10-08': {'SW설계':[1,3,4],C언어:[1,5]},
  '2026-10-09': {'SW설계':[2,6],C언어:[2,4]},
  '2026-10-10': {'SW설계':[4,5,6],C언어:[3]},
  '2026-10-11': {'보안/신기술':[4,5]},
  '2026-10-12': {'보안/신기술':[2,3],Java:[1]},
  '2026-10-13': {'보안/신기술':[1,3,6],Java:[2,3,5]},
  '2026-10-14': {'DB':[1,2,3,4,5,6],Python:[1]},
  '2026-10-15': {'네트워크/OS':[5,6,7],Python:[2,3,4]},
  '2026-10-16': {'네트워크/OS':[1,2,3,4,8],SQL:[1,2,3]},
  '2026-10-17': {'SW개발':[1,2,3,4,5,6],SQL:[4,6]},
  '2026-10-18': {'SW설계':[1,3,4,5],C언어:[1,3],Java:[1,2],Python:[1,2],SQL:[4]},
  '2026-10-19': {'보안/신기술':[1,2,3,4,5,6],C언어:[1],Java:[1],Python:[1],SQL:[4]},
  '2026-10-20': {'DB':[1,2,3,4,5,6],C언어:[1,4],SQL:[1,4]},
  '2026-10-21': {'네트워크/OS':[1,2,3,4,5,6,7,8],Python:[1,4],SQL:[1,4]},
  '2026-10-22': {'SW개발':[1,2,3,4,5,6],'SW설계':[1,2,3,4,5,6],Java:[1,2],Python:[2,4]},
  '2026-10-23': {'보안/신기술':[1,2,3,4,5,6],C언어:[1,3],Java:[1,5],Python:[1,3],SQL:[4]},
  '2026-10-24': {'DB':[2,3,5],'네트워크/OS':[3,5,7],'SW개발':[2,3],'보안/신기술':[1,2],C언어:[1],Java:[1],Python:[1],SQL:[4]},
  '2026-10-25': {'DB':[2,5],'네트워크/OS':[1,3,5],'SW개발':[1,2],'SW설계':[1,3],'보안/신기술':[1,2],C언어:[1,3],Java:[1,5],Python:[1,3],SQL:[1,4]}
};
const dailyQuestionIds = {
  '2026-10-05':[8,9,35,24], '2026-10-06':[10,14,57], '2026-10-07':[37,57,59],
  '2026-10-08':[11,12,13,17,18], '2026-10-09':[40,86,47,48], '2026-10-10':[13,41,49],
  '2026-10-11':[14,44,45], '2026-10-12':[15,81,19,50], '2026-10-13':[16,43,52,90],
  '2026-10-14':[1,2,26,21], '2026-10-15':[4,31,32,53,54], '2026-10-16':[6,29,30,23,59],
  '2026-10-17':[8,9,36,57,58], '2026-10-18':[11,13,38,84,17,19,21,24],
  '2026-10-19':[14,15,16,43,81,90,48,50,53,58], '2026-10-20':[1,2,3,27,28,82,83],
  '2026-10-21':[4,5,6,7,29,31,32,85,87,88,89], '2026-10-22':[8,10,11,13,40,41,86],
  '2026-10-23':[14,15,16,42,43,44,45,46,81,90], '2026-10-24':[2,4,14,17,19,21,24,29],
  '2026-10-25':[1,8,14,17,19,21,24,29]
};
const domainIcons = ['Database', 'Network', 'FlaskConical', 'Blocks', 'ShieldCheck', 'Braces', 'CodeXml', 'Terminal', 'Table2'];
const ranges = ['1–3', '4–7', '8–10', '11–13', '14–16', '17–18', '19–20', '21–22', '23–24'];
const firstQuestions = [1, 4, 8, 11, 14, 17, 19, 21, 23];
const navigation = [
  ['curriculum.html', 'CalendarDays', '날짜별 커리큘럼'],
  ['schedule.html', 'Clock3', '25일 오전 수업'],
  ['subjects.html', 'BookOpen', '분야별 상세 이론'],
  ['diagnosis.html', 'ClipboardCheck', '시작 전 진단'],
  ['practice.html', 'PencilLine', '답안 입력과 채점'],
  ['mock.html', 'Timer', '모의고사'],
  ['checklist.html', 'ListChecks', '최종 점검'],
  ['sources.html', 'LibraryBig', '참고 자료']
];
const header = (number, title, subtitle = '') => `<div class="section-heading"><div><span class="section-number">${number}</span><h2>${title}</h2></div>${subtitle ? `<p>${subtitle}</p>` : ''}</div>`;

const baseExpected = ['학번, 과목코드','후보키의 일부인 과목코드에 부분 함수 종속이 존재하기 때문이다.','지속성','7','3','62','rwx, r-x, r--','경계값 분석','단위 → 통합 → 시스템 → 인수','형상 식별, 통제, 감사, 기록','Factory Method','기능적 응집도','합성','기밀성, 무결성, 가용성','SQL Injection','RBAC','8','1800','1,2','3','[2, 4, 6]','4','DB 80','3'];
const slugs = ['db','network-os','sw-dev','sw-design','security-newtech','c','java','python','sql'];
// Keep the original 24 questions and the new bank under the same grading contract.
const bank = questionGroups.map((question) => {
  const number = Number(question.title.match(/^\d+/)[0]);
  const title = question.title.replace(/^\d+\. /, '');
  const answer = answers.find((item) => Number(item.title.match(/^\d+/)?.[0]) === number);
  if (!answer) throw new Error(`Missing answer for question ${number}`);
  const cleanTokens = question.tokens.filter((token) => !(token.type === 'paragraph' && token.text.trim() === '답:'));
  const bodyHtml = number === 2 ? html(marked.lexer('수강(학번, 과목코드, 과목명, 교수명, 성적)의 후보키는 (학번, 과목코드)이며, (학번, 과목코드) → 성적, 과목코드 → 과목명, 교수명이라는 함수 종속이 있다.\n\n위 릴레이션이 제2정규형을 만족하지 못하는 이유를 쓰시오.')) : html(cleanTokens);
  return {id:number,title,domain:question.domain,bodyHtml,answerHtml:html(answer.tokens),expected:baseExpected[number-1],grading:baseGrading[number]};
}).concat([...additionalQuestions,...pdfMockQuestions].map((question) => ({...question,bodyHtml:html(marked.lexer(question.body)),answerHtml:html(marked.lexer(question.answer))})));
const practiceQuestion = (question) => {
  const i = domainNames.indexOf(question.domain);
  return `<article class="question" id="question-${question.id}" data-question-id="${question.id}" data-domain="${question.domain}"><div class="question-heading"><span class="question-number">${String(question.id).padStart(2, '0')}</span><div><span class="subject-label">${escape(question.domain)}</span><h3>${escape(question.title)}</h3></div><a class="theory-link" href="theory-${slugs[i]}.html#domain-${i}">이론</a></div><div class="prose">${question.bodyHtml}</div><form class="question-form" data-id="${question.id}"><label for="answer-${question.id}">내 답안</label><textarea id="answer-${question.id}" name="answer" rows="2" autocomplete="off" spellcheck="false" aria-describedby="feedback-${question.id}"></textarea><div class="answer-actions"><button type="submit" class="action-button">${icon('CheckCheck')}채점</button><span class="grade-feedback" id="feedback-${question.id}" role="status"></span></div><div class="self-grade" hidden><button type="button" class="text-button" data-self-grade="correct">${icon('Check')}정답으로 표시</button><button type="button" class="text-button" data-self-grade="incorrect">${icon('X')}오답으로 표시</button></div></form><details class="answer"><summary>${icon('CheckCheck')}<span>정답과 해설</span>${icon('ChevronDown')}</summary><div class="answer-content prose">${question.answerHtml}</div></details></article>`;
};
const practice = bank.map(practiceQuestion).join('');

const diagnosisTokens = section(6).tokens;
const answerIndex = diagnosisTokens.findIndex((token) => token.type === 'paragraph' && token.text.startsWith('정답:'));
const diagnosis = `${html(diagnosisTokens.slice(0, answerIndex))}<details class="answer diagnosis-answer"><summary>${icon('CheckCheck')}<span>진단 정답 확인</span>${icon('ChevronDown')}</summary><div class="answer-content prose">${html(diagnosisTokens.slice(answerIndex))}</div></details>`;
const theory = domains.map((domain, i) => `<article class="domain" id="domain-${i}"><div class="domain-heading"><div class="domain-title">${icon(domainIcons[i])}<span class="section-number">${String(i + 1).padStart(2, '0')}</span><h3>${domainNames[i]}</h3></div><a class="theory-link" href="practice-${slugs[i]}.html">문제 ${ranges[i]}</a></div><div class="prose">${html(domain.tokens).replace(/<h3>/g,'<h4>').replace(/<\/h3>/g,'</h4>')}</div>${i === 1 ? `<div class="knowledge-strip" aria-label="OSI 7계층 아래에서 위로">${['물리', '데이터링크', '네트워크', '전송', '세션', '표현', '응용'].map((layer, n) => `<div><b>${n + 1}</b><span>${layer}</span></div>`).join('')}</div>` : ''}${i === 8 ? `<ol class="sql-flow" aria-label="SQL 논리 처리 순서">${['FROM / JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'].map((step) => `<li>${step}</li>`).join('')}</ol>` : ''}</article>`).join('');
const mock = `<section id="mock" class="section">${header('06', '모의고사', '원본 시험과 수업용 시험')}<div class="mode-tabs" role="tablist" aria-label="모의고사 종류"><button id="tab-course" type="button" role="tab" aria-selected="true" aria-controls="course-exam">${icon('Timer')}수업용 모의고사</button><button id="tab-source" type="button" role="tab" aria-selected="false" aria-controls="source-exam" tabindex="-1">${icon('ExternalLink')}정처기 감자 원본</button></div><div id="course-exam" role="tabpanel" aria-labelledby="tab-course"><p class="section-note mock-note">수업용 자체 제작 문제은행에서 출제합니다. 종합형은 이론 10문항과 코딩·SQL 10문항으로 구성합니다.</p><div id="exam-setup" class="exam-setup"><label>시험 구성<select id="exam-mode"><option value="mixed">종합 20문항</option><option value="theory">이론 10문항</option><option value="coding">코딩·SQL 10문항</option></select></label><label>제한 시간<select id="exam-minutes"><option value="15">15분</option><option value="30">30분</option><option value="60" selected>60분</option><option value="150">150분</option></select></label><button id="exam-start" type="button" class="action-button primary">${icon('Play')}시험 시작</button></div><div id="exam-status" class="exam-status" hidden><div><strong id="exam-title"></strong><span id="exam-progress"></span></div><div class="exam-clock">${icon('Timer')}<output id="exam-time" aria-label="남은 시간"></output></div><button id="exam-submit" type="button" class="action-button primary">${icon('CheckCheck')}제출하고 채점</button></div><div id="exam-result" hidden role="status"></div><div id="exam-navigation" class="exam-navigation" aria-label="모의고사 문항 목차"></div><div id="exam-questions"></div><div id="exam-complete-actions" class="exam-complete-actions" hidden><button id="exam-new" type="button" class="action-button">${icon('RotateCcw')}새 모의고사</button><button id="exam-retry" type="button" class="action-button">${icon('PencilLine')}오답 재시험</button></div></div><div id="source-exam" role="tabpanel" aria-labelledby="tab-source" hidden><p class="section-note mock-note">문제와 채점은 정처기 감자의 원본 화면에서 제공됩니다. 파이널은 Premium 이상 이용권이 필요하며, 로그인은 원본 사이트의 계정을 사용합니다.</p><div class="source-exam-controls"><label>원본 시험<select id="source-exam-select">${sourceExams.map((exam) => `<option value="${exam.id}">${exam.title}</option>`).join('')}</select></label><button id="source-exam-load" type="button" class="action-button primary">${icon('PanelsTopLeft')}원본 화면 열기</button><a id="source-exam-link" class="action-button" href="${sourceExams[0].url}" target="_blank" rel="noopener noreferrer">${icon('ExternalLink')}새 탭에서 열기</a></div><p id="source-exam-note" class="section-note">${sourceExams[0].note}</p><p class="source-status" id="source-frame-status" role="status"></p><iframe id="source-frame" title="정처기 감자 원본 시험" hidden referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-downloads"></iframe><p class="source-frame-help">로그인 화면이나 문제가 표시되지 않으면 원본 시험을 새 탭에서 열어 주세요. 원본의 답안과 점수는 해당 사이트에서 관리됩니다.</p></div></section>`;
const curriculum = html(section(3).tokens);
const schedule = html(section(4).tokens).replace('20문항 실전 미니 모의고사', '대표 문항 오답 복습').replace('이론 10문항 + 코딩/SQL 10문항', '24문항 문제지에서 약한 분야 선택').replace('시간 제한', '선택 문항 재풀이');
const sourceLinks = [
  ['정처기 감자', 'https://jeongcheogi.edugamja.com/', '분야별 학습 구성'],
  ['이론 4주 공부 계획', 'https://jeongcheogi.edugamja.com/theory/4week-study-plan', '이론 Day 8–28 참고'],
  ['코딩 6주 공부 계획', 'https://jeongcheogi.edugamja.com/coding/coding-study-plan', '코딩 Day 22–42 참고'],
  ['DB', 'https://jeongcheogi.edugamja.com/theory/db', '키 · 정규화 · 트랜잭션'],
  ['네트워크/OS', 'https://jeongcheogi.edugamja.com/theory/network-os', '프로토콜 · 메모리 · IP'],
  ['SW개발', 'https://jeongcheogi.edugamja.com/theory/sw-dev', '테스트 · 인터페이스'],
  ['SW설계', 'https://jeongcheogi.edugamja.com/theory/sw-design', '패턴 · UML · SOLID'],
  ['보안/신기술', 'https://jeongcheogi.edugamja.com/theory/security-newtech', '공격 · 인증 · 보안 솔루션']
];
const addQuestionControls = (content, includeExam = false) => content
  .replace('<option value="mixed">종합 20문항</option>', '<option value="mixed">종합 20문항</option>' + examSets.map((exam) => `<option value="${exam.id}">${escape(exam.title)} · 20문항</option>`).join(''))
  .replace('<div id="exam-setup"', '<p id="exam-source-note" class="section-note mock-note" hidden></p><div id="exam-setup"')
  .replaceAll('href="#overview"', 'href="index.html"')
  .replaceAll('href="#sources"', 'href="sources.html"')
  .replaceAll('href="#theory"', 'href="subjects.html"')
  .replaceAll('href="#practice"', 'href="practice.html"')
  .replaceAll('href="#mock"', 'href="mock.html"')
  .replace('정보처리기사 실기: 9개 분야 상세 이론, 60문항 직접 입력과 채점', `정보처리기사 실기: 9개 분야 상세 이론, ${bank.length}문항 직접 입력과 채점`)
  .replace('상세 이론 · 60문항 답안 입력과 채점', `상세 이론 · ${bank.length}문항 답안 입력과 채점`);
const curriculumRows = section(3).tokens.find((token) => token.type === 'table').rows;
const dayEntries = curriculumRows.map((row) => {
  const [date, theoryText, codingText, outcome] = row.map((cell) => cell.text);
  const [month, day] = date.match(/\d+/g).map(Number);
  const dateKey = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return {date, dateKey, theoryText, codingText, outcome};
});
const domainCards = (kind) => domains.map((domain, i) => {
  const count = bank.filter((question) => question.domain === domainNames[i]).length;
  const href = `${kind}-${slugs[i]}.html`;
  return `<a class="source-link" href="${href}"><span><b>${icon(domainIcons[i])} ${domainNames[i]}</b><small>${kind === 'theory' ? `${domain.tokens.filter((token) => token.type === 'heading' && token.depth === 3).length}개 주제 · 개념과 비교표` : `${count}문항 · 입력하고 채점`}</small></span>${icon('ArrowRight')}</a>`;
}).join('');
const pageSections = {
  curriculum: `<section class="section">${header('01', '날짜별 커리큘럼', '10월 5일부터 25일까지 · 날짜를 선택해 학습 내용 보기')}<div class="phase-map" aria-label="학습 단계"><div><span>10.05–10.13</span><b>핵심 범위 정리</b><p>개발 · 설계 · 보안 · 언어별 복습</p></div><div><span>10.14–10.19</span><b>2회독과 약점 보완</b><p>DB · OS · 네트워크 · 통합 문제</p></div><div><span>10.20–10.25</span><b>실전 점검과 마무리</b><p>분야별 시험 · 모의고사 · 요약</p></div></div><div class="table-scroll curriculum"><table><thead><tr><th>날짜</th><th>이론</th><th>코딩·SQL</th><th>학습 산출물</th></tr></thead><tbody>${dayEntries.map((day) => `<tr><td><a href="day-${day.dateKey}.html">${escape(day.date)}</a></td><td>${escape(day.theoryText)}</td><td>${escape(day.codingText)}</td><td>${escape(day.outcome)}</td></tr>`).join('')}</tbody></table></div></section>`,
  schedule: `<section class="section">${header('02', '25일 오전 수업', '총 180분 권장 운영안')}<p class="section-note">수업 시작 시간에 맞춰 조정하는 권장 시간표입니다. 전체 문제 연습은 별도 시간을 확보하고, 말미에는 선택한 오답을 복습합니다.</p><div class="prose">${schedule}</div><details class="teacher-note"><summary>${icon('Presentation')}<span>수업 운영과 판서안</span>${icon('ChevronDown')}</summary><div class="prose">${html(section(2).tokens)}${html(section(8).tokens)}</div></details></section>`,
  subjects: `<section class="section">${header('03', '분야별 상세 이론', `${topicCount}주제 · 9개 분야`)}<div class="source-grid">${domainCards('theory')}</div></section>`,
  diagnosis: `<section class="section">${header('04', '시작 전 진단', '8문항 · 10분')}<div class="prose diagnosis">${diagnosis}</div><a class="action-button primary" href="practice.html">${icon('PencilLine')}분야별 문제 풀기</a></section>`,
  practiceIndex: `<section class="section">${header('05', '답안 입력과 채점', `${bank.length}문항 · 분야별 문제 모음`)}<div class="source-grid">${domainCards('practice')}</div><p class="section-note">분야별로 답안을 입력하고 채점할 수 있습니다. 오답 기록은 이 브라우저에 저장됩니다.</p></section>`,
  practiceAll: `<section id="practice" class="section">${header('05', '전체 문제 풀이', `${bank.length}문항 · 분야별 복습`)}<div class="practice-filters"><label>분야<select id="practice-domain"><option value="all">전체 분야</option>${domainNames.map((name) => `<option>${name}</option>`).join('')}</select></label><label class="checkbox-label"><input type="checkbox" id="practice-wrong">오답·미응답만</label><span id="practice-visible-count"></span></div><div class="practice-toolbar"><button class="action-button primary" id="grade-all" type="button">${icon('CheckCheck')}전체 채점</button><button class="text-button" id="toggle-answers" type="button" aria-expanded="false">${icon('Eye')}<span>전체 해설 펼치기</span></button><button class="icon-button" id="practice-reset" type="button" title="연습 답안 초기화" aria-label="연습 답안 초기화">${icon('RotateCcw')}</button></div><div id="practice-summary" class="practice-summary" role="status"></div><p class="grading-note">용어·수치·출력값은 허용 답안과 비교합니다. 서술형은 해설을 함께 확인해 주세요.</p><div class="questions">${practice}</div><p id="practice-empty" class="empty-state" hidden>선택한 조건에 해당하는 문제가 없습니다.</p></section>`,
  mock,
  checklist: `<section class="section">${header('07', '최종 점검', '마지막 회독')}<div class="prose checklist">${html(section(9).tokens)}</div><details class="teacher-note"><summary>${icon('ListChecks')}<span>이론 · 코딩 · SQL 풀이 루틴</span>${icon('ChevronDown')}</summary><div class="prose">${html(section(7).tokens)}</div></details></section>`,
  sources: `<section class="section">${header('08', '참고 자료', '원본 커리큘럼과 내려받기')}<p class="section-note">공개 커리큘럼의 분야·날짜 구성을 참고하여 이론과 문제는 수업용으로 새로 작성했습니다. 원본 공개 퀴즈에서 확인한 유형을 바탕으로 변형 문제를 보강했습니다.</p><div class="source-grid">${sourceLinks.map(([title, url, note]) => `<a class="source-link" href="${url}" target="_blank" rel="noopener noreferrer"><span><b>${title}</b><small>${note}</small></span>${icon('ExternalLink')}</a>`).join('')}</div><div class="downloads"><a href="./materials/detailed_theory.md" download>${icon('FileDown')}상세 이론 자료<span>MD</span></a>${[['morning_class', '강사용 시간표·운영안'], ['problem_sheet', '기본 24문항 문제지'], ['answer_key', '기본 24문항 해설']].map(([name, label]) => `<a href="./materials/jeongcheogi_2026-10-25_${name}.md" download>${icon('FileDown')}${label}<span>MD</span></a>`).join('')}</div><p class="repository-link"><a href="https://github.com/Lsom5064/jeoncheogi" target="_blank" rel="noopener noreferrer">${icon('GitFork')} 공개 GitHub 저장소</a></p></section>`
};
const overview = `<section class="section"><div class="phase-map"><div><span>10.05–10.25</span><b>날짜별 학습</b><p>21일 커리큘럼</p><a href="curriculum.html">커리큘럼 열기</a></div><div><span>${topicCount} topics</span><b>분야별 이론</b><p>정의 · 비교 · 풀이 예제</p><a href="subjects.html">분야 선택</a></div><div><span>${bank.length} questions</span><b>직접 풀고 채점</b><p>저장되는 분야별 오답</p><a href="practice.html">문제 풀기</a></div></div><div class="source-grid">${navigation.slice(1).map(([href, symbol, label]) => `<a class="source-link" href="${href}"><span><b>${icon(symbol)} ${label}</b></span>${icon('ArrowRight')}</a>`).join('')}</div></section>`;
const page = (title, active, content, features = []) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="정보처리기사 실기 ${escape(title)} · 분야별 이론과 직접 채점 문제 ${bank.length}문항"><meta name="theme-color" content="#127761"><title>${escape(title)} | 정보처리기사 실기 수업노트</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23127761'/%3E%3Cpath d='M8 8h7v17H8zm9 0h7v17h-7z' fill='white'/%3E%3C/svg%3E"><link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./learning.css">${features.includes('practice') || features.includes('mock') ? '<script src="./question-bank.js" defer></script><script src="./grading.js" defer></script><script src="./learning.js" defer></script>' : ''}<script src="./app.js" defer></script></head><body><a class="skip-link" href="#main">본문으로 이동</a><aside class="sidebar"><a class="brand" href="index.html"><span class="brand-mark">${icon('BookOpen')}</span><span>실기 수업노트<small>정보처리기사 · 2026</small></span></a><span class="nav-label">수업자료</span><nav aria-label="학습 목차">${navigation.map(([href, symbol, label]) => `<a href="${href}"${href === active ? ' aria-current="page" class="active"' : ''}>${icon(symbol)}<span>${label}</span></a>`).join('')}</nav><div class="sidebar-foot"><span>수업일</span><b>2026. 10. 25. 일요일</b><p>오전 압축 수업</p></div></aside><main id="main"><header class="page-header"><div class="page-top"><span class="eyebrow">2026 실기 대비 수업자료</span><div class="header-actions"><button class="icon-button" id="print" type="button" title="현재 페이지 인쇄" aria-label="현재 페이지 인쇄">${icon('Printer')}</button></div></div><div class="title-row"><div><h1>${escape(title)}</h1><p class="lead">정보처리기사 · 10월 25일 오전 수업</p></div><a class="date-label" href="index.html">10.25 <span>SUN</span></a></div>${features.includes('practice') || features.includes('mock') ? '<p id="storage-status" role="status" hidden></p>' : ''}</header>${content}<footer class="page-footer"><span>정보처리기사 실기 · 2026.10.25 오전 수업자료</span><a href="index.html">처음으로</a></footer></main></body></html>`;
const dist = path.join(root, 'dist');
mkdirSync(path.join(dist, 'materials'), { recursive: true });
const writePage = (file, title, active, content, features = []) => writeFileSync(path.join(dist, file), page(title, active, addQuestionControls(content), features));
writePage('index.html', '정보처리기사 실기', '', overview);
writePage('curriculum.html', '날짜별 커리큘럼', 'curriculum.html', pageSections.curriculum);
writePage('schedule.html', '25일 오전 수업', 'schedule.html', pageSections.schedule);
writePage('subjects.html', '분야별 상세 이론', 'subjects.html', pageSections.subjects);
writePage('diagnosis.html', '시작 전 진단', 'diagnosis.html', pageSections.diagnosis);
writePage('practice.html', '답안 입력과 채점', 'practice.html', pageSections.practiceIndex);
writePage('practice-all.html', '전체 문제 풀이', 'practice.html', pageSections.practiceAll, ['practice']);
writePage('mock.html', '모의고사', 'mock.html', mock, ['mock']);
writePage('checklist.html', '최종 점검', 'checklist.html', pageSections.checklist);
writePage('sources.html', '참고 자료', 'sources.html', pageSections.sources);
for (const [index, domain] of domains.entries()) {
  const slug = slugs[index];
  const thisTheory = theory.match(new RegExp(`<article class="domain" id="domain-${index}">[\\s\\S]*?<\\/article>`))?.[0];
  if (!thisTheory) throw new Error(`Missing theory page for ${domainNames[index]}`);
  writePage(`theory-${slug}.html`, `${domainNames[index]} 이론`, 'subjects.html', `<section class="section">${thisTheory}<a class="action-button primary" href="practice-${slug}.html">${icon('PencilLine')}${domainNames[index]} 문제 풀기</a></section>`);
  const questions = bank.filter((question) => question.domain === domainNames[index]);
  const controls = `<div class="practice-toolbar"><button class="action-button primary" id="grade-all" type="button">${icon('CheckCheck')}전체 채점</button><button class="text-button" id="toggle-answers" type="button" aria-expanded="false">${icon('Eye')}<span>전체 해설 펼치기</span></button><button class="icon-button" id="practice-reset" type="button" title="연습 답안 초기화" aria-label="연습 답안 초기화">${icon('RotateCcw')}</button></div><div id="practice-summary" class="practice-summary" role="status"></div><div class="questions">${questions.map(practiceQuestion).join('')}</div>`;
  writePage(`practice-${slug}.html`, `${domainNames[index]} 문제 풀이`, 'practice.html', `<section id="practice" class="section">${header('05', `${domainNames[index]} 문제`, `${questions.length}문항 · 직접 입력과 채점`)}${controls}</section>`, ['practice']);
}
for (const day of dayEntries) {
  const related = domainNames.map((name, i) => ({name, href:`theory-${slugs[i]}.html`})).filter(({name}) => `${day.theoryText} ${day.codingText}`.toLowerCase().includes(name.toLowerCase()) || (name === 'C언어' && /\bC\b/.test(`${day.theoryText} ${day.codingText}`)) || (name === '네트워크/OS' && /네트워크|\bOS\b|페이지 교체|IP\b|chmod|라우팅/i.test(`${day.theoryText} ${day.codingText}`)) || (name === 'SW개발' && /테스트|인터페이스|형상관리/i.test(day.theoryText)) || (name === 'SW설계' && /패턴|UML|응집도|설계/i.test(day.theoryText)) || (name === '보안/신기술' && /보안|공격|암호|신기술|3A/i.test(day.theoryText)) || (name === 'SQL' && /SQL/i.test(day.codingText)) || (name === 'Python' && /Python/i.test(day.codingText)) || (name === 'Java' && /Java/i.test(day.codingText)));
  const focus = dailyFocus[day.dateKey];
  if (!focus || !dailyQuestionIds[day.dateKey]) throw new Error(`Missing daily lesson map for ${day.dateKey}`);
  const lessons = Object.entries(focus).map(([name, numbers]) => {
    const domain = domains[domainNames.indexOf(name)];
    const topics = groups(domain.tokens, 3).filter((topic) => numbers.includes(Number(topic.title.match(/^\d+/)?.[0])));
    if (topics.length !== numbers.length) throw new Error(`Incomplete ${name} lesson mapping for ${day.dateKey}`);
    return `<section class="daily-domain"><h3>${icon(domainIcons[domainNames.indexOf(name)])}${escape(name)}</h3>${topics.map((topic) => `<article class="daily-topic"><h4>${escape(topic.title.replace(/^\d+\.\s*/,''))}</h4><div class="prose">${html(topic.tokens)}</div></article>`).join('')}</section>`;
  }).join('');
  const dailyQuestions = dailyQuestionIds[day.dateKey].map((id) => bank.find((question) => question.id === id)).filter(Boolean);
  if (dailyQuestions.length !== dailyQuestionIds[day.dateKey].length) throw new Error(`Missing daily practice question for ${day.dateKey}`);
  const extraUi = day.dateKey === '2026-10-11' ? `<article class="daily-topic"><h4>UI 설계 원칙과 유형</h4><div class="prose"><p>사용자 중심성, 일관성, 단순성, 가시성, 피드백, 오류 예방을 기준으로 화면을 설계합니다. 입력 형식과 오류 원인을 명확히 알리고, 같은 동작은 같은 방식으로 제공하며, 사용자가 취소·되돌리기 할 수 있게 합니다.</p><p>GUI는 그래픽 요소를 직접 조작하고, 메뉴 방식은 목록에서 명령을 선택합니다. 음성·대화형 UI 등 입력 환경에 맞는 유형을 선택하며 접근성과 학습 용이성도 함께 점검합니다.</p></div></article>` : '';
  const content = `<section class="section">${header('CURRICULUM', day.date, '오늘 배울 이론 · 코드/SQL · 직접 풀이')}<div class="phase-map"><div><span>이론 범위</span><b>${escape(day.theoryText)}</b></div><div><span>코딩 · SQL 범위</span><b>${escape(day.codingText)}</b></div><div><span>오늘의 산출물</span><b>${escape(day.outcome)}</b></div></div><h2>오늘 배울 내용</h2><div class="daily-lessons">${lessons}${extraUi}</div><h2>오늘의 직접 풀이</h2><p class="section-note">답을 직접 입력하고 채점하세요. 정답과 해설은 원할 때 펼쳐볼 수 있습니다.</p><section id="practice" class="daily-practice"><div id="practice-summary" class="practice-summary" role="status"></div><div class="questions">${dailyQuestions.map(practiceQuestion).join('')}</div></section><h2>오늘의 학습 순서</h2><ol><li>위 이론을 읽고 정의·구분 기준·예외를 노트에 정리합니다.</li><li>코드와 SQL은 행 또는 변수의 중간 상태를 표로 추적합니다.</li><li>오늘 문제를 먼저 풀고 채점한 뒤, 해설과 오늘의 산출물을 확인합니다.</li></ol><h2>다음 학습 연결</h2><div class="source-grid">${related.map(({name,href}) => `<a class="source-link" href="${href}"><span><b>${name} 상세 이론</b><small>전체 분야 개념과 추가 연습문제</small></span>${icon('ArrowRight')}</a>`).join('') || `<a class="source-link" href="mock.html"><span><b>모의고사</b><small>누적 학습 점검</small></span>${icon('ArrowRight')}</a>`}</div><p><a href="curriculum.html">전체 날짜별 커리큘럼</a></p></section>`;
  writePage(`day-${day.dateKey}.html`, `${day.date} 학습 계획`, 'curriculum.html', content, ['practice']);
}
const json = (value) => JSON.stringify(value).replace(/</g,'\\u003c');
writeFileSync(path.join(root, 'dist', 'question-bank.js'), `window.LESSON_BANK=${json(bank)};\nwindow.LESSON_EXAMS=${json(examSets)};\nwindow.LESSON_SOURCES=${json(sourceExams)};\nwindow.LESSON_DOMAINS=${json(domainNames)};\nwindow.LESSON_ICONS=${json({check:icon('CheckCheck'),chevron:icon('ChevronDown'),yes:icon('Check'),no:icon('X')})};\n`);
copyFileSync(path.join(root, 'materials', 'detailed_theory.md'),path.join(root,'dist','materials','detailed_theory.md'));
for (let i = 0; i < sourceNames.length; i++) copyFileSync(path.join(root, 'materials', `jeongcheogi_2026-10-25_${sourceNames[i]}.md`), path.join(root, 'dist', 'materials', `jeongcheogi_2026-10-25_${sourceNames[i]}.md`));
console.log(`Built ${domains.length} domains, ${topicCount} topics, ${bank.length} graded questions and ${sourceExams.length} original exam connections.`);

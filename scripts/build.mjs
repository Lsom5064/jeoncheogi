import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { baseGrading, additionalQuestions, sourceExams } from '../content/questions.mjs';
import { pdfMockQuestions, examSets } from '../content/pdf-mock.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const require = createRequire(import.meta.url);
const dependencyPaths = process.env.CODEX_DEPENDENCY_PATH ? [process.env.CODEX_DEPENDENCY_PATH] : [];
const { marked } = await import(pathToFileURL(require.resolve('marked', { paths: [root, ...dependencyPaths] })).href);
const { icons } = require(require.resolve('lucide', { paths: [root, ...dependencyPaths] }));
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name].map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([key, value]) => `${key}="${escape(value)}"`).join(' ')}></${tag}>`).join('')}</svg>`;

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
const domainIcons = ['Database', 'Network', 'FlaskConical', 'Blocks', 'ShieldCheck', 'Braces', 'CodeXml', 'Terminal', 'Table2'];
const ranges = ['1–3', '4–7', '8–10', '11–13', '14–16', '17–18', '19–20', '21–22', '23–24'];
const firstQuestions = [1, 4, 8, 11, 14, 17, 19, 21, 23];
const navigation = [
  ['curriculum', 'CalendarDays', '날짜별 커리큘럼'],
  ['schedule', 'Clock3', '25일 오전 수업'],
  ['theory', 'BookOpen', '분야별 상세 이론'],
  ['diagnosis', 'ClipboardCheck', '시작 전 진단'],
  ['practice', 'PencilLine', '답안 입력과 채점'],
  ['mock', 'Timer', '모의고사'],
  ['checklist', 'ListChecks', '최종 점검'],
  ['sources', 'LibraryBig', '참고 자료']
];
const header = (number, title, subtitle = '') => `<div class="section-heading"><div><span class="section-number">${number}</span><h2>${title}</h2></div>${subtitle ? `<p>${subtitle}</p>` : ''}</div>`;

const baseExpected = ['학번, 과목코드','후보키의 일부인 과목코드에 부분 함수 종속이 존재하기 때문이다.','지속성','7','3','62','rwx, r-x, r--','경계값 분석','단위 → 통합 → 시스템 → 인수','형상 식별, 통제, 감사, 기록','Factory Method','기능적 응집도','합성','기밀성, 무결성, 가용성','SQL Injection','RBAC','8','1800','1,2','3','[2, 4, 6]','4','DB 80','3'];
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
const practice = bank.map((question) => `<article class="question" id="question-${question.id}" data-question-id="${question.id}" data-domain="${question.domain}"><div class="question-heading"><span class="question-number">${String(question.id).padStart(2, '0')}</span><div><span class="subject-label">${escape(question.domain)}</span><h3>${escape(question.title)}</h3></div><a class="theory-link" href="#domain-${domainNames.indexOf(question.domain)}">이론</a></div><div class="prose">${question.bodyHtml}</div><form class="question-form" data-id="${question.id}"><label for="answer-${question.id}">내 답안</label><textarea id="answer-${question.id}" name="answer" rows="2" autocomplete="off" spellcheck="false" aria-describedby="feedback-${question.id}"></textarea><div class="answer-actions"><button type="submit" class="action-button">${icon('CheckCheck')}채점</button><span class="grade-feedback" id="feedback-${question.id}" role="status"></span></div><div class="self-grade" hidden><button type="button" class="text-button" data-self-grade="correct">${icon('Check')}정답으로 표시</button><button type="button" class="text-button" data-self-grade="incorrect">${icon('X')}오답으로 표시</button></div></form><details class="answer"><summary>${icon('CheckCheck')}<span>정답과 해설</span>${icon('ChevronDown')}</summary><div class="answer-content prose">${question.answerHtml}</div></details></article>`).join('');

const diagnosisTokens = section(6).tokens;
const answerIndex = diagnosisTokens.findIndex((token) => token.type === 'paragraph' && token.text.startsWith('정답:'));
const diagnosis = `${html(diagnosisTokens.slice(0, answerIndex))}<details class="answer diagnosis-answer"><summary>${icon('CheckCheck')}<span>진단 정답 확인</span>${icon('ChevronDown')}</summary><div class="answer-content prose">${html(diagnosisTokens.slice(answerIndex))}</div></details>`;
const theory = domains.map((domain, i) => `<article class="domain" id="domain-${i}"><div class="domain-heading"><div class="domain-title">${icon(domainIcons[i])}<span class="section-number">${String(i + 1).padStart(2, '0')}</span><h3>${domainNames[i]}</h3></div><a class="theory-link" href="#question-${firstQuestions[i]}">기본 문제 ${ranges[i]}</a></div><div class="prose">${html(domain.tokens).replace(/<h3>/g,'<h4>').replace(/<\/h3>/g,'</h4>')}</div>${i === 1 ? `<div class="knowledge-strip" aria-label="OSI 7계층 아래에서 위로">${['물리', '데이터링크', '네트워크', '전송', '세션', '표현', '응용'].map((layer, n) => `<div><b>${n + 1}</b><span>${layer}</span></div>`).join('')}</div>` : ''}${i === 8 ? `<ol class="sql-flow" aria-label="SQL 논리 처리 순서">${['FROM / JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'].map((step) => `<li>${step}</li>`).join('')}</ol>` : ''}</article>`).join('');
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
const page = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="정보처리기사 실기: 9개 분야 상세 이론, 60문항 직접 입력과 채점, 수업용 모의고사, 정처기 감자 원본 시험 연결.">
  <meta name="theme-color" content="#127761">
  <meta property="og:title" content="정보처리기사 실기 | 10월 25일 오전 수업">
  <meta property="og:description" content="상세 이론 · 60문항 답안 입력과 채점 · 모의고사">
  <meta property="og:type" content="website">
  <title>정보처리기사 실기 | 10월 25일 오전 수업</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23127761'/%3E%3Cpath d='M8 8h7v17H8zm9 0h7v17h-7z' fill='white'/%3E%3C/svg%3E">
  <link rel="stylesheet" href="./styles.css">
  <link rel="stylesheet" href="./learning.css">
  <script src="./question-bank.js" defer></script>
  <script src="./grading.js" defer></script>
  <script src="./app.js" defer></script>
  <script src="./learning.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">본문으로 이동</a>
  <aside class="sidebar">
    <a class="brand" href="#overview"><span class="brand-mark">${icon('BookOpen')}</span><span>실기 수업노트<small>정보처리기사 · 2026</small></span></a>
    <span class="nav-label">수업자료</span>
    <nav aria-label="학습 목차">${navigation.map(([id, symbol, label]) => `<a href="#${id}">${icon(symbol)}<span>${label}</span></a>`).join('')}</nav>
    <div class="sidebar-foot"><span>수업일</span><b>2026. 10. 25. 일요일</b><p>오전 압축 수업</p><a href="https://jeongcheogi.edugamja.com/" target="_blank" rel="noopener noreferrer">정처기 감자 참고 ${icon('ExternalLink')}</a></div>
  </aside>
  <main id="main">
    <header class="page-header" id="overview">
      <div class="page-top"><span class="eyebrow">2026 실기 대비 수업자료</span><div class="header-actions"><a class="icon-button" href="#sources" title="원본 자료 내려받기" aria-label="원본 자료 내려받기">${icon('Download')}</a><button class="icon-button" id="print" type="button" title="수업자료 인쇄" aria-label="수업자료 인쇄">${icon('Printer')}</button></div></div>
      <div class="title-row"><div><h1>정보처리기사 실기</h1><p class="lead">10월 25일 오전 수업</p></div><span class="date-label">10.25 <span>SUN</span></span></div>
      <nav class="study-shortcuts" aria-label="학습 바로가기"><a href="#theory">${icon('BookOpen')}이론 학습</a><a href="#practice">${icon('PencilLine')}문제 풀이</a><a href="#mock">${icon('Timer')}모의고사</a></nav><div class="metrics"><div><span>마무리 커리큘럼</span><b>21<span>일</span></b><small>10.05–10.25</small></div><div><span>상세 이론</span><b>${topicCount}<span>주제</span></b><small>9개 분야 · 비교표와 예제</small></div><div><span>실전 문제</span><b>${bank.length}<span>문항</span></b><small>답안 입력 · 채점 · 오답 복습</small></div><div><span>모의고사</span><b>20<span>문항</span></b><small>종합형 · 이론형 · 코딩형</small></div></div><p id="storage-status" role="status" hidden></p>
    </header>
    <section id="curriculum" class="section">
      ${header('01', '날짜별 커리큘럼', '10월 5일부터 25일까지')}
      <div class="phase-map" aria-label="학습 단계"><div><span>10.05–10.13</span><b>핵심 범위 정리</b><p>개발 · 설계 · 보안 · 언어별 복습</p></div><div><span>10.14–10.19</span><b>2회독과 약점 보완</b><p>DB · OS · 네트워크 · 통합 문제</p></div><div><span>10.20–10.25</span><b>실전 점검과 마무리</b><p>분야별 시험 · 모의고사 · 요약</p></div></div>
      <div class="prose curriculum">${curriculum}</div>
    </section>
    <section id="schedule" class="section">${header('02', '25일 오전 수업', '총 180분 권장 운영안')}<p class="section-note">수업 시작 시간에 맞춰 조정하는 권장 시간표입니다. 전체 24문항 연습은 별도 45분을 확보하고, 수업 말미에는 선택한 오답을 복습합니다.</p><div class="prose">${schedule}</div><details class="teacher-note"><summary>${icon('Presentation')}<span>수업 운영과 판서안</span>${icon('ChevronDown')}</summary><div class="prose">${html(section(2).tokens)}${html(section(8).tokens)}</div></details></section>
    <section id="theory" class="section">${header('03', '분야별 상세 이론', `${topicCount}주제 · 정의와 비교 · 계산과 추적`)}<nav class="domain-nav" aria-label="분야 선택">${domainNames.map((name, i) => `<a href="#domain-${i}">${name}</a>`).join('')}</nav>${theory}</section>
    <section id="diagnosis" class="section">${header('04', '시작 전 진단', '8문항 · 10분')}<div class="prose diagnosis">${diagnosis}</div></section>
    <section id="practice" class="section">${header('05', '답안 입력과 채점', `${bank.length}문항 · 분야별 복습`)}<div class="practice-filters"><label>분야<select id="practice-domain"><option value="all">전체 분야</option>${domainNames.map((name) => `<option>${name}</option>`).join('')}</select></label><label class="checkbox-label"><input type="checkbox" id="practice-wrong">오답·미응답만</label><span id="practice-visible-count"></span></div><div class="practice-toolbar"><button class="action-button primary" id="grade-all" type="button">${icon('CheckCheck')}전체 채점</button><button class="text-button" id="toggle-answers" type="button" aria-expanded="false">${icon('Eye')}<span>전체 해설 펼치기</span></button><button class="icon-button" id="practice-reset" type="button" title="연습 답안 초기화" aria-label="연습 답안 초기화">${icon('RotateCcw')}</button></div><div id="practice-summary" class="practice-summary" role="status"></div><p class="grading-note">용어·수치·출력값은 허용 답안과 비교합니다. 서술형은 핵심어 기준으로 확인하며, 검토가 필요한 답안은 해설과 대조해 표시합니다.</p><div class="questions">${practice}</div><p id="practice-empty" class="empty-state" hidden>선택한 조건에 해당하는 문제가 없습니다.</p></section>
    ${mock}
    <section id="checklist" class="section">${header('07', '최종 점검', '마지막 회독')}<div class="prose checklist">${html(section(9).tokens)}</div><details class="teacher-note"><summary>${icon('ListChecks')}<span>이론 · 코딩 · SQL 풀이 루틴</span>${icon('ChevronDown')}</summary><div class="prose">${html(section(7).tokens)}</div></details></section>
    <section id="sources" class="section">${header('08', '참고 자료', '원본 커리큘럼과 내려받기')}<p class="section-note">정처기 감자의 분야별 구성과 날짜별 학습 계획을 참고해 재구성한 수업자료입니다. 상세 설명과 수업용 문제은행은 별도로 작성했으며, 원본 모의고사는 해당 사이트의 화면으로 연결됩니다.</p><div class="source-grid">${sourceLinks.map(([title, url, note]) => `<a class="source-link" href="${url}" target="_blank" rel="noopener noreferrer"><span><b>${title}</b><small>${note}</small></span>${icon('ExternalLink')}</a>`).join('')}</div><div class="downloads"><a href="./materials/detailed_theory.md" download>${icon('FileDown')}상세 이론 자료<span>MD</span></a>${[['morning_class', '강사용 시간표·운영안'], ['problem_sheet', '기본 24문항 문제지'], ['answer_key', '기본 24문항 해설']].map(([name, label]) => `<a href="./materials/jeongcheogi_2026-10-25_${name}.md" download>${icon('FileDown')}${label}<span>MD</span></a>`).join('')}</div><p class="repository-link"><a href="https://github.com/Lsom5064/jeongcheogi-practical-class-2026" target="_blank" rel="noopener noreferrer">${icon('GitFork')} 공개 GitHub 저장소</a></p></section>
    <footer class="page-footer"><span>정보처리기사 실기 · 2026.10.25 오전 수업자료</span><a href="#overview">맨 위로</a></footer>
  </main>
</body>
</html>`;
mkdirSync(path.join(root, 'dist', 'materials'), { recursive: true });
writeFileSync(path.join(root, 'dist', 'index.html'), page.replace('<option value="mixed">종합 20문항</option>','<option value="mixed">종합 20문항</option>'+examSets.map((exam)=>`<option value="${exam.id}">${escape(exam.title)} · 20문항</option>`).join('')).replace('<div id="exam-setup"','<p id="exam-source-note" class="section-note mock-note" hidden></p><div id="exam-setup"').replace('정보처리기사 실기: 9개 분야 상세 이론, 60문항 직접 입력과 채점','정보처리기사 실기: 9개 분야 상세 이론, 80문항 직접 입력과 채점').replace('상세 이론 · 60문항 답안 입력과 채점','상세 이론 · 80문항 답안 입력과 채점'));
const json = (value) => JSON.stringify(value).replace(/</g,'\\u003c');
writeFileSync(path.join(root, 'dist', 'question-bank.js'), `window.LESSON_BANK=${json(bank)};\nwindow.LESSON_EXAMS=${json(examSets)};\nwindow.LESSON_SOURCES=${json(sourceExams)};\nwindow.LESSON_DOMAINS=${json(domainNames)};\nwindow.LESSON_ICONS=${json({check:icon('CheckCheck'),chevron:icon('ChevronDown'),yes:icon('Check'),no:icon('X')})};\n`);
copyFileSync(path.join(root, 'materials', 'detailed_theory.md'),path.join(root,'dist','materials','detailed_theory.md'));
for (let i = 0; i < sourceNames.length; i++) copyFileSync(path.join(root, 'materials', `jeongcheogi_2026-10-25_${sourceNames[i]}.md`), path.join(root, 'dist', 'materials', `jeongcheogi_2026-10-25_${sourceNames[i]}.md`));
console.log(`Built ${domains.length} domains, ${topicCount} topics, ${bank.length} graded questions and ${sourceExams.length} original exam connections.`);

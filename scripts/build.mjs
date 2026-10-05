import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

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
const domains = groups(section(5).tokens, 3);
const questionGroups = groups(marked.lexer(questionDoc), 2).flatMap((group) => groups(group.tokens, 3).map((question) => ({ ...question, domain: group.title.replace(/^[A-I]\. /, '') })));
const answers = groups(marked.lexer(answerDoc), 2).flatMap((group) => groups(group.tokens, 3));
const domainNames = ['DB', '네트워크/OS', 'SW개발', 'SW설계', '보안/신기술', 'C언어', 'Java', 'Python', 'SQL'];
const domainIcons = ['Database', 'Network', 'FlaskConical', 'Blocks', 'ShieldCheck', 'Braces', 'CodeXml', 'Terminal', 'Table2'];
const ranges = ['1–3', '4–7', '8–10', '11–13', '14–16', '17–18', '19–20', '21–22', '23–24'];
const firstQuestions = [1, 4, 8, 11, 14, 17, 19, 21, 23];
const navigation = [
  ['curriculum', 'CalendarDays', '날짜별 커리큘럼'],
  ['schedule', 'Clock3', '25일 오전 수업'],
  ['theory', 'BookOpen', '분야별 핵심 이론'],
  ['diagnosis', 'ClipboardCheck', '시작 전 진단'],
  ['practice', 'PencilLine', '24문항 실전 연습'],
  ['checklist', 'ListChecks', '최종 점검'],
  ['sources', 'LibraryBig', '참고 자료']
];
const header = (number, title, subtitle = '') => `<div class="section-heading"><div><span class="section-number">${number}</span><h2>${title}</h2></div>${subtitle ? `<p>${subtitle}</p>` : ''}</div>`;

// Question and answer headings are matched by their numeric IDs, independent of subject order.
const practice = questionGroups.map((question) => {
  const number = Number(question.title.match(/^\d+/)[0]);
  const title = question.title.replace(/^\d+\. /, '');
  const answer = answers.find((item) => Number(item.title.match(/^\d+/)?.[0]) === number);
  if (!answer) throw new Error(`Missing answer for question ${number}`);
  const cleanTokens = question.tokens.filter((token) => !(token.type === 'paragraph' && token.text.trim() === '답:'));
  return `<article class="question" id="question-${number}"><div class="question-heading"><span class="question-number">${String(number).padStart(2, '0')}</span><div><span class="subject-label">${escape(question.domain)}</span><h3>${escape(title)}</h3></div><a class="theory-link" href="#domain-${domainNames.indexOf(question.domain)}">이론</a></div><div class="prose">${html(cleanTokens)}</div><details class="answer"><summary>${icon('CheckCheck')}<span>정답과 해설</span>${icon('ChevronDown')}</summary><div class="answer-content prose">${html(answer.tokens.filter((token) => token.type !== 'heading'))}</div></details></article>`;
}).join('');

const diagnosisTokens = section(6).tokens;
const answerIndex = diagnosisTokens.findIndex((token) => token.type === 'paragraph' && token.text.startsWith('정답:'));
const diagnosis = `${html(diagnosisTokens.slice(0, answerIndex))}<details class="answer diagnosis-answer"><summary>${icon('CheckCheck')}<span>진단 정답 확인</span>${icon('ChevronDown')}</summary><div class="answer-content prose">${html(diagnosisTokens.slice(answerIndex))}</div></details>`;
const theory = domains.map((domain, i) => `<article class="domain" id="domain-${i}"><div class="domain-heading"><div class="domain-title">${icon(domainIcons[i])}<span class="section-number">${String(i + 1).padStart(2, '0')}</span><h3>${domainNames[i]}</h3></div><a class="theory-link" href="#question-${firstQuestions[i]}">문제 ${ranges[i]}</a></div><div class="prose">${html(domain.tokens)}</div>${i === 1 ? `<div class="knowledge-strip" aria-label="OSI 7계층 아래에서 위로">${['물리', '데이터링크', '네트워크', '전송', '세션', '표현', '응용'].map((layer, n) => `<div><b>${n + 1}</b><span>${layer}</span></div>`).join('')}</div>` : ''}${i === 8 ? `<ol class="sql-flow" aria-label="SQL 논리 처리 순서">${['FROM / JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'].map((step) => `<li>${step}</li>`).join('')}</ol>` : ''}</article>`).join('');
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
  <meta name="description" content="10월 25일 오전 정보처리기사 실기 대비 수업자료. 21일 커리큘럼, 9개 분야 핵심 이론, 24문항과 해설을 한곳에서 확인하세요.">
  <meta name="theme-color" content="#127761">
  <meta property="og:title" content="정보처리기사 실기 | 10월 25일 오전 수업">
  <meta property="og:description" content="날짜별 커리큘럼 · 9개 분야 이론 · 24문항 실전 연습과 해설">
  <meta property="og:type" content="website">
  <title>정보처리기사 실기 | 10월 25일 오전 수업</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23127761'/%3E%3Cpath d='M8 8h7v17H8zm9 0h7v17h-7z' fill='white'/%3E%3C/svg%3E">
  <link rel="stylesheet" href="./styles.css">
  <script src="./app.js" defer></script>
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
      <div class="metrics"><div><span>마무리 커리큘럼</span><b>21<span>일</span></b><small>10.05–10.25</small></div><div><span>핵심 분야</span><b>9<span>개</span></b><small>이론 + C · Java · Python · SQL</small></div><div><span>실전 문제</span><b>24<span>문항</span></b><small>권장 풀이 45분</small></div><div><span>오전 수업</span><b>180<span>분</span></b><small>권장안 09:00–12:00</small></div></div>
    </header>
    <section id="curriculum" class="section">
      ${header('01', '날짜별 커리큘럼', '10월 5일부터 25일까지')}
      <div class="phase-map" aria-label="학습 단계"><div><span>10.05–10.13</span><b>핵심 범위 정리</b><p>개발 · 설계 · 보안 · 언어별 복습</p></div><div><span>10.14–10.19</span><b>2회독과 약점 보완</b><p>DB · OS · 네트워크 · 통합 문제</p></div><div><span>10.20–10.25</span><b>실전 점검과 마무리</b><p>분야별 시험 · 모의고사 · 요약</p></div></div>
      <div class="prose curriculum">${curriculum}</div>
    </section>
    <section id="schedule" class="section">${header('02', '25일 오전 수업', '총 180분 권장 운영안')}<p class="section-note">수업 시작 시간에 맞춰 조정하는 권장 시간표입니다. 전체 24문항 연습은 별도 45분을 확보하고, 수업 말미에는 선택한 오답을 복습합니다.</p><div class="prose">${schedule}</div><details class="teacher-note"><summary>${icon('Presentation')}<span>수업 운영과 판서안</span>${icon('ChevronDown')}</summary><div class="prose">${html(section(2).tokens)}${html(section(8).tokens)}</div></details></section>
    <section id="theory" class="section">${header('03', '분야별 핵심 이론', '암기 기준과 풀이 순서')}<nav class="domain-nav" aria-label="분야 선택">${domainNames.map((name, i) => `<a href="#domain-${i}">${name}</a>`).join('')}</nav>${theory}</section>
    <section id="diagnosis" class="section">${header('04', '시작 전 진단', '8문항 · 10분')}<div class="prose diagnosis">${diagnosis}</div></section>
    <section id="practice" class="section">${header('05', '24문항 실전 연습', '권장 풀이 45분')}<div class="practice-toolbar"><p>DB부터 SQL까지 · 자체 제작 연습문제</p><button class="text-button" id="toggle-answers" type="button" aria-expanded="false">${icon('Eye')}<span>전체 해설 펼치기</span></button></div><div class="questions">${practice}</div><details class="teacher-note"><summary>${icon('ClipboardCheck')}<span>복습 기준</span>${icon('ChevronDown')}</summary><div class="prose"><ul><li>20문항 이상 정답: 현재 루틴을 유지하고 출력 형식과 계산 실수를 점검합니다.</li><li>16–19문항 정답: 코딩/SQL 오답을 우선 재풀이합니다.</li><li>12–15문항 정답: 이론 암기와 코드 추적을 함께 보완합니다.</li><li>11문항 이하 정답: 키·정규화, 테스트, 패턴, 웹 공격, 세 언어와 SQL의 기본 문제부터 다시 풉니다.</li></ul><p>이 연습문제의 정답 수는 학습 진단용입니다.</p></div></details></section>
    <section id="checklist" class="section">${header('06', '최종 점검', '마지막 회독')}<div class="prose checklist">${html(section(9).tokens)}</div><details class="teacher-note"><summary>${icon('ListChecks')}<span>이론 · 코딩 · SQL 풀이 루틴</span>${icon('ChevronDown')}</summary><div class="prose">${html(section(7).tokens)}</div></details></section>
    <section id="sources" class="section">${header('07', '참고 자료', '원본 커리큘럼과 내려받기')}<p class="section-note">정처기 감자의 분야별 구성과 날짜별 학습 계획을 참고해 재구성한 수업자료입니다. 운영 시간표와 연습문제는 이 수업을 위해 별도로 작성했습니다.</p><div class="source-grid">${sourceLinks.map(([title, url, note]) => `<a class="source-link" href="${url}" target="_blank" rel="noopener noreferrer"><span><b>${title}</b><small>${note}</small></span>${icon('ExternalLink')}</a>`).join('')}</div><div class="downloads">${[['morning_class', '강사용 수업자료'], ['problem_sheet', '수강생 문제지'], ['answer_key', '정답 및 해설']].map(([name, label]) => `<a href="./materials/jeongcheogi_2026-10-25_${name}.md" download>${icon('FileDown')}${label}<span>MD</span></a>`).join('')}</div><p class="repository-link"><a href="https://github.com/Lsom5064/jeongcheogi-practical-class-2026" target="_blank" rel="noopener noreferrer">${icon('GitFork')} 공개 GitHub 저장소</a></p></section>
    <footer class="page-footer"><span>정보처리기사 실기 · 2026.10.25 오전 수업자료</span><a href="#overview">맨 위로</a></footer>
  </main>
</body>
</html>`;
mkdirSync(path.join(root, 'dist', 'materials'), { recursive: true });
writeFileSync(path.join(root, 'dist', 'index.html'), page);
for (let i = 0; i < sourceNames.length; i++) copyFileSync(path.join(root, 'materials', `jeongcheogi_2026-10-25_${sourceNames[i]}.md`), path.join(root, 'dist', 'materials', `jeongcheogi_2026-10-25_${sourceNames[i]}.md`));
console.log(`Built ${domains.length} subject notes, ${questionGroups.length} paired questions and 21 curriculum days.`);

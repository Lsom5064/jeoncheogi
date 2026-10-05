# 정보처리기사 실기 공개 수업자료

2026년 10월 25일 오전 수업을 위한 정적 웹사이트입니다. 날짜별 커리큘럼, 9개 분야 55주제 상세 이론, 8문항 진단, 80문항 답안 입력과 채점, 모의고사, 최종 점검 자료를 한 페이지에 제공합니다.

[GitHub Pages 주소](https://lsom5064.github.io/jeoncheogi/) · [공개 저장소](https://github.com/Lsom5064/jeoncheogi) · [기존 공개 웹사이트](https://jeongcheogi-practical-class-2026.knu-hai-5040.chatgpt.site)

GitHub 저장소 이름은 요청한 `jeoncheogi`로 변경했고 GitHub Actions 기반 Pages 배포를 완료했습니다. 새 주소에서 80문항과 웹 자산의 정상 로드를 확인했습니다. 이후 배포 상태와 최신 버전은 저장소 Actions에서 확인합니다. 기존 공개 웹사이트도 유지합니다.

## 구성

- `dist/index.html`: 웹 수업자료
- `dist/styles.css`, `dist/learning.css`: 데스크톱, 모바일, 인쇄 스타일
- `dist/app.js`: 해설 펼치기, 목차, 인쇄
- `dist/learning.js`: 답안 저장, 채점, 오답 필터, 제한시간 모의고사, 원본 시험 연결
- `dist/grading.js`: 용어, 수치, 코드 출력, SQL 결과, 서술형 핵심어 비교
- `content/questions.mjs`: 기본 24문항 채점 규칙과 추가 36문항, 원본 시험 주소
- `content/pdf-mock.mjs`: 공개 PDF의 유형을 참고한 별도 20문항과 고정 시험 구성, 출처
- `materials/`: 원본 Markdown 수업자료, 문제지, 해설
- `scripts/build.mjs`: 원본에서 웹 문서를 생성
- `scripts/serve.mjs`: 로컬 미리보기
- `test/grading.test.mjs`: 채점과 출제 구성 회귀 테스트
- `.github/workflows/pages.yml`: 빌드·테스트 후 `dist/`만 GitHub Pages로 배포

## 실행

`dist/index.html`을 브라우저에서 직접 열어도 수업용 기능은 동작합니다. 로컬 파일 환경에서는 브라우저별 저장 정책이 다르므로 공개 웹사이트 또는 로컬 미리보기를 권장합니다. 자체 자료와 아이콘은 저장소에 포함되며 외부 CDN을 사용하지 않습니다. 원본 시험 연결에는 인터넷이 필요합니다.

```sh
npm install
npm run build
npm test
npm run preview
```

미리보기 기본 주소는 `http://127.0.0.1:4173`입니다. 다른 포트는 `PORT` 환경변수로 지정합니다. 이론은 `materials/detailed_theory.md`, 추가 문제와 허용 답안은 `content/questions.mjs`를 편집하고 다시 빌드합니다. `dist/index.html`, `dist/question-bank.js`, `dist/materials/`는 빌드로 생성됩니다. 나머지 `dist/`의 CSS/JS는 직접 관리하는 정적 자산입니다.

## 문제 풀이와 모의고사

- 연습 80문항: 개별/전체 채점, 분야 필터, 오답·미응답 복습, 정답과 해설.
- PDF 유형 응용 1회: 61-80번 고정 20문항. 공개 PDF의 대표 유형과 Python·SQL 보강 문항으로 구성한 자체 작성 시험.
- 종합 20문항: 이론 10 + 코딩·SQL 10, 각 분야 균형 무작위 출제.
- 이론 10문항: DB, 네트워크/OS, SW개발, SW설계, 보안/신기술 각 2문항.
- 코딩·SQL 10문항: C 2, Java 2, Python 3, SQL 3문항.
- 제한시간 15/30/60/150분, 종료 시 제출, 100점 환산과 분야별 결과, 오답 재시험.
- 답안과 진행 중인 시험은 현재 브라우저의 `localStorage`에 저장됩니다. 서버 전송이나 기기 간 동기화는 없으며, 새로고침해도 시험 마감 시각은 연장되지 않습니다.

채점은 수업용 비교 규칙이며 실제 시험의 공식 채점 기준이 아닙니다. 용어는 허용 한글/영문 표현을 비교하고 수치·출력은 값과 형식을 확인합니다. 서술형 핵심어 검사는 의미를 완전히 이해하지 못하므로 검토 대상으로 표시된 답안은 해설과 대조하여 직접 정답/오답을 지정합니다.

정처기 감자 원본 탭에서는 파이널, 이론/코딩 실전 퀴즈, 2025년 2·3회 기출을 원본 화면으로 연결합니다. 파이널은 원본 사이트의 Premium 이상 이용권이 필요합니다. 로그인이나 화면 표시가 제한되면 새 탭으로 열 수 있습니다. 원본 문제·답안·점수는 해당 사이트에서 관리하며, 유료 문제은행을 복제하거나 접근 제한을 우회하지 않습니다. 수업용 모의고사는 별도로 작성한 80문항에서 출제합니다.

PDF 유형 응용 시험은 [길벗이 공개한 시나공 실기 PDF](https://marketing.gilbut.co.kr/files/event/sinagongit/sinagong_pass100.pdf)의 텍스트를 분석하고 대표 주제를 참고했습니다. PDF는 2020년 자료이므로 2026년 최신 기출이라고 표시하지 않습니다. 원문 문제·해설과 PDF 파일은 저장소에 복제하지 않았고, 문제 조건·시나리오·코드를 별도로 작성했습니다. 분석 범위와 보강 문항은 [출처 기록](materials/pdf_mock_provenance.md)에 구분했습니다.

## GitHub Pages

별도 도메인을 사용하지 않으며 `itjungmin.com` DNS 설정은 필요하지 않습니다. 프로젝트 Pages 주소의 형식은 `https://<계정>.github.io/<저장소>/`입니다. 요청한 저장소 이름은 `jeoncheogi`입니다.

1. 기존 저장소의 Settings > General > Repository name을 `jeoncheogi`로 변경합니다. 같은 이름의 다른 저장소가 있다면 덮어쓰거나 삭제하지 않습니다.
2. Settings > Pages > Build and deployment > Source에서 `GitHub Actions`를 선택합니다.
3. 이 소스를 `main`에 업로드합니다. Actions의 `Deploy Class Website`가 빌드·채점 테스트 후 웹사이트를 배포합니다. 필요하면 Run workflow로 다시 실행합니다.
4. 배포 작업이 성공하고 Pages에서 실제 URL이 표시된 뒤 공개 주소로 안내합니다. 목표 URL만으로 배포 성공을 판단하지 않습니다.

웹 자산과 자료 링크는 상대경로이므로 `/jeoncheogi/` 하위 경로에서 동작합니다. GitHub Pages로 옮기면 브라우저 저장소가 기존 Sites 주소와 달라서 기존 답안이 자동으로 이동하지 않습니다. Pages는 공개 학습자료용이며 정답도 클라이언트 파일에 포함됩니다. 비공개 유료 문제은행이나 감독 시험의 보안 채점 서버로 사용하지 않습니다.

## 참고 및 수업 운영

- [정처기 감자](https://jeongcheogi.edugamja.com/)
- [이론 4주 공부 계획](https://jeongcheogi.edugamja.com/theory/4week-study-plan)
- [코딩 6주 공부 계획](https://jeongcheogi.edugamja.com/coding/coding-study-plan)

커리큘럼과 분야별 주제는 위 자료를 참고해 수업용으로 재구성했습니다. 연습문제는 자체 제작했습니다. 참고 사이트의 공식 운영 페이지가 아닙니다.

오전 09:00–12:00은 수업 운영 권장안이며 실제 시작 시각에 맞춰 조정합니다. 기본 24문항 문제지는 별도로 45분을 확보하고, 수업 마지막 15분에는 대표 오답을 선택해 복습합니다. 확장 80문항은 분야별 복습과 모의고사 문제은행으로 활용합니다.

# 정보처리기사 실기 공개 수업자료

2026년 10월 25일 오전 수업을 위한 정적 웹사이트입니다. 날짜별 커리큘럼, 9개 분야 핵심 이론, 8문항 진단, 24문항 연습문제와 해설, 최종 점검 자료를 한 페이지에 제공합니다.

[수업 웹사이트](https://jeongcheogi-practical-class-2026.knu-hai-5040.chatgpt.site) · [공개 저장소](https://github.com/Lsom5064/jeongcheogi-practical-class-2026)

## 구성

- `dist/index.html`: 웹 수업자료
- `dist/styles.css`: 데스크톱, 모바일, 인쇄 스타일
- `dist/app.js`: 해설 펼치기, 목차, 인쇄
- `materials/`: 원본 Markdown 수업자료, 문제지, 해설
- `scripts/build.mjs`: 원본에서 웹 문서를 생성
- `scripts/serve.mjs`: 로컬 미리보기

## 실행

`dist/index.html`을 브라우저에서 직접 열어도 동작합니다. 모든 수업자료와 아이콘은 저장소에 포함되며 외부 CDN을 사용하지 않습니다.

```sh
npm install
npm run build
npm run preview
```

미리보기 기본 주소는 `http://127.0.0.1:4173`입니다. 다른 포트는 `PORT` 환경변수로 지정합니다. 자료를 수정할 때는 `materials/`의 Markdown을 편집하고 다시 빌드합니다. `dist/`는 빌드 결과이며 저장소에 함께 포함됩니다.

## 참고 및 수업 운영

- [정처기 감자](https://jeongcheogi.edugamja.com/)
- [이론 4주 공부 계획](https://jeongcheogi.edugamja.com/theory/4week-study-plan)
- [코딩 6주 공부 계획](https://jeongcheogi.edugamja.com/coding/coding-study-plan)

커리큘럼과 분야별 주제는 위 자료를 참고해 수업용으로 재구성했습니다. 연습문제는 자체 제작했습니다. 참고 사이트의 공식 운영 페이지가 아닙니다.

오전 09:00–12:00은 수업 운영 권장안이며 실제 시작 시각에 맞춰 조정합니다. 전체 문제지는 별도로 45분을 확보하고, 수업 마지막 15분에는 대표 오답을 선택해 복습합니다.

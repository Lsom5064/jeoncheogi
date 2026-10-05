export const baseGrading = {
  1: { kind: 'set', groups: [['학번'], ['과목코드']] },
  2: { kind: 'rubric', groups: [['부분함수종속', '부분종속'], ['과목코드', '후보키일부', '기본키일부', '복합키일부']] },
  3: { kind: 'term', values: ['지속성', '영속성', 'Durability'] },
  4: { kind: 'number', value: 7, units: ['회', '번'] },
  5: { kind: 'number', value: 3, units: ['초'] },
  6: { kind: 'number', value: 62, units: ['개', '대', '명'] },
  7: { kind: 'output', values: ['rwx,r-x,r--', 'rwx r-x r--', '소유자 rwx 그룹 r-x 기타 r--', '소유자:rwx,그룹:r-x,기타:r--'] },
  8: { kind: 'term', values: ['경계값 분석', '경계값 분석 테스트', 'Boundary Value Analysis', 'BVA'] },
  9: { kind: 'sequence', groups: [['단위', '단위테스트', 'Unit Test', 'Unit Testing'], ['통합', '통합테스트', 'Integration Test', 'Integration Testing'], ['시스템', '시스템테스트', 'System Test', 'System Testing'], ['인수', '인수테스트', 'Acceptance Test', 'Acceptance Testing']] },
  10: { kind: 'set', groups: [['형상식별', '식별'], ['형상통제', '통제'], ['형상감사', '감사'], ['형상기록', '기록', '형상상태기록', '상태기록']] },
  11: { kind: 'term', values: ['팩토리 메서드', '팩토리 메서드 패턴', 'Factory Method', 'Factory Method Pattern', '팩토리 메소드', '팩토리 메소드 패턴'] },
  12: { kind: 'term', values: ['기능적 응집도', '기능적', 'Functional Cohesion'] },
  13: { kind: 'term', values: ['합성', '합성관계', 'Composition', '복합관계'] },
  14: { kind: 'set', groups: [['기밀성', 'Confidentiality'], ['무결성', 'Integrity'], ['가용성', 'Availability']] },
  15: { kind: 'term', values: ['SQL Injection', 'SQL 인젝션', 'SQL 삽입 공격', 'SQL 주입', 'SQL 주입 공격'] },
  16: { kind: 'term', values: ['RBAC', 'Role Based Access Control', '역할 기반 접근 통제', '역할 기반 접근통제 모델'] },
  17: { kind: 'number', value: 8 },
  18: { kind: 'number', value: 1800 },
  19: { kind: 'output', values: ['1,2'] },
  20: { kind: 'number', value: 3 },
  21: { kind: 'output', values: ['[2, 4, 6]'] },
  22: { kind: 'number', value: 4 },
  23: { kind: 'row', cells:['DB',80], headers:['SUBJECT','AVG_SCORE'] },
  24: { kind: 'number', value: 3, units: ['행', '개'] }
};

const term = (...values) => ({ kind: 'term', values });
const number = (value, ...units) => ({ kind: 'number', value, units });
const output = (...values) => ({ kind: 'output', values });
const q = (id, domain, title, body, expected, explanation, grading) => ({id,domain,title,body,answer:`정답: ${expected}\n\n해설: ${explanation}`,expected,grading:grading.kind==='term'?{...grading,values:[expected,...grading.values]}:grading});

// These are independently authored course questions; original site tests are connected live in the exam view.
export const additionalQuestions = [
  q(25,'DB','스키마','저장 장치의 파일 배치와 인덱스 같은 물리적 구조를 기술하는 스키마의 이름을 쓰시오.','내부 스키마','외부는 사용자 관점, 개념은 전체 논리 구조, 내부는 저장 관점이다.',term('내부 스키마','Internal Schema')),
  q(26,'DB','이행 종속','학생 테이블의 학번이 학과코드를 결정하고 학과코드가 학과명을 결정한다. 학과명이 후보키인 학번에 이행 종속되는 문제를 제거하는 정규형을 쓰시오.','제3정규형(3NF)','부분 종속 제거는 2NF, 비주요 속성의 이행 종속 제거는 3NF다.',term('3NF','제3정규형','3정규형','Third Normal Form')),
  q(27,'DB','관계대수','릴레이션에서 특정 열을 선택해 남기고 중복 튜플을 제거하는 관계대수 연산을 쓰시오.','프로젝트(Projection)','행 조건은 선택, 열을 남기는 연산은 프로젝트다.',term('프로젝트','프로젝션','투영','Projection','π')),
  q(28,'DB','트랜잭션','송금 중 출금만 성공하고 입금이 실패한 경우 전체 송금을 취소해야 한다. 이 원칙에 대응하는 ACID 성질을 쓰시오.','원자성','작업을 전부 완료하거나 전부 취소하는 all-or-nothing 성질이다.',term('원자성','Atomicity')),
  q(29,'네트워크/OS','서브넷 주소','IPv4 주소 `192.168.10.130/26`의 네트워크 주소를 쓰시오.','192.168.10.128','마지막 옥텟의 블록 크기는 64이며 130은 128–191 블록에 속한다.',output('192.168.10.128')),
  q(30,'네트워크/OS','라우팅','거리 벡터 방식을 사용하고 홉 수를 메트릭으로 사용하며 유효한 최대 홉 수가 15인 라우팅 프로토콜을 쓰시오.','RIP','16홉은 도달 불가능으로 취급한다. OSPF는 링크 상태 방식이다.',term('RIP','Routing Information Protocol')),
  q(31,'네트워크/OS','페이지 교체','페이지를 교체할 때 과거에 가장 오래 참조되지 않은 페이지를 선택하는 알고리즘을 쓰시오.','LRU','FIFO는 들어온 순서, LRU는 마지막 사용 시점, OPT는 앞으로의 사용 시점을 본다.',term('LRU','Least Recently Used')),
  q(32,'네트워크/OS','교착상태','상호 배제, 점유와 대기, 비선점과 함께 교착상태의 네 필요 조건에 포함되는 나머지 조건을 쓰시오.','순환 대기','프로세스들이 자원을 순환 구조로 기다리는 상태다.',term('순환 대기','환형 대기','Circular Wait')),
  q(33,'네트워크/OS','라운드 로빈','P1과 P2는 모두 시간 0에 도착한다. 실행 시간은 각각 4, 2이고 시간 할당량은 2다. P1부터 RR로 실행하고 문맥 교환 시간은 무시할 때 P1의 대기 시간을 구하시오.','2','P1 0–2, P2 2–4, P1 4–6으로 실행한다. P1의 반환 시간 6에서 실행 시간 4를 빼면 2다.',number(2,'초')),
  q(34,'SW개발','테스트 대역','상향식 통합 테스트에서 하위 모듈을 호출하는 상위 모듈의 역할을 대신하는 테스트 대역을 쓰시오.','드라이버','하향식 통합의 하위 모듈 대역은 스텁이다.',term('드라이버','Driver','Test Driver','테스트 드라이버')),
  q(35,'SW개발','테스트 커버리지','판단식의 참 결과와 거짓 결과를 모두 실행했는지 측정하는 커버리지를 쓰시오.','분기 커버리지','결정 커버리지라고도 한다. 각 개별 조건의 참·거짓을 검사하는 조건 커버리지와 구별한다.',term('분기 커버리지','결정 커버리지','Branch Coverage','Decision Coverage','분기','결정')),
  q(36,'SW개발','회귀 테스트','오류를 수정한 후 이전에 정상 동작하던 기능이 여전히 정상인지 확인하는 테스트를 쓰시오.','회귀 테스트','변경 때문에 기존 동작에 생긴 부작용을 찾는다.',term('회귀 테스트','Regression Testing','Regression Test')),
  q(37,'SW개발','데이터 형식','객체와 배열을 표현하고 키에 문자열을 사용하며 표준 문법에서 주석을 허용하지 않는 데이터 교환 형식을 쓰시오.','JSON','XML은 태그 구조를 사용하고 YAML은 들여쓰기를 구조에 활용한다.',term('JSON','JavaScript Object Notation')),
  q(38,'SW설계','알림 패턴','주문 상태가 바뀌면 알림 서비스와 통계 서비스 등 여러 구독 객체에 변경을 통지한다. 해당 행위 패턴을 쓰시오.','Observer','관찰 대상의 상태 변경을 등록된 관찰자들에게 알리는 패턴이다.',term('Observer','Observer Pattern','옵저버','옵저버 패턴','관찰자','관찰자 패턴')),
  q(39,'SW설계','알고리즘 교체','배송비 계산 방식들을 객체로 분리하여 실행 중 선택해 바꾸려 한다. 해당 행위 패턴을 쓰시오.','Strategy','같은 목적의 여러 알고리즘을 캡슐화하여 교체 가능하게 만든다.',term('Strategy','Strategy Pattern','전략','전략 패턴','스트래티지')),
  q(40,'SW설계','SOLID','모듈이 구체적인 데이터베이스 구현이 아니라 저장소 인터페이스에 의존하게 한다. 이 설계 방향에 해당하는 SOLID 원칙의 약자를 쓰시오.','DIP','의존 역전 원칙이다. 고수준 정책과 저수준 세부 구현은 추상에 의존하게 한다.',term('DIP','Dependency Inversion Principle','의존 역전 원칙','의존성 역전')),
  q(41,'SW설계','UML','객체 간 메시지를 시간 순서대로 표현하는 UML 다이어그램을 쓰시오.','시퀀스 다이어그램','클래스 다이어그램은 정적인 구조, 시퀀스는 시간 흐름에 따른 상호작용을 다룬다.',term('시퀀스 다이어그램','순차 다이어그램','Sequence Diagram','시퀀스','순차')),
  q(42,'보안/신기술','요청 위조','로그인되어 있는 사용자의 브라우저로 원치 않는 계정 변경 요청을 보내게 하는 공격의 약자를 쓰시오.','CSRF','사용자의 인증 상태를 이용한다. XSS는 브라우저에서 악성 스크립트가 실행되는 공격이다.',term('CSRF','Cross Site Request Forgery','크로스 사이트 요청 위조','사이트 간 요청 위조')),
  q(43,'보안/신기술','로그 분석','서로 다른 시스템에서 발생한 보안 로그와 이벤트를 수집하고 상관 분석하는 솔루션의 약자를 쓰시오.','SIEM','SOAR는 대응 절차의 자동화·연계를, EDR은 단말의 탐지·대응을 중심으로 한다.',term('SIEM','Security Information and Event Management')),
  q(44,'보안/신기술','AES','AES가 사용하는 블록의 크기를 비트 단위로 쓰시오.','128','블록 크기 128비트와 키 길이 128·192·256비트를 구분한다.',number(128,'비트','bit','bits')),
  q(45,'보안/신기술','클라우드','서버, 스토리지, 네트워크 같은 인프라를 제공하고 사용자가 운영체제와 애플리케이션을 관리하는 서비스 모델의 약자를 쓰시오.','IaaS','PaaS는 플랫폼, SaaS는 완성된 소프트웨어를 제공한다.',term('IaaS','Infrastructure as a Service')),
  q(46,'보안/신기술','네트워크 신기술','네트워크의 제어 영역과 데이터 전달 영역을 분리하는 기술의 약자를 쓰시오.','SDN','Software Defined Networking이며 NFV는 네트워크 기능의 가상화에 초점을 맞춘다.',term('SDN','Software Defined Networking')),
  q(47,'C언어','재귀 합','다음 코드의 출력 결과를 쓰시오.\n\n```c\n#include <stdio.h>\nint sum(int n) {\n    if (n == 0) return 0;\n    return n + sum(n - 1);\n}\nint main(void) {\n    printf("%d", sum(4));\n    return 0;\n}\n```','10','sum(4)는 4+3+2+1+0으로 계산된다.',number(10)),
  q(48,'C언어','포인터 이동','다음 코드의 출력 결과를 쓰시오.\n\n```c\n#include <stdio.h>\nint main(void) {\n    int a[] = {3, 6, 9};\n    int *p = a;\n    ++p;\n    *p += 1;\n    printf("%d", a[1]);\n    return 0;\n}\n```','7','++p로 두 번째 원소를 가리킨 뒤 그 값을 6에서 7로 바꾼다.',number(7)),
  q(49,'C언어','비트 XOR','다음 코드의 출력 결과를 쓰시오.\n\n```c\n#include <stdio.h>\nint main(void) {\n    unsigned int x = 7;\n    printf("%u", x ^ 3u);\n    return 0;\n}\n```','4','111과 011의 XOR는 100이다. ^는 거듭제곱 연산이 아니다.',number(4)),
  q(50,'Java','필드와 메서드','다음 코드의 출력 결과를 쓰시오.\n\n```java\nclass Parent {\n    int value = 4;\n    int get() { return value; }\n}\nclass Child extends Parent {\n    int value = 9;\n    int get() { return value; }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Parent p = new Child();\n        System.out.print(p.value + "," + p.get());\n    }\n}\n```','4,9','필드는 참조 타입 Parent 기준으로 4, 인스턴스 메서드는 실제 타입 Child 기준으로 9다.',output('4,9')),
  q(51,'Java','문자열 비교','다음 코드의 출력 결과를 쓰시오.\n\n```java\npublic class Main {\n    public static void main(String[] args) {\n        String a = new String("DB");\n        String b = new String("DB");\n        System.out.print((a == b) + "," + a.equals(b));\n    }\n}\n```','false,true','new로 만든 두 객체의 참조는 다르지만 문자열 내용은 같다.',output('false,true')),
  q(52,'Java','예외 흐름','다음 코드의 출력 결과를 쓰시오.\n\n```java\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            int zero = 0;\n            System.out.print(8 / zero);\n        } catch (ArithmeticException e) {\n            System.out.print("A");\n        } finally {\n            System.out.print("B");\n        }\n    }\n}\n```','AB','0으로 정수 나눗셈을 하여 catch에서 A, finally에서 B를 출력한다.',output('AB')),
  q(53,'Python','복사와 별칭','다음 코드의 출력 결과를 쓰시오.\n\n```python\na = [1, 2]\nb = a\nc = a[:]\nb.append(3)\nprint(len(a), len(c))\n```','3 2','b는 a와 같은 리스트를 참조한다. c는 별도로 만든 얕은 복사이며 바깥 리스트 길이는 2다.',output('3 2')),
  q(54,'Python','제너레이터 합','다음 코드의 출력 결과를 쓰시오.\n\n```python\nprint(sum(n * n for n in range(1, 4)))\n```','14','range의 마지막 4는 포함하지 않으므로 1+4+9를 더한다.',number(14)),
  q(55,'Python','음수 나눗셈','다음 코드의 출력 결과를 쓰시오.\n\n```python\nprint(-7 // 3, -7 % 3)\n```','-3 2','바닥 나눗셈은 -3이다. -7 = (-3)*3 + 2이므로 나머지는 2다.',output('-3 2')),
  q(56,'Python','리스트 내포','다음 코드의 출력 결과를 쓰시오.\n\n```python\nvalues = [1, 2, 3, 4, 5]\nprint([n * 2 for n in values if n % 2 == 0])\n```','[4, 8]','짝수 2와 4를 골라 각각 두 배로 만든다.',output('[4, 8]')),
  q(57,'SQL','NULL과 COUNT','테이블 `T`의 `SCORE` 값이 세 행에 각각 80, NULL, 100이다. 아래 결과를 열 순서대로 쓰시오.\n\n```sql\nSELECT COUNT(*), COUNT(SCORE) FROM T;\n```','3,2','COUNT(*)는 전체 행, COUNT(SCORE)는 SCORE가 NULL이 아닌 행을 센다.',output('3,2','3 2','3|2')),
  q(58,'SQL','LEFT JOIN 행 수','학생 테이블에는 SID 1,2,3이 각각 한 행씩 있다. 신청 테이블에는 SID 1이 두 행, SID 3이 한 행 있다. 학생을 왼쪽으로 LEFT JOIN하고 추가 필터를 적용하지 않을 때 결과 행 수를 쓰시오.','4','학생 1의 매칭 2행, 학생 2의 매칭 없는 1행, 학생 3의 매칭 1행으로 합계 4다.',number(4,'행','개')),
  q(59,'SQL','집계와 HAVING','`SALES`의 (DEPT, AMOUNT)는 (A,30), (A,20), (B,40), (B,50) 네 행이다. 아래 결과의 DEPT와 TOTAL을 쓰시오.\n\n```sql\nSELECT DEPT, SUM(AMOUNT) AS TOTAL\nFROM SALES\nGROUP BY DEPT\nHAVING SUM(AMOUNT) >= 70\nORDER BY DEPT;\n```','B,90','A의 합계는 50, B의 합계는 90이며 B만 HAVING 조건을 만족한다.',{kind:'row',cells:['B',90],headers:['DEPT','TOTAL']}),
  q(60,'SQL','중복 제거','질의 A가 1,2 두 행을 반환하고 질의 B가 2,3 두 행을 반환한다. 두 질의를 UNION으로 합쳤을 때 결과 행 수를 쓰시오.','3','UNION은 중복 2를 제거하므로 1,2,3의 3행이다. UNION ALL이면 4행이다.',number(3,'행','개')),
  q(81,'보안/신기술','서비스 거부','공격자 한 대가 다량의 연결 요청을 보내 서버의 연결 자원을 소진시킨다. 여러 공격 장비가 동시에 참여하지 않는 이 공격의 유형을 쓰시오.','DoS','여러 공격원이 분산 참여하면 DDoS다.',term('DoS','Denial of Service','서비스 거부')),
  q(82,'DB','릴레이션 크기','학생 릴레이션에 6개 행과 4개 속성이 있다. 카디널리티와 차수를 차례로 쓰시오.','6, 4','카디널리티는 튜플(행)의 수, 차수는 속성(열)의 수다.',output('6,4','6 4','6 / 4')),
  q(83,'DB','Redo 회복','커밋이 확인된 트랜잭션의 변경이 데이터 페이지에 반영되기 전에 장애가 발생했다. 로그를 이용해 완료된 변경을 다시 적용하는 동작을 쓰시오.','Redo','완료된 작업은 Redo, 완료되지 않은 작업은 Undo 대상으로 복구한다.',term('Redo','재수행','재실행')),
  q(84,'SW설계','행위 패턴','사용자가 요청을 객체로 만들어 대기열에 넣거나 나중에 실행하고, 요청 이력을 기록하려 한다. 알맞은 디자인 패턴을 쓰시오.','Command','Command 패턴은 요청 자체를 객체로 캡슐화한다.',term('Command','Command Pattern','커맨드','커맨드 패턴')),
  q(85,'네트워크/OS','서브넷 브로드캐스트','IPv4 주소 10.4.8.77에 서브넷 마스크 255.255.255.224를 적용한다. 이 주소가 속한 서브넷의 브로드캐스트 주소를 쓰시오.','10.4.8.95','마지막 옥텟 블록 크기는 32다. 77은 64–95 범위이므로 브로드캐스트는 .95다.',output('10.4.8.95')),
  q(86,'SW개발','요구사항 분류','시스템이 어떤 기능을 제공하는지가 아니라 응답 시간, 보안 수준 등 품질이나 제약을 정의한다. 이 요구사항의 분류를 쓰시오.','비기능 요구사항','기능 요구사항은 시스템이 수행할 기능과 서비스 자체를 기술한다.',term('비기능 요구사항','비기능적 요구사항','Non-functional Requirement','NFR')),
  q(87,'네트워크/OS','오류 제어','송신 측에 재전송을 요청하지 않고 수신 측이 여분의 부호 비트를 이용해 전송 오류를 스스로 복구하는 방식의 약자를 쓰시오.','FEC','Forward Error Correction의 약자다. ARQ는 오류 검출 후 재전송을 요청한다.',term('FEC','Forward Error Correction','순방향 오류 정정')),
  q(88,'네트워크/OS','해밍 코드','수신 측에서 한 비트 오류의 위치를 알아내어 고칠 수 있는 대표적인 오류 정정 코드의 이름을 쓰시오.','해밍 코드','패리티 비트 배치로 오류 위치를 계산하는 대표적인 정정 코드다.',term('해밍 코드','Hamming Code','Hamming')),
  q(89,'네트워크/OS','해밍 코드 계산','데이터 비트 수 m=4인 단일 오류 정정 해밍 코드에서 필요한 최소 패리티 비트 수 r을 구하시오. (2^r ≥ m+r+1)','3','r=2이면 4<7이라 부족하고, r=3이면 8≥8을 만족한다.',number(3,'비트','개')),
  q(90,'보안/신기술','클라우드 서비스 모델','사용자가 애플리케이션 코드와 데이터를 관리하고, 제공자는 실행 환경과 기반 인프라를 관리하는 클라우드 서비스 모델의 약자를 쓰시오.','PaaS','PaaS는 애플리케이션 개발·실행 플랫폼을 제공한다. IaaS는 인프라, SaaS는 완성된 소프트웨어를 제공한다.',term('PaaS','Platform as a Service'))
];

export const sourceExams = [
  {id:'final', title:'파이널 모의고사', url:'https://jeongcheogi.edugamja.com/final-mock-exam', note:'20문항 · 이론 10 + 코딩 10 · Premium 이상'},
  {id:'theory', title:'이론 실전 감자퀴즈', url:'https://jeongcheogi.edugamja.com/theory/potato-theory-quiz', note:'이론 11–12문항 · 랜덤 출제'},
  {id:'coding', title:'코딩 실전 감자퀴즈', url:'https://jeongcheogi.edugamja.com/coding/potato-coding-quiz', note:'10문항 · SQL 3 / C 2 / Java 2 / Python 3'},
  {id:'past2025-3', title:'2025년 3회 기출', url:'https://jeongcheogi.edugamja.com/past-exam/2025/2025-3', note:'원본 회차별 기출과 채점'},
  {id:'past2025-2', title:'2025년 2회 기출', url:'https://jeongcheogi.edugamja.com/past-exam/2025/2025-2', note:'원본 회차별 기출과 채점'}
];

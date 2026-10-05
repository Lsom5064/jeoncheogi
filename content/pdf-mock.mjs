export const pdfSource = {
  title:'시나공 공개 정보처리기사 실기 PDF (2020)',
  url:'https://marketing.gilbut.co.kr/files/event/sinagongit/sinagong_pass100.pdf',
  inspectedPages:'178-183, 207-210',
  note:'공개 PDF의 대표 유형을 참고한 자체 작성 문제입니다. 원문 문제·해설을 복제한 시험이나 최신 공식 기출이 아닙니다. Python·SQL 보강 문항을 포함합니다.'
};

export const examSets = [{id:'pdf-variant-1',title:'PDF 유형 응용 1회',ids:Array.from({length:20},(_,index)=>61+index),source:pdfSource}];
const term=(...values)=>({kind:'term',values});
const number=(value,...units)=>({kind:'number',value,units});
const output=(...values)=>({kind:'output',values});
const q=(id,domain,title,body,expected,explanation,grading)=>({id,domain,title,body,expected,examSet:'pdf-variant-1',answer:`정답: ${expected}\n\n해설: ${explanation}`,grading:grading.kind==='term'?{...grading,values:[expected,...grading.values]}:grading});

// New scenarios and code, not an extraction or reproduction of the publisher's questions.
export const pdfMockQuestions = [
  q(61,'DB','이상 현상 사례','주문(주문번호, 고객번호, 고객주소)에 고객주소를 반복 저장한다. 한 고객의 마지막 주문을 지웠더니 따로 보관해야 할 고객주소도 사라졌다. 이 상황에 해당하는 이상 현상을 쓰시오.','삭제 이상','주문 정보 삭제와 함께 유지해야 하는 고객 정보가 없어지는 삭제 이상이다.',term('삭제 이상','Deletion Anomaly')),
  q(62,'DB','논리적 조회 대상','인사팀은 EMPLOYEE 테이블의 이름과 부서만 조회해야 하며 급여는 보지 않아야 한다. 아래 명령에서 빈칸에 들어갈 데이터베이스 객체의 이름을 쓰시오.\n\n```sql\nCREATE ____ staff_directory AS\nSELECT name, department FROM employee;\n```','VIEW','뷰는 SELECT로 정의한 논리적 조회 대상이다. 권한과 기본 테이블 접근도 함께 관리해야 한다.',term('VIEW','뷰')),
  q(63,'네트워크/OS','HRN 계산','프로세스 P가 8초 기다렸고 필요한 실행 시간은 4초다. HRN의 응답비를 계산하시오.','3','(대기 시간 + 실행 시간) / 실행 시간 = (8+4)/4 = 3이다.',number(3)),
  q(64,'네트워크/OS','내부 단편화 계산','페이지 크기가 4 KiB이고 프로세스의 논리 주소 공간 크기는 7 KiB다. 페이지별로 프레임을 할당할 때 마지막 페이지에 할당된 프레임에서 사용하지 않는 공간을 KiB 단위로 쓰시오.','1','2개 페이지를 위해 8 KiB를 할당하며 사용 공간은 7 KiB이므로 마지막 프레임에서 1 KiB가 남는다.',number(1,'KiB','키비바이트')),
  q(65,'SW개발','성능 시험 사례','정상 운영 목표는 동시 접속 1000명이다. 5000명까지 접속을 늘려 장애가 나는 지점과 이후 회복 동작을 확인한다. 정상 범위를 넘는 부담을 주는 테스트를 쓰시오.','스트레스 테스트','정상적인 예상 부하를 확인하는 부하 테스트와 달리 한계를 넘는 조건을 시험한다.',term('스트레스 테스트','강도 테스트','Stress Test','Stress Testing','스트레스','강도')),
  q(66,'SW개발','서버 역할','정적 이미지 응답은 웹 서버가 처리하고, 로그인 세션과 Java 주문 로직은 별도의 애플리케이션 실행 서버가 처리한다. 후자의 서버를 나타내는 약자를 쓰시오.','WAS','Web Application Server는 웹 애플리케이션의 동적인 업무 로직을 실행하는 역할을 맡는다.',term('WAS','Web Application Server','웹 애플리케이션 서버','웹 어플리케이션 서버')),
  q(67,'SW설계','UML 상속 관계','관리자와 일반회원 클래스가 회원 클래스를 상속한다. UML에서 두 하위 클래스에서 회원 클래스로 향하는 실선과 빈 삼각형으로 표현할 관계의 이름을 쓰시오.','일반화','일반화의 빈 삼각형은 상위 타입을 가리킨다. 점선과 빈 삼각형인 실체화와 구별한다.',term('일반화','일반화 관계','Generalization')),
  q(68,'SW설계','인터페이스 분리','읽기 전용 클라이언트가 저장·삭제 메서드까지 구현해야 하는 큰 인터페이스를 작은 역할별 인터페이스로 나눈다. 관련된 SOLID 원칙의 약자를 쓰시오.','ISP','사용하지 않는 메서드에 의존하도록 강제하지 않는 인터페이스 분리 원칙이다.',term('ISP','Interface Segregation Principle','인터페이스 분리 원칙','인터페이스 분리')),
  q(69,'보안/신기술','브라우저 실행 공격','게시판이 글 내용을 HTML로 그대로 출력한다. 공격자가 저장한 스크립트가 다른 사용자의 브라우저에서 해당 사이트 권한으로 실행된다. 이 웹 공격의 대표 약자를 쓰시오.','XSS','신뢰하지 않는 글이 브라우저 코드로 실행되는 저장형 XSS 사례다. 출력 문맥에 맞는 인코딩 등이 필요하다.',term('XSS','Stored XSS','저장형 XSS','Cross Site Scripting','크로스 사이트 스크립팅')),
  q(70,'보안/신기술','해시 길이','SHA-256으로 짧은 메시지와 긴 메시지의 해시를 각각 구했다. 두 결과의 비트 길이를 동일한 한 개의 숫자로 쓰시오.','256','SHA-256의 출력 길이는 입력 길이와 무관하게 256비트다. 암호문의 복호화와 해시의 역할은 다르다.',number(256,'비트','bit','bits')),
  q(71,'C언어','배열 참조 변경','다음 C 코드의 출력 결과를 쓰시오.\n\n```c\n#include <stdio.h>\nint main(void) {\n    int a[] = {4, 7, 2};\n    int *p = &a[1];\n    *p -= a[0];\n    printf("%d %d %d", a[0], a[1], a[2]);\n    return 0;\n}\n```','4 3 2','p가 가리키는 a[1]에 7-4=3을 저장한다. 나머지 원소는 바뀌지 않는다.',output('4 3 2')),
  q(72,'C언어','재귀 단계','다음 C 코드의 출력 결과를 쓰시오.\n\n```c\n#include <stdio.h>\nint f(int n) {\n    if (n <= 0) return 0;\n    return n + f(n - 2);\n}\nint main(void) {\n    printf("%d", f(5));\n    return 0;\n}\n```','9','f(5)=5+f(3), f(3)=3+f(1), f(1)=1+f(-1)이므로 5+3+1=9다.',number(9)),
  q(73,'Java','인수와 배열 객체','다음 Java 코드의 출력 결과를 쓰시오.\n\n```java\npublic class Main {\n    static void bump(int n, int[] a) {\n        n++;\n        a[0] += n;\n    }\n    public static void main(String[] args) {\n        int n = 3;\n        int[] a = {4};\n        bump(n, a);\n        System.out.print(n + "," + a[0]);\n    }\n}\n```','3,8','매개변수 n은 전달된 값의 복사이므로 main의 n은 3이다. 배열 참조 값은 복사되지만 같은 배열 객체를 가리켜 a[0]은 4+4=8로 바뀐다.',output('3,8')),
  q(74,'Java','오버로딩 선택','다음 Java 코드의 출력 결과를 쓰시오.\n\n```java\npublic class Main {\n    static String label(Object x) { return "O"; }\n    static String label(String x) { return "S"; }\n    public static void main(String[] args) {\n        Object value = "DB";\n        System.out.print(label(value));\n        System.out.print(label((String)value));\n    }\n}\n```','OS','첫 호출은 인수의 컴파일 시점 타입 Object, 두 번째는 명시적 변환 후 String을 기준으로 오버로딩을 선택한다.',output('OS')),
  q(75,'Python','중첩 리스트 복사','다음 Python 코드의 출력 결과를 쓰시오.\n\n```python\na = [[1], [2]]\nb = a[:]\nb[0].append(9)\nb.append([3])\nprint(len(a), len(a[0]), len(b))\n```','2 2 3','바깥 리스트는 별개라 a의 길이는 2다. 내부 첫 리스트는 공유되어 길이가 2이며, b의 바깥 리스트에만 새 원소를 추가해 길이가 3이다.',output('2 2 3')),
  q(76,'Python','문자열 생성','다음 Python 코드의 출력 결과를 쓰시오.\n\n```python\nprint("-".join(str(i) for i in range(2, 7, 2)))\n```','2-4-6','range는 2,4,6을 생성한다. 문자열 변환 후 하이픈을 사이에 두어 연결한다.',output('2-4-6')),
  q(77,'Python','딕셔너리 삭제','다음 Python 코드의 출력 결과를 쓰시오.\n\n```python\nscores = {"x": 3, "y": 5}\nvalue = scores.pop("x")\nprint(value + scores.get("x", 2))\n```','5','pop은 x의 값 3을 반환하고 항목을 제거한다. 이후 get은 기본값 2를 반환하므로 합은 5다.',number(5)),
  q(78,'SQL','집계 세 값','T 테이블의 DEPT 값이 A, A, B, NULL인 네 행이다. 아래 결과를 열 순서대로 쓰시오.\n\n```sql\nSELECT COUNT(*), COUNT(DEPT), COUNT(DISTINCT DEPT)\nFROM T;\n```','4,3,2','전체 행 4, NULL이 아닌 DEPT 3, NULL을 제외한 서로 다른 DEPT A와 B의 2개다.',{kind:'row',cells:[4,3,2]}),
  q(79,'SQL','매칭 없는 행','STUDENT에는 SID 1,2,3,4가 한 행씩 있고 ENROLL에는 SID 1이 두 행, SID 2가 한 행 있다. ENROLL.SID는 NULL을 허용하지 않는다. 아래 결과를 쓰시오.\n\n```sql\nSELECT COUNT(*)\nFROM STUDENT S LEFT JOIN ENROLL E ON S.SID = E.SID\nWHERE E.SID IS NULL;\n```','2','매칭이 없는 학생 3과 4의 행만 남기므로 2다. 학생 1의 여러 매칭 행은 WHERE 조건에 해당하지 않는다.',number(2)),
  q(80,'SQL','중복을 유지하는 합치기','질의 A의 결과는 1,1,2 세 행이고 질의 B의 결과는 2,3 두 행이다. UNION ALL로 합치면 몇 행인지 쓰시오.','5','UNION ALL은 두 질의 안과 사이의 중복을 제거하지 않아 3+2=5행이다.',number(5,'행','개'))
];

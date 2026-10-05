# 정보처리기사 실기 대비 10월 25일 오전 문제지

총 24문항, 권장 풀이 시간 45분  
배점 예시: 각 5점, 총 120점 중 72점 이상이면 합격권 루틴으로 본다.

## A. DB

### 1. 키

다음 릴레이션에서 한 학생은 한 과목을 한 번만 수강한다고 한다.

`수강(학번, 과목코드, 과목명, 교수명, 성적)`

함수 종속은 다음과 같다.

- `(학번, 과목코드) -> 성적`
- `과목코드 -> 과목명, 교수명`

이 릴레이션의 후보키를 쓰시오.

답:

### 2. 정규화

1번 릴레이션이 제2정규형을 만족하지 못하는 이유를 쓰시오.

답:

### 3. 트랜잭션

트랜잭션의 ACID 중 “트랜잭션이 성공적으로 완료되면 그 결과가 영구적으로 반영되어야 한다”는 성질을 쓰시오.

답:

## B. 네트워크/OS

### 4. 페이지 교체

프레임 수가 3개이고 페이지 참조열이 다음과 같을 때, FIFO 알고리즘의 페이지 부재 횟수를 구하시오. 초기 프레임은 비어 있다.

`1, 2, 3, 2, 4, 1, 2, 5`

답:

### 5. 프로세스 스케줄링

다음 프로세스에 대해 비선점 SJF를 적용할 때 평균 대기 시간을 구하시오.

| 프로세스 | 도착 시간 | 실행 시간 |
|---|---:|---:|
| P1 | 0 | 7 |
| P2 | 2 | 4 |
| P3 | 4 | 1 |

답:

### 6. 서브넷

IPv4 네트워크가 `/26`일 때, 사용할 수 있는 호스트 수를 구하시오.

답:

### 7. UNIX 권한

`chmod 754 file.txt`가 의미하는 권한을 소유자, 그룹, 기타 사용자 순서로 쓰시오.

답:

## C. SW개발

### 8. 테스트 기법

입력값 범위의 경계와 경계 바로 안팎 값을 집중적으로 확인하는 블랙박스 테스트 기법을 쓰시오.

답:

### 9. 테스트 레벨

일반적인 테스트 레벨 4가지를 작은 단위에서 큰 단위 순서로 쓰시오.

답:

### 10. 형상관리

형상관리의 대표 활동 4가지를 쓰시오.

답:

## D. SW설계

### 11. 디자인 패턴

객체 생성 과정을 서브클래스에 맡겨 객체 생성 코드를 캡슐화하는 생성 패턴을 쓰시오.

답:

### 12. 응집도

모듈 내부의 모든 요소가 단일 기능을 수행하기 위해 밀접하게 관련된 가장 바람직한 응집도를 쓰시오.

답:

### 13. UML 관계

UML 클래스 다이어그램에서 “전체 객체가 사라지면 부분 객체도 함께 사라지는 강한 전체-부분 관계”를 무엇이라고 하는가?

답:

## E. 보안/신기술

### 14. CIA

정보보호의 3요소 CIA를 한글로 쓰시오.

답:

### 15. 웹 공격

사용자 입력값에 악의적인 SQL 구문을 삽입하여 데이터베이스를 비정상적으로 조작하는 공격을 쓰시오.

답:

### 16. 접근통제

사용자의 직무나 역할에 따라 접근 권한을 부여하는 접근통제 모델을 쓰시오.

답:

## F. C언어

### 17. 포인터

다음 C 코드의 출력 결과를 쓰시오.

```c
#include <stdio.h>

int main(void) {
    int a[3] = {2, 4, 6};
    int *p = a;
    printf("%d", *p + *(p + 2));
    return 0;
}
```

답:

### 18. 구조체 포인터

다음 코드에서 출력 결과를 쓰시오.

```c
#include <stdio.h>

struct Item {
    int price;
    int count;
};

int main(void) {
    struct Item item = {300, 4};
    struct Item *p = &item;
    p->count += 2;
    printf("%d", item.price * item.count);
    return 0;
}
```

답:

## G. Java

### 19. 상속과 오버라이딩

다음 Java 코드의 출력 결과를 쓰시오.

```java
class A {
    int x = 1;
    int f() { return x; }
}

class B extends A {
    int x = 2;
    int f() { return x; }
}

public class Main {
    public static void main(String[] args) {
        A obj = new B();
        System.out.print(obj.x + "," + obj.f());
    }
}
```

답:

### 20. static

다음 Java 코드의 출력 결과를 쓰시오.

```java
class Counter {
    static int total = 0;
    Counter() { total++; }
}

public class Main {
    public static void main(String[] args) {
        new Counter();
        new Counter();
        Counter c = new Counter();
        System.out.print(c.total);
    }
}
```

답:

## H. Python

### 21. 슬라이싱

다음 Python 코드의 출력 결과를 쓰시오.

```python
a = [1, 2, 3, 4, 5, 6]
print(a[1:6:2])
```

답:

### 22. 딕셔너리

다음 Python 코드의 출력 결과를 쓰시오.

```python
words = ["a", "b", "a", "c", "b", "a"]
count = {}
for w in words:
    count[w] = count.get(w, 0) + 1
print(count["a"] + count["c"])
```

답:

## I. SQL

### 23. GROUP BY

다음 `SCORE` 테이블이 있다.

| NAME | SUBJECT | SCORE |
|---|---|---:|
| Kim | DB | 80 |
| Lee | DB | 70 |
| Park | DB | 90 |
| Kim | OS | 60 |
| Lee | OS | 95 |

아래 SQL의 결과를 쓰시오.

```sql
SELECT SUBJECT, AVG(SCORE) AS AVG_SCORE
FROM SCORE
GROUP BY SUBJECT
HAVING AVG(SCORE) >= 80
ORDER BY SUBJECT;
```

답:

### 24. JOIN

다음 테이블이 있다.

`STUDENT`

| SID | NAME |
|---:|---|
| 1 | Kim |
| 2 | Lee |
| 3 | Park |

`APPLY`

| SID | LICENSE |
|---:|---|
| 1 | 정보처리기사 |
| 1 | SQLD |
| 3 | 정보보안기사 |

아래 SQL의 결과 행 수를 쓰시오.

```sql
SELECT S.NAME, A.LICENSE
FROM STUDENT S
INNER JOIN APPLY A
ON S.SID = A.SID;
```

답:


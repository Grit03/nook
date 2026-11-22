# 지도 영역 검색

## 흐름

1. 프론트가 지도에 보이는 영역의 남서쪽(sw), 북동쪽(ne) 좌표를 보냅니다.
   `GET /search?sw_lng=126.1&sw_lat=33.1&ne_lng=127.0&ne_lat=33.6&check_in=...&check_out=...`
2. 서버는 두 좌표로 사각형(polygon)을 만들고, 그 안에 있는 스테이를 찾습니다.
3. 인원, 가격 범위로 추가로 거릅니다.

코드: `src/search/search.controller.ts` → `src/search/search.service.ts` → `src/stay/stay.service.ts`의 `search()`

## 1. 좌표는 MySQL POINT 타입으로

**상황**
위치를 `lat`, `lng` 두 숫자 컬럼에 저장하면 "사각형 안의 점"을 `lat BETWEEN ... AND lng BETWEEN ...`으로 찾을 수 있습니다. 하지만 일반 B-Tree 인덱스는 한 번에 한 축만 범위를 좁혀서, 데이터가 많아지면 두 번째 조건은 결국 하나씩 확인하게 됩니다.

**선택**
좌표를 MySQL의 `POINT` 공간 타입 컬럼 하나에 저장하고, 공간 인덱스(SPATIAL INDEX)를 겁니다. 공간 인덱스는 R-Tree 구조라 2차원 범위 검색을 한 번에 좁힐 수 있습니다.

**코드**
- `src/stay/stay.entity.ts`: `@Column({ type: 'point' })` + `@Index({ spatial: true })`
- 같은 파일의 `pointTransformer`: DB의 `POINT(경도 위도)` 문자열과 코드의 `[경도, 위도]` 배열을 서로 바꿔 줍니다. 순서가 **경도(lng) 먼저**인 점에 주의합니다.

## 2. 공간 함수는 MBRContains

**상황**
"영역 안의 점"을 찾는 함수는 여러 개입니다.

| 함수 | 판정 기준 | 특징 |
| --- | --- | --- |
| `MBRContains(영역, 점)` | 영역의 최소 경계 사각형(MBR, Minimum Bounding Rectangle) | 사각형 비교라 빠르고 공간 인덱스를 쓸 수 있음 |
| `ST_Contains(영역, 점)` | 실제 도형 경계 | 정확하지만 계산이 무거움 |
| `ST_Distance_Sphere(점, 점) < 반경` | 구면 거리 | 반경 검색용, 행마다 거리를 계산 |

**선택**
`MBRContains`

**이유**
지도 화면은 원래 사각형입니다. 검색 영역이 사각형이면 MBR이 곧 영역 자체라서, 빠른 MBR 비교로도 결과가 정확합니다. 정확한 도형 판정(`ST_Contains`)이 주는 이득이 없습니다.

**코드**
- `src/stay/stay.service.ts`: 사각형을 WKT(Well-Known Text) 문자열 `POLYGON((...))`로 만들어 `ST_GeomFromText(:polygon)`에 바인딩합니다.
- 좌표 값은 DTO에서 `@IsNumber()`로 숫자임을 검증한 뒤에만 문자열에 들어갑니다.

## 3. TypeORM과 POINT 타입 사이의 문제

**상황**
- 저장: TypeORM `insert()`가 예전 함수 이름 `GeomFromText`를 호출해, 이 함수가 없어진 MySQL 8에서 에러가 납니다.
- 조회: 마찬가지로 `AsText()`를 호출해 에러가 납니다.

**선택**
- 저장(시더): 값을 문자열이 아닌 **함수**로 넘깁니다. `point: () => "ST_PointFromText('POINT(...)')"`. TypeORM은 함수로 넘긴 값을 SQL 표현식으로 그대로 넣고, 문자열은 리터럴로 감쌉니다.
- 조회: `addSelect('ST_AsText(stay.point)', 'stay_point')`로 직접 텍스트를 받아 `[경도, 위도]`로 파싱합니다. 그래서 `getMany()` 대신 `getRawAndEntities()`로 원시 결과와 엔티티를 함께 받습니다.

**코드**
- `src/seed/seeders/stay.seeder.ts`, `src/stay/stay.service.ts`

## 4. 쿼리 파라미터는 DTO에서 변환과 검증을 함께

**상황**
쿼리스트링 값은 모두 문자열로 들어옵니다. `@Query()`만 쓰면 `sw_lng`가 `"126.1"`(문자열)인 채로 서비스까지 가고, 날짜도 문자열입니다. 또 URL은 `check_in`처럼 snake_case를 쓰는데 코드에서는 camelCase를 쓰고 싶었습니다.

**선택**
DTO + `class-transformer` + `ValidationPipe` 조합

- `@Type(() => Number)`, `@Type(() => Date)`: 문자열을 숫자와 날짜로 변환
- `@Expose({ name: 'check_in' })`: URL의 `check_in`을 코드의 `checkIn`으로 매핑
- `@IsNumber()`, `@Min()`, `@Max()`: 변환 후 값 검증
- `ValidationPipe({ whitelist: true, transform: true })`: DTO에 없는 파라미터는 버리고, 변환된 DTO 인스턴스를 컨트롤러에 넘김

**코드**
- `src/search/dto/search-query.dto.ts`, `src/search/search.controller.ts`

## 측정과 남은 과제

**당시 측정**
유저 10만 명, 스테이 30만 개에서 특정 영역 검색에 약 5초가 걸렸습니다.

**원인으로 보이는 것: 공간 인덱스가 실제로는 쓰이지 않음**
MySQL 8은 컬럼에 SRID(공간 좌표계 ID) 속성이 없으면 공간 인덱스를 만들어도 옵티마이저가 쓰지 않습니다. 지금 `stays.point` 컬럼에는 SRID가 없습니다.

스테이 약 3만 개로 같은 조건을 비교한 결과입니다.

| 컬럼 정의 | `EXPLAIN` 결과 | 검사한 행 |
| --- | --- | --- |
| 지금: `point POINT NOT NULL` | `type: ALL` (전체 스캔), `key: NULL` | 29,631 |
| `point POINT NOT NULL SRID 0` | `type: range`, 공간 인덱스 사용 | 484 |

결과 개수는 둘 다 같았습니다(539곳). 고치려면 마이그레이션으로 컬럼에 `SRID 0`(평면 좌표계)을 지정하고, 검색 사각형도 `ST_GeomFromText(:polygon, 0)`처럼 같은 SRID로 만들어야 합니다. 위·경도 구면 좌표계인 `SRID 4326`을 쓰면 좌표 순서(위도 먼저)와 거리 계산 방식이 달라지므로, 사각형 검색만 할 때는 `SRID 0`이 단순합니다.

**그 밖에**
- 결과 개수 제한(`LIMIT`)이 없습니다. 지도를 많이 축소하면 수만 건이 한 번에 내려옵니다. 지금은 프론트가 넓은 영역에서는 검색하지 않는 방식으로 막고 있습니다.
- `check_in`, `check_out`은 필수로 받지만, 예약이 겹치는 스테이를 빼는 데는 아직 쓰지 않습니다.
- `min_price`가 `max_price`보다 큰 요청을 DTO에서 막지 않습니다.
- 위치는 `ST_GeomFromText`에 바인딩하지만, WKT 문자열 자체는 템플릿 리터럴로 조합합니다. 숫자 검증 덕분에 안전하지만, 좌표를 각각 바인딩하고 SQL에서 `ST_MakeEnvelope(ST_Point(...), ST_Point(...))`로 만드는 편이 더 명확합니다.

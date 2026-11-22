# 설정, 마이그레이션, 시딩

## 1. 환경 변수는 설정 함수 안에서 읽는다

**상황**
TypeORM 설정을 파일 맨 위에 객체로 만들어 두었더니, DB 연결 정보가 모두 `undefined`가 되어 연결에 실패했습니다.

```ts
// 문제가 된 코드: 파일을 import하는 순간 process.env를 읽음
const config = { host: process.env.DB_HOST };
export default registerAs('typeorm', () => config);
```

**원인**
파일이 import되는 시점은 `ConfigModule`이 `.env`를 읽기 **전**입니다. 그때 읽은 `process.env.DB_HOST`는 비어 있습니다.

**선택**
설정을 만드는 함수 `getConfig()`를 두고, `registerAs` 콜백 안에서 호출합니다. 콜백은 `ConfigModule`이 `.env`를 읽은 뒤 실행됩니다.

```ts
const getConfig = () => ({ host: process.env.DB_HOST /* ... */ });
export const connectionSource = new DataSource(getConfig()); // TypeORM CLI용
export default registerAs('typeorm', () => getConfig());    // Nest 앱용
```

같은 함수를 Nest 앱과 TypeORM CLI(마이그레이션 명령) 양쪽에서 씁니다.

**코드**
- `src/config/typeorm.ts`, `src/config/cache.ts`
- `src/app.module.ts`: `forRootAsync` / `registerAsync`에서 설정을 꺼내고, 값이 없으면 바로 에러를 던져 잘못된 설정으로 서버가 뜨지 않게 합니다.

## 2. `synchronize` 대신 마이그레이션

**상황**
TypeORM의 `synchronize: true`는 엔티티가 바뀌면 서버 시작 시 테이블을 자동으로 맞춥니다. 편하지만 컬럼 이름만 바꿔도 "삭제 후 추가"로 처리해 데이터가 사라질 수 있습니다.

**선택**
`synchronize: false`로 두고, 스키마 변경은 마이그레이션(migration) 파일로만 합니다. 마이그레이션은 "스키마를 이렇게 바꾼다(`up`)"와 "되돌린다(`down`)"를 SQL로 적은 파일이라, 변경 내역이 Git에 남고 되돌릴 수 있습니다.

| 명령 | 하는 일 |
| --- | --- |
| `N=Add_Something npm run migration:generate` | 엔티티와 DB 차이로 마이그레이션 파일 생성 |
| `npm run migration:run` | 아직 적용 안 된 마이그레이션 실행 |
| `npm run migration:revert` | 마지막 마이그레이션 되돌리기 |
| `npm run migration:show` | 적용 여부 확인 |

**스크립트에 넣은 것들**
- `npm run build &&`: 설정이 `dist/` 아래의 컴파일된 엔티티를 읽으므로, 명령 전에 항상 빌드합니다.
- `dotenv --`: TypeORM CLI는 Nest 앱 없이 따로 실행돼 `ConfigModule`이 `.env`를 읽어 주지 않습니다. `dotenv-cli`로 환경 변수를 넣어 줍니다.
- `$N`: 마이그레이션 이름을 환경 변수로 받습니다. 처음 쓴 `$npm_config_name`은 npm에서 deprecated 경고가 나서 바꿨습니다.

**마이그레이션 정리**
개발 중 엔티티를 고치며 마이그레이션이 6개로 잘게 쪼개졌는데, 실제 배포 전이라 3개(초기 테이블, cascade 추가, 컬럼 추가)로 합쳤습니다. 이미 운영 DB에 적용된 마이그레이션이라면 합치면 안 되고, 새 마이그레이션을 추가해야 합니다.

**코드**
- `src/config/typeorm.ts`, `src/migrations/`, `package.json`의 `migration:*` 스크립트

**현재 코드와 다른 점**
CommonJS 프로젝트(Nest 12 `--type cjs`)라서 TypeORM CLI 실행기를 `typeorm-ts-node-esm`에서 `typeorm-ts-node-commonjs`로 바꿨습니다.

## 3. 대량 시드 데이터는 별도 실행 환경에서, 배치로

**상황**
지도 검색 성능을 보려면 유저 10만, 스테이 30만 수준의 데이터가 필요했습니다. 한 번에 만들면 메모리가 부족하거나 시간 초과가 날 수 있습니다.

**선택**
- **별도 실행 환경**: 시더는 HTTP 서버를 띄우지 않고 `NestFactory.createApplicationContext(SeederModule)`로 DI 컨테이너만 띄워 실행합니다. 메인 앱(`AppModule`)과 분리돼 있어서 시더 전용 설정을 둘 수 있습니다.
- **배치(batch) 처리**: `--batch=1000 --repeat=10`처럼 한 번에 넣을 개수와 반복 횟수를 받아, 나눠서 `INSERT`합니다. 반복마다 진행 상황을 로그로 남깁니다.
- **비밀번호 해시는 한 번만**: 모든 시드 유저가 같은 비밀번호를 쓰므로, Argon2 해시를 한 번 계산해 재사용합니다. Argon2는 일부러 느리게 만든 함수라 10만 번 계산하면 시딩 시간 대부분이 여기에 쓰입니다.
- **고유 이메일**: `faker`가 같은 이메일을 다시 만들 수 있어 `enforce-unique`로 중복을 걸러 냅니다.
- **삭제 순서**: 외래 키(FK) 때문에 자식 테이블(스테이)부터 지우고 부모 테이블(유저)을 나중에 지웁니다.

**겪은 문제**
처음에는 시더 실행 시 "엔티티 메타데이터를 찾을 수 없다"는 에러가 났습니다. 시더는 `AppModule`과 별개의 애플리케이션 컨텍스트라서, `AppModule`에 등록한 TypeORM 설정과 엔티티를 공유하지 않습니다. `SeederModule`에 TypeORM 설정과 엔티티를 다시 등록해서 해결했습니다.

| 명령 | 하는 일 |
| --- | --- |
| `npm run seed:run -- --repeat=10 --batch=1000` | 유저 1만 명, 스테이 3만 개 생성 (유저당 스테이 3개) |
| `npm run seed:clear` | 시드 데이터 삭제 |
| `npm run seed:refresh -- ...` | 삭제 후 다시 생성 |

**코드**
- `src/seed/index.ts`, `src/seed/seeders/`

**현재 코드에서 추가된 것**
시드 데이터를 실제 서비스처럼 보이게 하려고 세 가지를 바꿨습니다.

- 스테이 이름: 유형별 이름 규칙(`stay-name.ts`)
- 주소: 좌표에서 가장 가까운 시·군 기준(`stay-address.ts`)
- 좌표: 대한민국 육지 안에서만, 해안선에서 1km, 군사분계선에서 2.5km 이상 떨어진 점(`korea-land.ts`)

## 4. 개발 중에는 모든 쿼리를 로그로

**선택**
TypeORM 설정에서 `logging: true`로 모든 SQL을 출력합니다. ORM이 실제로 어떤 SQL을 만드는지(특히 공간 함수 처리) 확인하려고 켰습니다.

**남은 과제**
운영 환경에서는 쿼리 로그가 너무 많고 값이 그대로 찍힐 수 있으니, 환경 변수로 `['error', 'warn']` 정도로 줄여야 합니다.

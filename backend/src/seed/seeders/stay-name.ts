import { fakerKO as faker } from '@faker-js/faker';

// 실제 소규모 숙소들이 쓰는 이름 패턴을 따라 만든 시드용 이름 생성기.
// 실존 숙소 이름을 그대로 쓰지 않고, 패턴(어휘 + 유형 표기 방식)만 가져왔다.
//
// - 게스트하우스: 의성어·의태어 반복형(도란도란류), "OO댁", 짧은 감성 단어
// - 한옥스테이: "한옥스테이 OO"(순우리말 한 단어), 한자 두 글자 + 재/당/헌/정, "OO고택"
// - 독채: "스테이 OO", "OO돌집", "OO 독채"
// - 민박: 동물·사물 + 민박, 레트로 "OO여관"
//
// 모든 이름에 유형을 알 수 있는 단어(게스트하우스, 호스텔, 한옥, 고택, 스테이, 돌집, 독채, 민박, 여관)가 들어가도록 한다.

const pick = <T>(list: readonly T[]) => faker.helpers.arrayElement(list);

// 게스트하우스
const REPEAT_WORDS = [
  '오손도손',
  '두런두런',
  '소곤소곤',
  '사뿐사뿐',
  '몽글몽글',
  '느릿느릿',
  '살랑살랑',
  '도담도담',
  '포근포근',
  '어슬렁',
];
const PLACE_PREFIX = [
  '월정',
  '협재',
  '세화',
  '교동',
  '황리',
  '안목',
  '동명',
  '감천',
  '익선',
  '청호',
];
const SHORT_WORDS = [
  '쉼표',
  '여행자의 집',
  '밤산책',
  '바람길',
  '모래알',
  '조약돌',
  '느린우체통',
  '숲속작은집',
  '해질녘',
  '들꽃',
];

// 한옥스테이
const PURE_KOREAN = [
  '여백',
  '머묾',
  '다온',
  '고요',
  '온새미',
  '가온',
  '담소',
  '소요',
  '달마중',
  '솔내음',
];
// 한자 두 글자는 무작위로 조합하면 어색해서, 읽기 자연스러운 조합만 골라 둔다.
const HANJA_NAMES = [
  '청송',
  '운하',
  '송월',
  '월연',
  '담연',
  '소하',
  '설송',
  '하림',
  '우계',
  '청운',
  '연담',
  '송하',
  '석류',
  '난초',
  '매화',
  '죽림',
];
const HANJA_SUFFIX = ['재', '당', '헌', '정'];

// 독채
const STAY_WORDS = [
  '머물다',
  '온기',
  '바람결',
  '느린섬',
  '숨',
  '하루',
  '들녘',
  '모퉁이',
  '솔밭',
  '물결',
];
const STONE_HOUSE = ['귤밭', '동백', '노을', '억새', '팽나무', '파도', '은행나무', '수국'];

// 민박
const MINBAK_WORDS = [
  '고양이',
  '동백',
  '갈매기',
  '소라',
  '등대',
  '해바라기',
  '감나무',
  '봉숭아',
  '조개',
  '바둑이',
];
const INN_WORDS = ['구름', '바다', '오래', '달빛', '골목', '정류장', '수수', '나루'];

const GENERATORS: Record<string, (() => string)[]> = {
  게스트하우스: [
    () => `${pick(REPEAT_WORDS)} 게스트하우스`,
    () => `${pick(PLACE_PREFIX)}댁 게스트하우스`,
    () => `게스트하우스 ${pick(SHORT_WORDS)}`,
    () => `${pick(SHORT_WORDS)} 호스텔`,
  ],
  한옥스테이: [
    () => `한옥스테이 ${pick(PURE_KOREAN)}`,
    () => `${pick(HANJA_NAMES)}${pick(HANJA_SUFFIX)} 한옥스테이`,
    () => `${pick(HANJA_NAMES)}고택`,
  ],
  독채: [
    () => `스테이 ${pick(STAY_WORDS)}`,
    () => `${pick(STONE_HOUSE)}돌집`,
    () => `${pick(STAY_WORDS)} 독채`,
  ],
  민박: [
    () => `${pick(MINBAK_WORDS)} 민박`,
    () => `${pick(INN_WORDS)}여관`,
  ],
};

export function generateStayName(): string {
  const type = pick(Object.keys(GENERATORS));
  return pick(GENERATORS[type])();
}

import { fakerKO as faker } from '@faker-js/faker';

// 시드용 주소 생성기.
// 좌표는 기존 시더처럼 전국 범위에서 무작위로 만들어지므로, 좌표에서 가장 가까운 시·군을 찾아
// 그 지역의 "시도 시군구 읍면동 도로명 번호" 형식 주소를 만든다.
// 지역 화면(제주, 경주 ...)에서 검색했을 때 카드의 주소가 그 지역으로 보이게 하기 위함이다.
// 중심 좌표는 대략값이고, 바다 위 좌표는 가장 가까운 지역으로 붙는다.

interface Area {
  sido: string;
  sigungu: string;
  lat: number;
  lng: number;
  towns: string[]; // 읍·면·동
}

const AREAS: Area[] = [
  // 제주
  { sido: '제주특별자치도', sigungu: '제주시', lat: 33.5, lng: 126.53, towns: ['애월읍', '한림읍', '구좌읍', '조천읍', '한경면', '이도동', '삼도동'] },
  { sido: '제주특별자치도', sigungu: '서귀포시', lat: 33.25, lng: 126.56, towns: ['성산읍', '남원읍', '표선면', '안덕면', '대정읍', '중문동', '서귀동'] },
  // 강원
  { sido: '강원특별자치도', sigungu: '강릉시', lat: 37.75, lng: 128.88, towns: ['주문진읍', '사천면', '연곡면', '강동면', '교동', '초당동', '경포동'] },
  { sido: '강원특별자치도', sigungu: '속초시', lat: 38.2, lng: 128.59, towns: ['영랑동', '동명동', '조양동', '청호동', '대포동'] },
  { sido: '강원특별자치도', sigungu: '양양군', lat: 38.08, lng: 128.62, towns: ['양양읍', '현북면', '손양면', '현남면'] },
  { sido: '강원특별자치도', sigungu: '동해시', lat: 37.52, lng: 129.11, towns: ['묵호동', '천곡동', '망상동'] },
  { sido: '강원특별자치도', sigungu: '삼척시', lat: 37.45, lng: 129.17, towns: ['근덕면', '원덕읍', '정라동'] },
  { sido: '강원특별자치도', sigungu: '평창군', lat: 37.37, lng: 128.39, towns: ['봉평면', '진부면', '대관령면', '평창읍'] },
  { sido: '강원특별자치도', sigungu: '춘천시', lat: 37.88, lng: 127.73, towns: ['신북읍', '남산면', '효자동', '소양동'] },
  { sido: '강원특별자치도', sigungu: '홍천군', lat: 37.7, lng: 127.89, towns: ['홍천읍', '서면', '내면'] },
  { sido: '강원특별자치도', sigungu: '원주시', lat: 37.34, lng: 127.92, towns: ['문막읍', '지정면', '귀래면'] },
  { sido: '강원특별자치도', sigungu: '정선군', lat: 37.38, lng: 128.66, towns: ['정선읍', '여량면', '고한읍'] },
  { sido: '강원특별자치도', sigungu: '영월군', lat: 37.18, lng: 128.46, towns: ['영월읍', '김삿갓면', '무릉도원면'] },
  { sido: '강원특별자치도', sigungu: '고성군', lat: 38.38, lng: 128.47, towns: ['거진읍', '간성읍', '토성면', '죽왕면'] },
  { sido: '강원특별자치도', sigungu: '인제군', lat: 38.07, lng: 128.17, towns: ['인제읍', '북면', '기린면'] },
  { sido: '강원특별자치도', sigungu: '양구군', lat: 38.11, lng: 127.99, towns: ['양구읍', '방산면', '해안면'] },
  { sido: '강원특별자치도', sigungu: '화천군', lat: 38.11, lng: 127.71, towns: ['화천읍', '사내면', '간동면'] },
  { sido: '강원특별자치도', sigungu: '철원군', lat: 38.15, lng: 127.31, towns: ['갈말읍', '동송읍', '김화읍'] },
  { sido: '강원특별자치도', sigungu: '태백시', lat: 37.16, lng: 128.99, towns: ['황지동', '장성동', '철암동'] },
  // 수도권
  { sido: '서울특별시', sigungu: '종로구', lat: 37.57, lng: 126.98, towns: ['익선동', '계동', '삼청동', '체부동', '누하동'] },
  { sido: '서울특별시', sigungu: '마포구', lat: 37.56, lng: 126.91, towns: ['연남동', '망원동', '합정동', '서교동'] },
  { sido: '서울특별시', sigungu: '성북구', lat: 37.59, lng: 127.0, towns: ['성북동', '삼선동', '정릉동'] },
  { sido: '인천광역시', sigungu: '강화군', lat: 37.75, lng: 126.49, towns: ['강화읍', '길상면', '화도면', '교동면'] },
  { sido: '경기도', sigungu: '가평군', lat: 37.83, lng: 127.51, towns: ['청평면', '설악면', '상면', '북면'] },
  { sido: '경기도', sigungu: '양평군', lat: 37.49, lng: 127.49, towns: ['양서면', '서종면', '강상면', '용문면'] },
  { sido: '경기도', sigungu: '파주시', lat: 37.76, lng: 126.78, towns: ['문산읍', '탄현면', '법원읍', '적성면'] },
  { sido: '경기도', sigungu: '연천군', lat: 38.1, lng: 127.07, towns: ['연천읍', '전곡읍', '청산면'] },
  { sido: '경기도', sigungu: '포천시', lat: 37.89, lng: 127.2, towns: ['영북면', '이동면', '신북면'] },
  { sido: '경기도', sigungu: '여주시', lat: 37.3, lng: 127.64, towns: ['강천면', '북내면', '대신면'] },
  { sido: '경기도', sigungu: '안성시', lat: 37.01, lng: 127.28, towns: ['보개면', '금광면', '서운면'] },
  { sido: '인천광역시', sigungu: '옹진군', lat: 37.95, lng: 124.68, towns: ['백령면', '대청면'] },
  // 충청
  { sido: '충청북도', sigungu: '단양군', lat: 36.98, lng: 128.37, towns: ['단양읍', '매포읍', '가곡면'] },
  { sido: '충청북도', sigungu: '제천시', lat: 37.13, lng: 128.19, towns: ['청풍면', '수산면', '봉양읍'] },
  { sido: '충청북도', sigungu: '괴산군', lat: 36.81, lng: 127.79, towns: ['괴산읍', '청천면', '연풍면'] },
  { sido: '충청북도', sigungu: '충주시', lat: 36.99, lng: 127.93, towns: ['수안보면', '앙성면', '살미면'] },
  { sido: '충청북도', sigungu: '청주시 상당구', lat: 36.64, lng: 127.49, towns: ['낭성면', '미원면', '문의면'] },
  { sido: '충청북도', sigungu: '보은군', lat: 36.49, lng: 127.73, towns: ['보은읍', '속리산면', '마로면'] },
  { sido: '충청북도', sigungu: '영동군', lat: 36.17, lng: 127.78, towns: ['영동읍', '황간면', '양산면'] },
  { sido: '충청남도', sigungu: '천안시 동남구', lat: 36.8, lng: 127.15, towns: ['병천면', '광덕면', '목천읍'] },
  { sido: '충청남도', sigungu: '서산시', lat: 36.78, lng: 126.45, towns: ['해미면', '운산면', '부석면'] },
  { sido: '충청남도', sigungu: '논산시', lat: 36.19, lng: 127.1, towns: ['연무읍', '강경읍', '양촌면'] },
  { sido: '충청남도', sigungu: '공주시', lat: 36.45, lng: 127.12, towns: ['반죽동', '웅진동', '계룡면'] },
  { sido: '충청남도', sigungu: '부여군', lat: 36.28, lng: 126.91, towns: ['부여읍', '규암면', '임천면'] },
  { sido: '충청남도', sigungu: '태안군', lat: 36.75, lng: 126.3, towns: ['안면읍', '소원면', '남면', '이원면'] },
  { sido: '충청남도', sigungu: '보령시', lat: 36.33, lng: 126.61, towns: ['대천동', '오천면', '천북면'] },
  { sido: '대전광역시', sigungu: '중구', lat: 36.33, lng: 127.42, towns: ['대흥동', '은행동', '선화동'] },
  { sido: '세종특별자치시', sigungu: '세종시', lat: 36.48, lng: 127.29, towns: ['조치원읍', '연동면', '전의면'] },
  // 경북·대구·울산
  { sido: '경상북도', sigungu: '경주시', lat: 35.86, lng: 129.22, towns: ['황남동', '교동', '사정동', '양북면', '감포읍', '안강읍'] },
  { sido: '경상북도', sigungu: '안동시', lat: 36.57, lng: 128.73, towns: ['풍천면', '도산면', '임하면', '법흥동'] },
  { sido: '경상북도', sigungu: '포항시 남구', lat: 36.0, lng: 129.4, towns: ['구룡포읍', '호미곶면', '동해면'] },
  { sido: '경상북도', sigungu: '포항시 북구', lat: 36.1, lng: 129.36, towns: ['청하면', '송라면', '흥해읍'] },
  { sido: '경상북도', sigungu: '영덕군', lat: 36.42, lng: 129.37, towns: ['강구면', '영해면', '축산면'] },
  { sido: '경상북도', sigungu: '울진군', lat: 36.99, lng: 129.4, towns: ['울진읍', '후포면', '평해읍'] },
  { sido: '경상북도', sigungu: '문경시', lat: 36.59, lng: 128.19, towns: ['문경읍', '가은읍', '산북면'] },
  { sido: '경상북도', sigungu: '영주시', lat: 36.81, lng: 128.62, towns: ['풍기읍', '순흥면', '부석면'] },
  { sido: '경상북도', sigungu: '청송군', lat: 36.44, lng: 129.06, towns: ['청송읍', '부동면', '파천면'] },
  { sido: '경상북도', sigungu: '울릉군', lat: 37.48, lng: 130.9, towns: ['울릉읍', '서면', '북면'] },
  { sido: '경상북도', sigungu: '상주시', lat: 36.41, lng: 128.16, towns: ['함창읍', '화북면', '은척면'] },
  { sido: '경상북도', sigungu: '김천시', lat: 36.12, lng: 128.11, towns: ['대항면', '증산면', '부항면'] },
  { sido: '경상북도', sigungu: '봉화군', lat: 36.89, lng: 128.73, towns: ['봉화읍', '춘양면', '석포면'] },
  { sido: '경상북도', sigungu: '의성군', lat: 36.35, lng: 128.7, towns: ['의성읍', '춘산면', '사곡면'] },
  { sido: '경상북도', sigungu: '고령군', lat: 35.73, lng: 128.26, towns: ['대가야읍', '덕곡면', '쌍림면'] },
  { sido: '경상북도', sigungu: '청도군', lat: 35.65, lng: 128.73, towns: ['청도읍', '운문면', '각북면'] },
  { sido: '대구광역시', sigungu: '중구', lat: 35.87, lng: 128.6, towns: ['계산동', '남산동', '대봉동'] },
  { sido: '울산광역시', sigungu: '울주군', lat: 35.56, lng: 129.24, towns: ['서생면', '언양읍', '상북면'] },
  // 부산·경남
  { sido: '부산광역시', sigungu: '해운대구', lat: 35.16, lng: 129.16, towns: ['중동', '송정동', '우동'] },
  { sido: '부산광역시', sigungu: '영도구', lat: 35.09, lng: 129.07, towns: ['영선동', '청학동', '동삼동'] },
  { sido: '부산광역시', sigungu: '사하구', lat: 35.1, lng: 128.97, towns: ['감천동', '다대동', '장림동'] },
  { sido: '부산광역시', sigungu: '기장군', lat: 35.24, lng: 129.22, towns: ['기장읍', '일광읍', '장안읍'] },
  { sido: '경상남도', sigungu: '통영시', lat: 34.85, lng: 128.43, towns: ['산양읍', '욕지면', '한산면', '봉평동'] },
  { sido: '경상남도', sigungu: '거제시', lat: 34.88, lng: 128.62, towns: ['장승포동', '일운면', '남부면', '동부면'] },
  { sido: '경상남도', sigungu: '남해군', lat: 34.84, lng: 127.89, towns: ['남면', '삼동면', '상주면', '미조면'] },
  { sido: '경상남도', sigungu: '하동군', lat: 35.07, lng: 127.75, towns: ['화개면', '악양면', '하동읍'] },
  { sido: '경상남도', sigungu: '산청군', lat: 35.42, lng: 127.87, towns: ['산청읍', '시천면', '단성면'] },
  { sido: '경상남도', sigungu: '진주시', lat: 35.18, lng: 128.11, towns: ['문산읍', '대곡면', '본성동'] },
  { sido: '경상남도', sigungu: '거창군', lat: 35.69, lng: 127.91, towns: ['거창읍', '북상면', '위천면'] },
  { sido: '경상남도', sigungu: '밀양시', lat: 35.5, lng: 128.75, towns: ['산내면', '단장면', '삼랑진읍'] },
  { sido: '경상남도', sigungu: '창녕군', lat: 35.54, lng: 128.49, towns: ['창녕읍', '유어면', '부곡면'] },
  { sido: '경상남도', sigungu: '고성군', lat: 34.97, lng: 128.32, towns: ['고성읍', '하일면', '삼산면'] },
  { sido: '경상남도', sigungu: '합천군', lat: 35.57, lng: 128.17, towns: ['합천읍', '가야면', '율곡면'] },
  // 전북
  { sido: '전북특별자치도', sigungu: '전주시 완산구', lat: 35.81, lng: 127.15, towns: ['교동', '풍남동', '전동', '중앙동'] },
  { sido: '전북특별자치도', sigungu: '군산시', lat: 35.97, lng: 126.74, towns: ['월명동', '신흥동', '옥도면'] },
  { sido: '전북특별자치도', sigungu: '고창군', lat: 35.43, lng: 126.7, towns: ['고창읍', '아산면', '상하면'] },
  { sido: '전북특별자치도', sigungu: '남원시', lat: 35.42, lng: 127.39, towns: ['산내면', '운봉읍', '향교동'] },
  { sido: '전북특별자치도', sigungu: '무주군', lat: 36.01, lng: 127.66, towns: ['무주읍', '설천면', '안성면'] },
  { sido: '전북특별자치도', sigungu: '부안군', lat: 35.73, lng: 126.73, towns: ['변산면', '진서면', '위도면'] },
  { sido: '전북특별자치도', sigungu: '정읍시', lat: 35.57, lng: 126.86, towns: ['내장상동', '칠보면', '산외면'] },
  { sido: '전북특별자치도', sigungu: '김제시', lat: 35.8, lng: 126.88, towns: ['금산면', '진봉면', '만경읍'] },
  { sido: '전북특별자치도', sigungu: '진안군', lat: 35.79, lng: 127.42, towns: ['진안읍', '마령면', '백운면'] },
  { sido: '전북특별자치도', sigungu: '임실군', lat: 35.62, lng: 127.29, towns: ['임실읍', '관촌면', '운암면'] },
  // 전남·광주
  { sido: '전라남도', sigungu: '영암군', lat: 34.8, lng: 126.7, towns: ['영암읍', '군서면', '학산면'] },
  { sido: '전라남도', sigungu: '화순군', lat: 35.06, lng: 126.99, towns: ['화순읍', '동복면', '이서면'] },
  { sido: '전라남도', sigungu: '보성군', lat: 34.77, lng: 127.08, towns: ['보성읍', '벌교읍', '회천면'] },
  { sido: '전라남도', sigungu: '영광군', lat: 35.28, lng: 126.51, towns: ['영광읍', '백수읍', '법성면'] },
  { sido: '전라남도', sigungu: '여수시', lat: 34.76, lng: 127.66, towns: ['돌산읍', '중앙동', '고소동', '화양면'] },
  { sido: '전라남도', sigungu: '순천시', lat: 34.95, lng: 127.49, towns: ['낙안면', '별량면', '해룡면'] },
  { sido: '전라남도', sigungu: '목포시', lat: 34.81, lng: 126.39, towns: ['유달동', '만호동', '대반동'] },
  { sido: '전라남도', sigungu: '담양군', lat: 35.32, lng: 126.99, towns: ['담양읍', '창평면', '고서면'] },
  { sido: '전라남도', sigungu: '강진군', lat: 34.64, lng: 126.77, towns: ['강진읍', '도암면', '마량면'] },
  { sido: '전라남도', sigungu: '완도군', lat: 34.31, lng: 126.75, towns: ['완도읍', '청산면', '보길면'] },
  { sido: '전라남도', sigungu: '해남군', lat: 34.57, lng: 126.6, towns: ['해남읍', '송지면', '삼산면'] },
  { sido: '전라남도', sigungu: '구례군', lat: 35.2, lng: 127.46, towns: ['구례읍', '산동면', '토지면'] },
  { sido: '전라남도', sigungu: '신안군', lat: 34.83, lng: 126.1, towns: ['증도면', '임자면', '흑산면'] },
  { sido: '전라남도', sigungu: '진도군', lat: 34.48, lng: 126.26, towns: ['진도읍', '의신면', '임회면'] },
  { sido: '전라남도', sigungu: '고흥군', lat: 34.61, lng: 127.28, towns: ['고흥읍', '도양읍', '봉래면'] },
  { sido: '광주광역시', sigungu: '동구', lat: 35.15, lng: 126.92, towns: ['충장동', '동명동', '산수동'] },
];

const ROAD_SUFFIX = ['로', '길'];
const ROAD_WORDS = ['안길', '중앙로', '마을길', '옛길', '서로', '동로'];

// 위도에 따라 경도 1도의 거리가 달라지므로 cos(위도)로 보정한 거리 비교
function nearestArea(lng: number, lat: number): Area {
  const cos = Math.cos((lat * Math.PI) / 180);
  let best = AREAS[0];
  let bestDist = Infinity;
  for (const area of AREAS) {
    const dx = (area.lng - lng) * cos;
    const dy = area.lat - lat;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = area;
    }
  }
  return best;
}

// 예: "경상북도 경주시 황남동 포석로 82-3"
export function generateStayAddress(lng: number, lat: number): string {
  const area = nearestArea(lng, lat);
  const town = faker.helpers.arrayElement(area.towns);
  // 읍면동 이름에서 따온 도로명 (예: 황남로, 풍남3길, 애월안길)
  // faker의 도로명은 다른 지역 이름(동탄3길 등)이 섞여 쓰지 않는다.
  // "교동", "내면"처럼 떼고 나면 한 글자만 남는 경우는 전체를 쓴다 (교동로, 내면로)
  const stripped = town.replace(/(읍|면|동)$/, '');
  const townRoot = stripped.length >= 2 ? stripped : town;
  const road = faker.helpers.weightedArrayElement([
    {
      weight: 3,
      value: `${townRoot}${faker.helpers.arrayElement(ROAD_SUFFIX)}`,
    },
    {
      weight: 3,
      value: `${townRoot}${faker.number.int({ min: 1, max: 12 })}길`,
    },
    {
      weight: 2,
      value: `${townRoot}${faker.helpers.arrayElement(ROAD_WORDS)}`,
    },
  ]);
  const main = faker.number.int({ min: 1, max: 320 });
  const sub = faker.helpers.maybe(() => `-${faker.number.int({ min: 1, max: 15 })}`, {
    probability: 0.35,
  });
  return `${area.sido} ${area.sigungu} ${town} ${road} ${main}${sub ?? ''}`;
}

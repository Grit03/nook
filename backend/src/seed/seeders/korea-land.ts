import { fakerKO as faker } from '@faker-js/faker';
import {
  SOUTH_KOREA_LAND,
  SOUTH_KOREA_NORTH_BORDER,
} from '../data/south-korea-land';

// 시드 좌표를 대한민국 육지 안에서만 뽑는다.
// - 경계 사각형 안에서 무작위로 뽑고, 대한민국 폴리곤 밖(바다, 북한, 다른 나라)이면 다시 뽑는다.
// - 해안선에서 MIN_COAST_KM 이내인 점은 버린다. 경계 데이터가 약 1km 정밀도라 해안 바로 옆 점은 실제로 바다일 수 있다.
// - 군사분계선에서 MIN_BORDER_KM 이내인 점도 버린다. 군사분계선 남쪽 2km 까지는 비무장지대다.

type Point = [number, number]; // [경도, 위도]

const MIN_COAST_KM = 1;
const MIN_BORDER_KM = 2.5;
const KM_PER_DEG_LAT = 111.32;

interface Polygon {
  rings: Point[][]; // 첫 링이 바깥 경계, 나머지는 구멍
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

const POLYGONS: Polygon[] = SOUTH_KOREA_LAND.map((rings) => {
  const outer = rings[0];
  return {
    rings,
    minLng: Math.min(...outer.map((p) => p[0])),
    minLat: Math.min(...outer.map((p) => p[1])),
    maxLng: Math.max(...outer.map((p) => p[0])),
    maxLat: Math.max(...outer.map((p) => p[1])),
  };
});

// 대한민국 전체 경계 사각형 (울릉도·독도·백령도 포함)
const BOUNDS = {
  minLng: Math.min(...POLYGONS.map((p) => p.minLng)),
  minLat: Math.min(...POLYGONS.map((p) => p.minLat)),
  maxLng: Math.max(...POLYGONS.map((p) => p.maxLng)),
  maxLat: Math.max(...POLYGONS.map((p) => p.maxLat)),
};

// 반직선(ray casting) 방식의 점-다각형 포함 판정
function inRing([x, y]: Point, ring: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function inPolygon(point: Point, polygon: Polygon): boolean {
  const [lng, lat] = point;
  if (
    lng < polygon.minLng ||
    lng > polygon.maxLng ||
    lat < polygon.minLat ||
    lat > polygon.maxLat
  ) {
    return false;
  }
  if (!inRing(point, polygon.rings[0])) return false;
  return !polygon.rings.slice(1).some((hole) => inRing(point, hole));
}

// 점에서 선들(폴리곤 링 또는 열린 선)까지의 최소 거리(km).
// 좁은 범위라 위도에 맞춰 경도를 보정한 평면 거리로 계산한다.
function distanceToLinesKm(point: Point, lines: Point[][], closed: boolean): number {
  const kmPerDegLng = KM_PER_DEG_LAT * Math.cos((point[1] * Math.PI) / 180);
  const px = point[0] * kmPerDegLng;
  const py = point[1] * KM_PER_DEG_LAT;
  let min = Infinity;
  for (const line of lines) {
    // 닫힌 링은 마지막 점과 첫 점도 잇는다
    for (let i = closed ? 0 : 1, j = closed ? line.length - 1 : 0; i < line.length; j = i++) {
      const ax = line[j][0] * kmPerDegLng;
      const ay = line[j][1] * KM_PER_DEG_LAT;
      const bx = line[i][0] * kmPerDegLng;
      const by = line[i][1] * KM_PER_DEG_LAT;
      const dx = bx - ax;
      const dy = by - ay;
      const lenSq = dx * dx + dy * dy;
      const t =
        lenSq === 0
          ? 0
          : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d < min) min = d;
    }
  }
  return min;
}

export function isInlandSouthKorea(point: Point): boolean {
  const polygon = POLYGONS.find((p) => inPolygon(point, p));
  if (!polygon) return false;
  // 폴리곤 경계 전체(해안선 + 군사분계선)에서 1km 이상
  if (distanceToLinesKm(point, polygon.rings, true) < MIN_COAST_KM) return false;
  // 군사분계선 근처(북위 37.7도 이상)만 추가로 2.5km 이상인지 본다
  if (point[1] >= 37.7 && distanceToLinesKm(point, [SOUTH_KOREA_NORTH_BORDER], false) < MIN_BORDER_KM) {
    return false;
  }
  return true;
}

export function randomPointInSouthKorea(): Point {
  for (let attempt = 0; attempt < 10_000; attempt++) {
    const point: Point = [
      faker.number.float({ min: BOUNDS.minLng, max: BOUNDS.maxLng, fractionDigits: 6 }),
      faker.number.float({ min: BOUNDS.minLat, max: BOUNDS.maxLat, fractionDigits: 6 }),
    ];
    if (isInlandSouthKorea(point)) return point;
  }
  throw new Error('대한민국 육지 안의 좌표를 찾지 못했습니다.');
}

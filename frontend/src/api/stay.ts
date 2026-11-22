import { getJson } from "./client";
import type { Stay } from "../types";

export interface SearchParams {
  bounds: { sw: [number, number]; ne: [number, number] }; // [lng, lat]
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}

// GET /search : 백엔드 SearchQueryDto의 snake_case 쿼리 이름을 그대로 사용
export function searchStays(params: SearchParams) {
  const { sw, ne } = params.bounds;
  const query = new URLSearchParams({
    longitude: String((sw[0] + ne[0]) / 2),
    latitude: String((sw[1] + ne[1]) / 2),
    check_in: params.checkIn,
    check_out: params.checkOut,
    sw_lng: String(sw[0]),
    sw_lat: String(sw[1]),
    ne_lng: String(ne[0]),
    ne_lat: String(ne[1]),
  });
  if (params.guests) query.set("num_of_guests", String(params.guests));
  if (params.minPrice !== undefined) query.set("min_price", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("max_price", String(params.maxPrice));
  return getJson<Stay[]>(`/search?${query}`);
}

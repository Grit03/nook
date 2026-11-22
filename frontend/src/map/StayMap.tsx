/// <reference types="navermaps" />
import "./stay-map.css";
import { useEffect, useRef, useState } from "react";
import type { Stay } from "../types";
import { loadNaverMaps, onNaverMapsAuthFailure } from "./loadNaverMaps";

export interface MapBounds {
  sw: [number, number]; // [lng, lat]
  ne: [number, number];
}

export interface FocusRequest {
  id: number; // 같은 지역을 다시 눌러도 이동하도록 요청마다 값을 바꾼다
  bounds: MapBounds;
}

interface Props {
  stays: Stay[];
  activeId?: number;
  focus: FocusRequest;
  onIdle: (bounds: MapBounds, zoom: number) => void;
  onMarkerClick: (id: number) => void;
  onMarkerHover: (id?: number) => void;
}

// 12,000 → "1.2만", 125,000 → "12.5만", 80,000 → "8만"
const shortPrice = (won: number) => {
  if (won < 10000) return `${won.toLocaleString()}원`;
  const man = won / 10000;
  return `${Number.isInteger(man) ? man : man.toFixed(1)}만`;
};

// 가격 핀이 너무 많으면 서로 겹쳐 지도를 덮는다. 정렬 기준 상위만 가격 핀으로, 나머지는 작은 점으로 그린다.
// 지도를 확대하면 화면 안의 결과가 줄어들어 가격 핀으로 보이는 비율이 자연스럽게 늘어난다.
const PRICE_PIN_LIMIT = 40;

type PinKind = "price" | "dot" | "active";

// HTML 마커의 기본 기준점은 왼쪽 위(0,0)라서, 크기 0인 래퍼를 두고 핀을 CSS로 가운데 위쪽에 올린다.
const pinContent = (stay: Stay, kind: PinKind) =>
  kind === "dot"
    ? `<div class="pin-anchor"><div class="pin-dot" title="${shortPrice(stay.pricePerDay)}"></div></div>`
    : `<div class="pin-anchor"><div class="pin${kind === "active" ? " pin--active" : ""}">${shortPrice(stay.pricePerDay)}</div></div>`;

const toLatLngBounds = (maps: typeof naver.maps, b: MapBounds) =>
  new maps.LatLngBounds(
    new maps.LatLng(b.sw[1], b.sw[0]),
    new maps.LatLng(b.ne[1], b.ne[0]),
  );

export default function StayMap({
  stays,
  activeId,
  focus,
  onIdle,
  onMarkerClick,
  onMarkerHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map>(null);
  // base: 강조되지 않았을 때의 모양 (상위는 가격 핀, 나머지는 점)
  const markersRef = useRef(
    new Map<number, { marker: naver.maps.Marker; stay: Stay; base: Exclude<PinKind, "active"> }>(),
  );
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  // 최신 콜백을 ref에 담아, 지도 이벤트 리스너를 다시 등록하지 않아도 되게 한다.
  const callbacks = useRef({ onIdle, onMarkerClick, onMarkerHover });
  useEffect(() => {
    callbacks.current = { onIdle, onMarkerClick, onMarkerHover };
  });

  // 1) 스크립트 로드 + 지도 생성 (한 번)
  useEffect(() => {
    let cancelled = false;
    const listeners: naver.maps.MapEventListener[] = [];
    const markers = markersRef.current;

    const offAuthFailure = onNaverMapsAuthFailure(() => {
      setStatus("error");
      setError(
        "네이버 지도 인증에 실패했어요. Client ID와 등록된 서비스 URL(http://localhost:5173)을 확인해주세요.",
      );
    });

    loadNaverMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        const map = new maps.Map(containerRef.current, {
          bounds: toLatLngBounds(maps, focus.bounds),
          minZoom: 7,
          zoomControl: true,
          zoomControlOptions: {
            style: maps.ZoomControlStyle.SMALL,
            position: maps.Position.TOP_RIGHT,
          },
          scaleControl: false,
          mapDataControl: false,
        });
        mapRef.current = map;

        // 지도 움직임이 끝나면(idle) 보이는 영역을 올려 보낸다.
        listeners.push(
          maps.Event.addListener(map, "idle", () => {
            const bounds = map.getBounds() as naver.maps.LatLngBounds;
            const sw = bounds.getSW();
            const ne = bounds.getNE();
            callbacks.current.onIdle(
              { sw: [sw.lng(), sw.lat()], ne: [ne.lng(), ne.lat()] },
              map.getZoom(),
            );
          }),
        );
        setStatus("ready");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : "지도를 불러오지 못했어요.");
      });

    return () => {
      cancelled = true;
      offAuthFailure();
      if (window.naver?.maps) naver.maps.Event.removeListener(listeners);
      markers.forEach(({ marker }) => marker.setMap(null));
      markers.clear();
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // 지도는 처음 한 번만 만든다. 이후 지역 이동은 아래 focus 효과가 맡는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 지역 버튼을 누르면 그 지역으로 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    map.fitBounds(toLatLngBounds(naver.maps, focus.bounds));
    // focus.id 가 바뀔 때만 이동한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus.id, status]);

  // 3) 검색 결과가 바뀌면 마커를 맞춘다 (없어진 것은 지우고, 새로 생긴 것만 추가, 모양이 바뀐 것은 아이콘만 교체)
  //    stays 는 이미 정렬된 순서라 앞쪽 PRICE_PIN_LIMIT 개가 가격 핀이 된다.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    const markers = markersRef.current;
    const nextIds = new Set(stays.map((s) => s.id));

    markers.forEach(({ marker }, id) => {
      if (!nextIds.has(id)) {
        naver.maps.Event.clearInstanceListeners(marker);
        marker.setMap(null);
        markers.delete(id);
      }
    });

    stays.forEach((stay, index) => {
      const base = index < PRICE_PIN_LIMIT ? "price" : "dot";
      const zIndex = base === "price" ? 2 : 1;
      const existing = markers.get(stay.id);
      if (existing) {
        if (existing.base !== base) {
          existing.base = base;
          existing.marker.setIcon({ content: pinContent(stay, base) });
          existing.marker.setZIndex(zIndex);
        }
        return;
      }
      const [lng, lat] = stay.point;
      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(lat, lng),
        icon: { content: pinContent(stay, base) },
        title: stay.name,
        zIndex,
      });
      naver.maps.Event.addListener(marker, "click", () =>
        callbacks.current.onMarkerClick(stay.id),
      );
      naver.maps.Event.addListener(marker, "mouseover", () =>
        callbacks.current.onMarkerHover(stay.id),
      );
      naver.maps.Event.addListener(marker, "mouseout", () =>
        callbacks.current.onMarkerHover(undefined),
      );
      markers.set(stay.id, { marker, stay, base });
    });
  }, [stays, status]);

  // 4) 목록에서 고른(hover/click) 스테이의 마커를 강조
  const prevActive = useRef<number>(undefined);
  useEffect(() => {
    if (status !== "ready") return;
    const markers = markersRef.current;
    const prev = prevActive.current !== undefined ? markers.get(prevActive.current) : undefined;
    if (prev && prev !== markers.get(activeId ?? -1)) {
      prev.marker.setIcon({ content: pinContent(prev.stay, prev.base) });
      prev.marker.setZIndex(prev.base === "price" ? 2 : 1);
    }
    // 점으로 표시되던 스테이도 강조할 때는 가격 핀으로 보여준다.
    const next = activeId !== undefined ? markers.get(activeId) : undefined;
    if (next) {
      next.marker.setIcon({ content: pinContent(next.stay, "active") });
      next.marker.setZIndex(1000);
    }
    prevActive.current = activeId;
  }, [activeId, stays, status]);

  return (
    <div className="stay-map">
      <div ref={containerRef} className="stay-map__canvas" aria-label="스테이 지도" />
      {status === "loading" && <div className="stay-map__overlay">지도를 불러오는 중…</div>}
      {status === "error" && (
        <div className="stay-map__overlay stay-map__overlay--error" role="alert">
          <p>{error}</p>
          <p className="stay-map__hint">지도 없이도 위의 지역 버튼으로 검색할 수 있어요.</p>
        </div>
      )}
    </div>
  );
}

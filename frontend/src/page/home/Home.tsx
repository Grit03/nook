import "./home.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../component/header/Header";
import Loader from "../../component/Loader";
import StayCard from "../../component/stay-card/StayCard";
import StayMap, { type FocusRequest, type MapBounds } from "../../map/StayMap";
import { REGIONS } from "./regions";
import { useStaySearch } from "./useStaySearch";
import { nextWeekend, nightsBetween, toYmd } from "../../utils/format";

const PRICE_BANDS = [
  { id: "all", label: "전체" },
  { id: "low", label: "~5만", max: 50000 },
  { id: "mid", label: "5~10만", min: 50000, max: 100000 },
  { id: "high", label: "10~20만", min: 100000, max: 200000 },
  { id: "top", label: "20만~", min: 200000 },
] as const;

type BandId = (typeof PRICE_BANDS)[number]["id"];
type SortKey = "rating" | "price-asc" | "price-desc";
const PAGE = 24;
const MAX_GUESTS = 8;
// 백엔드 검색에는 개수 제한이 없어서, 지도가 너무 넓게 보이면(전국 단위) 검색하지 않는다.
// 줌 레벨은 지도 크기에 따라 같은 지역도 달라지므로, 보이는 영역의 넓이(경도 x 위도)로 판단한다.
// 제주도 전체(약 0.8 x 0.4도)가 한 화면에 들어오는 정도까지 허용한다.
const MAX_SEARCH_AREA = 2.5;
const areaOf = (b: MapBounds) => (b.ne[0] - b.sw[0]) * (b.ne[1] - b.sw[1]);
// 마커가 너무 많으면 지도가 느려져서, 정렬 기준 상위만 지도에 표시한다.
const MAX_MARKERS = 300;

const addDays = (ymd: string, days: number) => {
  const d = new Date(ymd);
  d.setDate(d.getDate() + days);
  return toYmd(d);
};

export default function Home() {
  const [regionId, setRegionId] = useState<string | null>(REGIONS[0].id);
  const [focus, setFocus] = useState<FocusRequest>({
    id: 0,
    bounds: { sw: REGIONS[0].sw, ne: REGIONS[0].ne },
  });
  // 지도에서 받은 현재 영역. 지도를 못 쓰는 경우(키 없음 등)에는 null 이고, 지역 버튼의 영역으로 검색한다.
  const [view, setView] = useState<{ bounds: MapBounds; zoom: number } | null>(null);
  const [dates, setDates] = useState(nextWeekend);
  const [guests, setGuests] = useState(2);
  const [band, setBand] = useState<BandId>("all");
  const [sort, setSort] = useState<SortKey>("rating");
  const [visible, setVisible] = useState(PAGE);
  const [activeId, setActiveId] = useState<number>();
  const [scrollTarget, setScrollTarget] = useState<number>();
  const [today] = useState(() => toYmd(new Date()));
  // 지역 버튼으로 이동한 직후의 idle 인지, 사용자가 직접 지도를 움직인 것인지 구분
  const movingToRegion = useRef(true);

  const region = REGIONS.find((r) => r.id === regionId);
  const priceBand = PRICE_BANDS.find((b) => b.id === band)!;
  const nights = nightsBetween(dates.checkIn, dates.checkOut);
  const tooWide = view !== null && areaOf(view.bounds) > MAX_SEARCH_AREA;
  const searchBounds = view?.bounds ?? focus.bounds;

  const { result, retry } = useStaySearch(
    tooWide
      ? null
      : {
          bounds: searchBounds,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          guests,
          minPrice: "min" in priceBand ? priceBand.min : undefined,
          maxPrice: "max" in priceBand ? priceBand.max : undefined,
        },
  );

  const sorted = useMemo(() => {
    if (result.status !== "done") return [];
    const list = [...result.stays];
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sort === "price-asc") list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price-desc") list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    return list;
  }, [result, sort]);

  const markerStays = useMemo(() => sorted.slice(0, MAX_MARKERS), [sorted]);

  // 마커를 누르면 목록의 해당 카드로 스크롤
  useEffect(() => {
    if (scrollTarget === undefined) return;
    document
      .getElementById(`stay-${scrollTarget}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollTarget]);

  // 검색 조건이 바뀌면 목록을 처음부터 보여준다.
  const resetPaging = () => setVisible(PAGE);

  const moveToRegion = (id: string) => {
    const r = REGIONS.find((x) => x.id === id)!;
    movingToRegion.current = true;
    setRegionId(id);
    setFocus((prev) => ({ id: prev.id + 1, bounds: { sw: r.sw, ne: r.ne } }));
    resetPaging();
  };

  const handleIdle = (bounds: MapBounds, zoom: number) => {
    // 사용자가 지도를 직접 움직였으면 지역 선택 표시를 해제한다.
    if (!movingToRegion.current) setRegionId(null);
    movingToRegion.current = false;
    setView({ bounds, zoom });
    resetPaging();
  };

  const handleMarkerClick = (id: number) => {
    setActiveId(id);
    const index = sorted.findIndex((s) => s.id === id);
    if (index >= visible) setVisible(Math.ceil((index + 1) / PAGE) * PAGE);
    setScrollTarget(id);
  };

  const changeCheckIn = (checkIn: string) => {
    if (!checkIn) return;
    // 체크아웃이 체크인보다 빠르거나 같으면 다음 날로 맞춘다.
    setDates((prev) => ({
      checkIn,
      checkOut: nightsBetween(checkIn, prev.checkOut) < 1 ? addDays(checkIn, 1) : prev.checkOut,
    }));
    resetPaging();
  };

  const changeCheckOut = (checkOut: string) => {
    if (!checkOut || nightsBetween(dates.checkIn, checkOut) < 1) return;
    setDates((prev) => ({ ...prev, checkOut }));
    resetPaging();
  };

  return (
    <>
      <Header />
      <main>
        <section className="container hero">
          <p className="hero__eyebrow">LOCAL STAYS</p>
          <h1 className="hero__title">여행지는 동네로 고르고, 잠은 작은 집에서.</h1>
          <p className="hero__desc">
            게스트하우스, 한옥, 독채처럼 주인이 직접 꾸린 작은 스테이를 지도에서 찾아보세요.
          </p>

          <div className="regions" role="group" aria-label="지역으로 이동">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                className="region"
                aria-pressed={r.id === regionId}
                title={r.note}
                onClick={() => moveToRegion(r.id)}
              >
                {r.name}
              </button>
            ))}
          </div>

          <form className="filters" aria-label="검색 조건" onSubmit={(e) => e.preventDefault()}>
            <label className="field">
              <span>체크인</span>
              <input
                type="date"
                value={dates.checkIn}
                min={today}
                onChange={(e) => changeCheckIn(e.target.value)}
              />
            </label>
            <label className="field">
              <span>체크아웃</span>
              <input
                type="date"
                value={dates.checkOut}
                min={addDays(dates.checkIn, 1)}
                onChange={(e) => changeCheckOut(e.target.value)}
              />
            </label>
            <div className="field">
              <span id="guests-label">인원</span>
              <div className="stepper" role="group" aria-labelledby="guests-label">
                <button
                  type="button"
                  aria-label="인원 줄이기"
                  disabled={guests <= 1}
                  onClick={() => {
                    setGuests((g) => g - 1);
                    resetPaging();
                  }}
                >
                  −
                </button>
                <output aria-live="polite">{guests}명</output>
                <button
                  type="button"
                  aria-label="인원 늘리기"
                  disabled={guests >= MAX_GUESTS}
                  onClick={() => {
                    setGuests((g) => g + 1);
                    resetPaging();
                  }}
                >
                  +
                </button>
              </div>
            </div>
            <div className="field">
              <span id="band-label">1박 요금</span>
              <div className="bands" role="group" aria-labelledby="band-label">
                {PRICE_BANDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="band"
                    aria-pressed={b.id === band}
                    onClick={() => {
                      setBand(b.id);
                      resetPaging();
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="field filters__sort">
              <span>정렬</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="rating">평점 높은 순</option>
                <option value="price-asc">요금 낮은 순</option>
                <option value="price-desc">요금 높은 순</option>
              </select>
            </label>
          </form>
        </section>

        <section className="container explore">
          <div className="explore__list results" aria-live="polite">
            <div className="results__head">
              <h2 className="results__title">
                {/* 지도는 지역 경계보다 넓게 보일 수 있어(화면 비율) "주변"이라고 쓴다 */}
                {region ? `${region.name} 주변 스테이` : "지도 영역의 스테이"}
              </h2>
              {result.status === "done" && (
                <span className="results__count">
                  {sorted.length.toLocaleString()}곳 · {nights}박
                  {sorted.length > MAX_MARKERS && ` · 지도에는 상위 ${MAX_MARKERS}곳`}
                </span>
              )}
            </div>

            {result.status === "idle" && (
              <div className="results__state">
                <p>
                  지도가 너무 넓게 보이고 있어요.
                  <br />
                  지도를 확대하거나 위의 지역을 골라주세요.
                </p>
              </div>
            )}
            {result.status === "loading" && (
              <div className="results__state">
                <Loader />
              </div>
            )}
            {result.status === "error" && (
              <div className="results__state">
                <p>{result.message}</p>
                <button className="btn btn--ghost" onClick={retry}>
                  다시 시도
                </button>
              </div>
            )}
            {result.status === "done" && sorted.length === 0 && (
              <div className="results__state">
                <p>
                  이 영역에는 조건에 맞는 스테이가 없어요.
                  <br />
                  지도를 옮기거나 인원·요금 범위를 바꿔보세요.
                </p>
              </div>
            )}
            {result.status === "done" && sorted.length > 0 && (
              <>
                <ul className="grid">
                  {sorted.slice(0, visible).map((stay) => (
                    <StayCard
                      key={stay.id}
                      stay={stay}
                      nights={nights}
                      active={stay.id === activeId}
                      onHover={setActiveId}
                    />
                  ))}
                </ul>
                {sorted.length > visible && (
                  <div className="results__more">
                    <button className="btn btn--ghost" onClick={() => setVisible((v) => v + PAGE)}>
                      더 보기 ({sorted.length - visible}곳 남음)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="explore__map">
            <StayMap
              stays={markerStays}
              activeId={activeId}
              focus={focus}
              onIdle={handleIdle}
              onMarkerClick={handleMarkerClick}
              onMarkerHover={setActiveId}
            />
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">
          nook · 개인 학습용 프로젝트입니다. 스테이 정보와 사진은 테스트 데이터예요.
        </div>
      </footer>
    </>
  );
}

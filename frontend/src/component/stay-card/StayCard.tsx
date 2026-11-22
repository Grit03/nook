import "./stay-card.css";
import type { Stay } from "../../types";
import { won } from "../../utils/format";

// 스테이 유형 컬럼이 따로 없어서, 이름에 들어 있는 단어로 유형 뱃지를 정한다.
// 순서가 중요하다: "한옥스테이"는 "스테이"보다 먼저 확인해야 한다.
const KIND_RULES: [label: string, keywords: string[]][] = [
  ["한옥", ["한옥", "고택"]],
  ["게스트하우스", ["게스트하우스", "호스텔"]],
  ["민박", ["민박", "여관"]],
  ["독채", ["독채", "돌집", "스테이"]],
];

const kindOf = (name: string) =>
  KIND_RULES.find(([, words]) => words.some((w) => name.includes(w)))?.[0] ?? "스테이";

interface Props {
  stay: Stay;
  nights: number;
  active?: boolean; // 지도에서 고른 스테이
  onHover?: (id?: number) => void;
}

export default function StayCard({ stay, nights, active = false, onHover }: Props) {
  const kind = kindOf(stay.name);
  const title = stay.name;

  return (
    <li
      id={`stay-${stay.id}`}
      onMouseEnter={() => onHover?.(stay.id)}
      onMouseLeave={() => onHover?.(undefined)}
    >
      <article className={`stay-card${active ? " stay-card--active" : ""}`}>
        <div className="stay-card__media">
          <img src={stay.imageUrl} alt="" loading="lazy" width={330} height={200} />
          <span className="stay-card__stamp">{kind}</span>
        </div>
        <div className="stay-card__body">
          <div className="stay-card__top">
            <h3 className="stay-card__name">{title}</h3>
            <span
              className="stay-card__rating"
              aria-label={`평점 ${stay.rating.toFixed(2)}`}
            >
              ★ {stay.rating.toFixed(2)}
            </span>
          </div>
          <p className="stay-card__meta">{stay.address}</p>
          <p className="stay-card__meta">
            최대 {stay.maxGuests}인{stay.host && ` · 호스트 ${stay.host.name}`}
          </p>
          <div className="stay-card__price">
            <span>
              <b>{won(stay.pricePerDay)}</b> / 1박
            </span>
            {nights > 1 && (
              <span>
                {nights}박 {won(stay.pricePerDay * nights)}
              </span>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

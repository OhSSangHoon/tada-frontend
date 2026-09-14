import { SearchResultResponse } from "@/domains/search/types/search";

interface SearchResultListProps {
  items: SearchResultResponse[];
  keyword: string;
  onSelectDiary?: (diaryId: string) => void;
}

export function SearchResultList({
  items,
  keyword,
  onSelectDiary,
}: SearchResultListProps) {
  if (items.length === 0) return null;

  return (
    <ul className="search-result-list">
      {items.map((item) => (
        <li
          key={item.id}
          className="search-result-item"
          onClick={() => onSelectDiary?.(item.id)}
        >
          <div className="search-result-item__meta">
            <span>{item.entryDate}</span>
            <span>{item.weather}</span>
          </div>
          <h3>{highlightKeyword(item.title, keyword)}</h3>
          <p>{highlightKeyword(truncate(item.content, 80), keyword)}</p>
        </li>
      ))}
    </ul>
  );
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function highlightKeyword(text: string, keyword: string) {
  const trimmed = keyword.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
  );
}

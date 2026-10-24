import Svg, { Circle, Path, Rect } from "react-native-svg";

type Name =
  | "home"
  | "grade"
  | "clock"
  | "cal"
  | "menu"
  | "bell"
  | "back"
  | "chev"
  | "plus"
  | "filter"
  | "info"
  | "search"
  | "more"
  | "mail"
  | "link"
  | "share"
  | "trash"
  | "x"
  | "check"
  | "pin"
  | "book"
  | "user"
  | "trophy"
  | "news"
  | "moon"
  | "logout"
  | "chat"
  | "eye"
  | "nav"
  | "camera"
  | "image"
  | "calacad"
  | "sun"
  | "left";

export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 1.8,
}: {
  name: Name;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const common = { fill: "none" as const, stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "home" ? <Path {...common} d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" /> : null}
      {name === "grade" ? (
        <>
          <Rect {...common} x={3} y={4} width={5} height={16} rx={1} />
          <Rect {...common} x={10} y={4} width={5} height={16} rx={1} />
          <Rect {...common} x={17} y={4} width={4} height={16} rx={1} />
        </>
      ) : null}
      {name === "clock" ? (
        <>
          <Circle {...common} cx={12} cy={12} r={9} />
          <Path {...common} d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === "cal" || name === "calacad" ? (
        <>
          <Rect {...common} x={3} y={5} width={18} height={16} rx={2} />
          <Path {...common} d="M16 3v4M8 3v4M3 10h18" />
        </>
      ) : null}
      {name === "menu" ? <Path {...common} d="M4 7h16M4 12h16M4 17h16" /> : null}
      {name === "bell" ? (
        <>
          <Path {...common} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path {...common} d="M13.73 21a2 2 0 0 1-3.46 0" />
        </>
      ) : null}
      {name === "back" || name === "left" ? <Path {...common} d="M15 18l-6-6 6-6" /> : null}
      {name === "chev" ? <Path {...common} d="M9 18l6-6-6-6" /> : null}
      {name === "plus" ? <Path {...common} d="M12 5v14M5 12h14" /> : null}
      {name === "filter" ? (
        <>
          <Path {...common} d="M3 6h11M18 6h3M3 12h5M12 12h9M3 18h13M20 18h1" />
          <Circle {...common} cx={16} cy={6} r={2} />
          <Circle {...common} cx={10} cy={12} r={2} />
          <Circle {...common} cx={18} cy={18} r={2} />
        </>
      ) : null}
      {name === "info" ? (
        <>
          <Circle {...common} cx={12} cy={12} r={9} />
          <Path {...common} d="M12 11v5M12 8h.01" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <Circle {...common} cx={11} cy={11} r={7} />
          <Path {...common} d="m20 20-3.5-3.5" />
        </>
      ) : null}
      {name === "more" ? (
        <>
          <Circle {...common} cx={5} cy={12} r={1.2} />
          <Circle {...common} cx={12} cy={12} r={1.2} />
          <Circle {...common} cx={19} cy={12} r={1.2} />
        </>
      ) : null}
      {name === "mail" ? (
        <>
          <Rect {...common} x={3} y={5} width={18} height={14} rx={2} />
          <Path {...common} d="m3 7 9 6 9-6" />
        </>
      ) : null}
      {name === "link" ? (
        <>
          <Path {...common} d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
          <Path {...common} d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
        </>
      ) : null}
      {name === "share" ? (
        <>
          <Path {...common} d="M12 3v13M7 8l5-5 5 5" />
          <Path {...common} d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </>
      ) : null}
      {name === "trash" ? <Path {...common} d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /> : null}
      {name === "x" ? <Path {...common} d="M18 6 6 18M6 6l12 12" /> : null}
      {name === "check" ? <Path {...common} d="M5 12l5 5 9-10" /> : null}
      {name === "pin" ? (
        <>
          <Path {...common} d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <Circle {...common} cx={12} cy={10} r={2.5} />
        </>
      ) : null}
      {name === "book" ? (
        <>
          <Path {...common} d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" />
          <Path {...common} d="M4 16a4 4 0 0 1 4-4h10" />
        </>
      ) : null}
      {name === "user" ? (
        <>
          <Circle {...common} cx={12} cy={8} r={4} />
          <Path {...common} d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
        </>
      ) : null}
      {name === "trophy" ? (
        <>
          <Path {...common} d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
          <Path {...common} d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
        </>
      ) : null}
      {name === "news" ? (
        <>
          <Path {...common} d="M4 5h13v14H6a2 2 0 0 1-2-2z" />
          <Path {...common} d="M17 9h3v8a2 2 0 0 1-2 2" />
          <Path {...common} d="M8 9h5M8 13h5" />
        </>
      ) : null}
      {name === "moon" ? <Path {...common} d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> : null}
      {name === "sun" ? (
        <>
          <Circle {...common} cx={12} cy={12} r={4} />
          <Path {...common} d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      ) : null}
      {name === "logout" ? (
        <>
          <Path {...common} d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
        </>
      ) : null}
      {name === "chat" ? <Path {...common} d="M4 5h16v11H8l-4 4z" /> : null}
      {name === "eye" ? (
        <>
          <Path {...common} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <Circle {...common} cx={12} cy={12} r={3} />
        </>
      ) : null}
      {name === "nav" ? <Path {...common} d="M3 11l18-8-8 18-2-8z" /> : null}
      {name === "camera" ? (
        <>
          <Path {...common} d="M4 8h3l2-3h6l2 3h3v11H4z" />
          <Circle {...common} cx={12} cy={13} r={3.5} />
        </>
      ) : null}
      {name === "image" ? (
        <>
          <Rect {...common} x={3} y={4} width={18} height={16} rx={2} />
          <Circle {...common} cx={9} cy={10} r={2} />
          <Path {...common} d="m21 16-5-5-9 9" />
        </>
      ) : null}
    </Svg>
  );
}

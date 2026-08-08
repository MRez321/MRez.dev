// Shared visual shell for ImageResponse-generated OG images (Satori-safe:
// inline styles only, flexbox layout, no client code).

const ACCENT = "#6ee7b7"; // emerald-300
const MUTED = "#9ca3af"; // gray-400

export function OgShell({
  eyebrow,
  title,
  subtitle,
  footerLeft,
  footerRight,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  footerLeft?: string;
  footerRight?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px 90px",
        background: "linear-gradient(135deg, #0b0b0f 0%, #131322 55%, #0b0b0f 100%)",
        color: "#fafafa",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {eyebrow ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#fafafa",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ display: "flex", fontSize: 30, color: MUTED, lineHeight: 1.4 }}>
            {subtitle}
          </div>
        ) : null}
        {children}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "36px",
          borderTop: "2px solid rgba(255,255,255,0.12)",
          fontSize: 26,
          color: MUTED,
        }}
      >
        <span>{footerLeft ?? "MRez"}</span>
        {footerRight ? <span>{footerRight}</span> : null}
      </div>
    </div>
  );
}

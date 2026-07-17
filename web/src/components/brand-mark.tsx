import { Heartbeat } from "@phosphor-icons/react/dist/ssr/Heartbeat";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? "brand-compact" : ""}`.trim()}>
      <span className="brand-symbol" aria-hidden="true">
        <Heartbeat size={compact ? 19 : 22} weight="bold" />
      </span>
      <span>ChroniCare</span>
    </span>
  );
}

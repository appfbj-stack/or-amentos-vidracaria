import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

const C = {
  primary:   "#EA580C",
  primary2:  "#F97316",
  primary3:  "#FED7AA",
  dark:      "#1C1917",
  gray:      "#78716C",
  grayLight: "#F5F5F4",
  grayBorder:"#E7E5E4",
  white:     "#FFFFFF",
  green:     "#16A34A",
  red:       "#DC2626",
  blue:      "#2563EB",
};

// ─── STORAGE (IndexedDB simulado com localStorage) ────────────────────────────

const DB = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getAll: (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtN = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${C.grayLight}; color: ${C.dark}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: ${C.primary3}; border-radius: 4px; }
  input, select, textarea { font-family: 'Inter', sans-serif; }
  .slide-in { animation: slideIn .2s ease; }
  @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fade { animation: fade .15s ease; }
  @keyframes fade { from { opacity:0; } to { opacity:1; } }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const Btn = ({ children, onClick, color = "primary", size = "md", full, outline, disabled, style: s }) => {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: "none", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "Inter", fontWeight: 600, transition: "all .15s",
    opacity: disabled ? .5 : 1, width: full ? "100%" : "auto",
    padding: size === "sm" ? "6px 12px" : size === "lg" ? "14px 24px" : "10px 18px",
    fontSize: size === "sm" ? 13 : size === "lg" ? 16 : 14,
    ...(outline ? {
      background: "transparent",
      border: `2px solid ${color === "primary" ? C.primary : color === "red" ? C.red : C.green}`,
      color: color === "primary" ? C.primary : color === "red" ? C.red : C.green,
    } : {
      background: color === "primary" ? C.primary : color === "red" ? C.red : color === "green" ? C.green : color === "gray" ? C.grayBorder : C.blue,
      color: color === "gray" ? C.dark : C.white,
    }),
    ...s,
  };
  return <button style={base} onClick={disabled ? undefined : onClick}>{children}</button>;
};

const Input = ({ label, value, onChange, type = "text", placeholder, required, suffix, small }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: .5 }}>{label}{required && <span style={{ color: C.primary }}> *</span>}</label>}
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: small ? "8px 12px" : "11px 14px", borderRadius: 8,
          border: `1.5px solid ${C.grayBorder}`, fontSize: small ? 13 : 14, background: C.white,
          outline: "none", paddingRight: suffix ? 40 : 14, transition: "border .15s",
        }}
        onFocus={e => e.target.style.borderColor = C.primary}
        onBlur={e => e.target.style.borderColor = C.grayBorder}
      />
      {suffix && <span style={{ position: "absolute", right: 12, fontSize: 12, color: C.gray }}>{suffix}</span>}
    </div>
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${C.grayBorder}`,
      fontSize: 14, background: C.white, outline: "none", cursor: "pointer",
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Card = ({ children, style: s, onClick }) => (
  <div onClick={onClick} style={{
    background: C.white, borderRadius: 14, padding: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,.08)", cursor: onClick ? "pointer" : "default",
    transition: "box-shadow .15s", ...s,
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = "0 4px 16px rgba(234,88,12,.15)")}
    onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.08)")}
  >{children}</div>
);

const Badge = ({ children, color = "primary" }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
    background: color === "primary" ? C.primary3 : color === "green" ? "#DCFCE7" : color === "red" ? "#FEE2E2" : color === "blue" ? "#DBEAFE" : "#F3F4F6",
    color: color === "primary" ? C.primary : color === "green" ? C.green : color === "red" ? C.red : color === "blue" ? C.blue : C.gray,
  }}>{children}</span>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000,
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="slide-in" style={{
      background: C.white, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: wide ? 700 : 500,
      maxHeight: "92vh", overflow: "auto", padding: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: C.grayLight, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const SectionHeader = ({ title, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.dark }}>{title}</h2>
    {action}
  </div>
);

const EmptyState = ({ icon, text, action }) => (
  <div style={{ textAlign: "center", padding: "48px 24px", color: C.gray }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
    <p style={{ marginBottom: 16, fontSize: 15 }}>{text}</p>
    {action}
  </div>
);

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

const statusColor = { "Orçamento": "primary", "Aprovado": "blue", "Em execução": "blue", "Concluído": "green", "Cancelado": "red" };
const StatusBadge = ({ s }) => <Badge color={statusColor[s] || "primary"}>{s}</Badge>;

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

const NAV = [
  { id: "home", icon: "🏠", label: "Início" },
  { id: "orcamentos", icon: "📋", label: "Orçamentos" },
  { id: "clientes", icon: "👥", label: "Clientes" },
  { id: "financeiro", icon: "💰", label: "Financeiro" },
  { id: "config", icon: "⚙️", label: "Config" },
];

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  return (
    <>
      <style>{globalStyle}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.grayLight, position: "relative" }}>
        <div style={{ paddingBottom: 66 }}>
          <div style={{ padding: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.primary }}>🪟 VidraçaPro</h1>
            <p style={{ color: C.gray, marginTop: 8 }}>Página: {page}</p>
          </div>
        </div>
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480,
          background: C.white, borderTop: `1px solid ${C.grayBorder}`,
          display: "flex", zIndex: 100,
          boxShadow: "0 -2px 12px rgba(0,0,0,.08)",
        }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              flex: 1, padding: "10px 4px 8px", background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: page === n.id ? 700 : 500, color: page === n.id ? C.primary : C.gray, fontFamily: "Inter" }}>{n.label}</span>
              {page === n.id && <div style={{ width: 20, height: 3, borderRadius: 2, background: C.primary, marginTop: 1 }} />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

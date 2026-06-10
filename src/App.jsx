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
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${C.primary3}; border-radius: 4px; }
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
    display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 0 0",
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

// ─── CROQUI SVG ───────────────────────────────────────────────────────────────
const Croqui = ({ tipo, folhas, largura, altura, cor, vidro }) => {
  const W = 280, H = 200, pad = 30, fw = 8;
  const iW = W - pad * 2, iH = H - pad * 2;
  const numFolhas = parseInt(folhas) || 2;

  const renderPorta = () => {
    const fW = iW / numFolhas;
    return (
      <g>
        <rect x={pad} y={pad} width={iW} height={iH} fill="#E5E7EB" stroke={C.primary} strokeWidth={fw} rx={2} />
        <rect x={pad} y={H - pad - 10} width={iW} height={10} fill={C.primary} />
        {Array.from({ length: numFolhas }).map((_, i) => {
          const x = pad + fw / 2 + i * fW;
          const w = fW - fw;
          return (
            <g key={i}>
              <rect x={x} y={pad + fw / 2} width={w} height={iH - fw - 10} fill="rgba(186,230,253,.4)" stroke="#93C5FD" strokeWidth={1.5} />
              {i === (numFolhas === 1 ? 0 : numFolhas - 1) &&
                <rect x={x + 8} y={H / 2 - 16} width={5} height={32} fill={C.primary} rx={2} />}
              {numFolhas > 1 && (
                <text x={x + w / 2} y={H / 2 + 4} textAnchor="middle" fontSize={14} fill={C.primary} fontWeight="bold">
                  {i % 2 === 0 ? "\u2192" : "\u2190"}
                </text>
              )}
              {numFolhas <= 2 && [.25, .5, .75].map((p, j) => (
                <circle key={j} cx={x + 3} cy={pad + fw / 2 + (iH - 10 - fw) * p} r={3} fill={C.primary} />
              ))}
            </g>
          );
        })}
        <line x1={pad} y1={H - 8} x2={W - pad} y2={H - 8} stroke={C.gray} strokeWidth={1} markerEnd="url(#arr)" />
        <text x={W / 2} y={H - 1} textAnchor="middle" fontSize={9} fill={C.gray}>{largura || "0"} m</text>
        <line x1={W - 8} y1={pad} x2={W - 8} y2={H - pad} stroke={C.gray} strokeWidth={1} />
        <text x={W - 2} y={H / 2} textAnchor="middle" fontSize={9} fill={C.gray} transform={`rotate(-90,${W - 2},${H / 2})`}>{altura || "0"} m</text>
      </g>
    );
  };

  const renderJanela = () => {
    const fW = iW / numFolhas;
    return (
      <g>
        <rect x={pad} y={pad} width={iW} height={iH} fill="#F3F4F6" stroke={C.primary} strokeWidth={fw} rx={2} />
        <rect x={pad + fw / 2} y={pad + fw / 2} width={iW - fw} height={18} fill="rgba(186,230,253,.3)" stroke="#93C5FD" strokeWidth={1} />
        {Array.from({ length: numFolhas }).map((_, i) => {
          const x = pad + fw / 2 + i * fW;
          const w = fW - (i < numFolhas - 1 ? 1 : fw / 2);
          const topY = pad + fw / 2 + 20;
          const fH = iH - fw - 22;
          return (
            <g key={i}>
              <rect x={x} y={topY} width={w} height={fH} fill="rgba(186,230,253,.4)" stroke="#93C5FD" strokeWidth={1.5} />
              <text x={x + w / 2} y={topY + fH / 2 + 5} textAnchor="middle" fontSize={13} fill={C.primary} fontWeight="bold">
                {i % 2 === 0 ? "\u2192" : "\u2190"}
              </text>
            </g>
          );
        })}
        <line x1={pad} y1={H - 8} x2={W - pad} y2={H - 8} stroke={C.gray} strokeWidth={1} />
        <text x={W / 2} y={H - 1} textAnchor="middle" fontSize={9} fill={C.gray}>{largura || "0"} m</text>
        <line x1={W - 8} y1={pad} x2={W - 8} y2={H - pad} stroke={C.gray} strokeWidth={1} />
        <text x={W - 2} y={H / 2} textAnchor="middle" fontSize={9} fill={C.gray} transform={`rotate(-90,${W - 2},${H / 2})`}>{altura || "0"} m</text>
      </g>
    );
  };

  const renderCorrimao = () => (
    <g>
      <rect x={pad} y={pad + 20} width={iW} height={12} fill={C.primary} rx={4} />
      <rect x={pad} y={H - pad - 30} width={iW} height={12} fill={C.primary} rx={4} />
      {Array.from({ length: 6 }).map((_, i) => {
        const x = pad + (iW / 5) * i;
        return <rect key={i} x={x - 5} y={pad + 20} width={10} height={H - pad * 2 - 30} fill={C.primary2} rx={3} />;
      })}
      <rect x={pad + 5} y={pad + 32} width={iW - 10} height={H - pad * 2 - 62} fill="rgba(186,230,253,.5)" stroke="#93C5FD" strokeWidth={1} />
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill={C.gray}>{largura || "0"} m comprimento</text>
    </g>
  );

  const renderBox = () => (
    <g>
      <rect x={pad} y={pad} width={iW} height={iH} fill="rgba(186,230,253,.3)" stroke={C.primary} strokeWidth={fw} rx={2} />
      <rect x={pad + fw / 2} y={pad + fw / 2} width={(iW - fw) / 2} height={iH - fw} fill="rgba(186,230,253,.5)" stroke="#93C5FD" strokeWidth={1.5} />
      <rect x={W / 2} y={pad + fw / 2} width={(iW - fw) / 2} height={iH - fw} fill="rgba(186,230,253,.3)" stroke="#93C5FD" strokeWidth={1.5} />
      <text x={W / 2 - iW / 4} y={H / 2 + 5} textAnchor="middle" fontSize={13} fill={C.primary} fontWeight="bold">→</text>
      <text x={W / 2 + iW / 4} y={H / 2 + 5} textAnchor="middle" fontSize={13} fill={C.primary} fontWeight="bold">←</text>
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={9} fill={C.gray}>{largura || "0"} × {altura || "0"} m</text>
    </g>
  );

  return (
    <svg width={W} height={H} style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.gray} />
        </marker>
      </defs>
      <rect width={W} height={H} fill="#F9FAFB" rx={8} />
      <text x={W / 2} y={14} textAnchor="middle" fontSize={10} fill={C.primary} fontWeight="700" textTransform="uppercase">
        {tipo?.toUpperCase()} — {numFolhas} FOLHA{numFolhas > 1 ? "S" : ""} {cor ? `• ${cor}` : ""}
      </text>
      {tipo === "Porta" && renderPorta()}
      {tipo === "Janela" && renderJanela()}
      {tipo === "Corrim\u00e3o" && renderCorrimao()}
      {(tipo === "Box" || tipo === "Fachada") && renderBox()}
      {!["Porta", "Janela", "Corrim\u00e3o", "Box", "Fachada"].includes(tipo) && renderJanela()}
    </svg>
  );
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const statusColor = { "Or\u00e7amento": "primary", "Aprovado": "blue", "Em execu\u00e7\u00e3o": "blue", "Conclu\u00eddo": "green", "Cancelado": "red" };
const StatusBadge = ({ s }) => <Badge color={statusColor[s] || "primary"}>{s}</Badge>;

// ─── TELA: CONFIGURAÇÕES ──────────────────────────────────────────────────────
const Configuracoes = () => {
  const saved = DB.get("config") || {};
  const [cfg, setCfg] = useState({
    empresa: saved.empresa || "",
    endereco: saved.endereco || "",
    celular: saved.celular || "",
    versiculo: saved.versiculo || '"Tudo o que fizer, fazei-o de cora\u00e7\u00e3o, como ao Senhor." (Col 3:23)',
    percentInstalador: saved.percentInstalador || "30",
    logo: saved.logo || "",
  });
  const [saved2, setSaved2] = useState(false);
  const logoRef = useRef();

  const save = () => { DB.set("config", cfg); setSaved2(true); setTimeout(() => setSaved2(false), 2000); };

  const handleLogo = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setCfg(c => ({ ...c, logo: ev.target.result }));
    r.readAsDataURL(f);
  };

  return (
    <div className="slide-in" style={{ padding: "0 0 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, padding: "24px 20px 20px", color: C.white, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>⚙️ Configurações</h1>
        <p style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>Dados da sua empresa</p>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: C.gray }}>LOGOMARCA</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 12, border: `2px dashed ${C.primary3}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: C.grayLight, overflow: "hidden", flexShrink: 0,
            }}>
              {cfg.logo ? <img src={cfg.logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="logo" /> : <span style={{ fontSize: 28 }}>🏢</span>}
            </div>
            <div>
              <Btn size="sm" color="gray" onClick={() => logoRef.current.click()}>📷 Escolher logo</Btn>
              {cfg.logo && <Btn size="sm" color="red" onClick={() => setCfg(c => ({ ...c, logo: "" }))} style={{ marginLeft: 8 }}>Remover</Btn>}
              <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
            </div>
          </div>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Nome da Empresa" value={cfg.empresa} onChange={v => setCfg(c => ({ ...c, empresa: v }))} placeholder="Ex: Vidraçaria do João" required />
          <Input label="Endereço" value={cfg.endereco} onChange={v => setCfg(c => ({ ...c, endereco: v }))} placeholder="Rua, nº, Bairro - Cidade/UF" />
          <Input label="Celular / WhatsApp" value={cfg.celular} onChange={v => setCfg(c => ({ ...c, celular: v }))} placeholder="(11) 99999-9999" />
          <Input label="% Comissão do Instalador" value={cfg.percentInstalador} onChange={v => setCfg(c => ({ ...c, percentInstalador: v }))} type="number" suffix="%" />
        </Card>
        <Card>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Versículo Bíblico</p>
          <textarea value={cfg.versiculo} onChange={e => setCfg(c => ({ ...c, versiculo: e.target.value }))}
            style={{ width: "100%", border: `1.5px solid ${C.grayBorder}`, borderRadius: 8, padding: 10, fontSize: 14, resize: "vertical", minHeight: 70, fontFamily: "Inter", fontStyle: "italic" }} />
        </Card>
        <Btn full size="lg" onClick={save} color={saved2 ? "green" : "primary"}>
          {saved2 ? "✓ Salvo!" : "💾 Salvar Configurações"}
        </Btn>
      </div>
    </div>
  );
};

// ─── TELA: CLIENTES ───────────────────────────────────────────────────────────
const Clientes = ({ setPage, setClienteSel }) => {
  const [clientes, setClientes] = useState(DB.getAll("clientes"));
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", endereco: "", obs: "" });
  const [editId, setEditId] = useState(null);

  const save = () => {
    if (!form.nome) return;
    const lista = DB.getAll("clientes");
    if (editId) {
      const atualizado = lista.map(c => c.id === editId ? { ...c, ...form } : c);
      DB.set("clientes", atualizado); setClientes(atualizado);
    } else {
      const novo = { ...form, id: uid(), criadoEm: Date.now() };
      const atualizado = [novo, ...lista];
      DB.set("clientes", atualizado); setClientes(atualizado);
    }
    setModal(false); setForm({ nome: "", telefone: "", endereco: "", obs: "" }); setEditId(null);
  };

  const del = (id) => {
    if (!confirm("Excluir cliente?")) return;
    const atualizado = DB.getAll("clientes").filter(c => c.id !== id);
    DB.set("clientes", atualizado); setClientes(atualizado);
  };

  const abrir = (c) => { setForm(c); setEditId(c.id); setModal(true); };

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone?.includes(busca)
  );

  const orcamentosCliente = (id) => DB.getAll("orcamentos").filter(o => o.clienteId === id).length;

  return (
    <div className="slide-in" style={{ padding: "0 0 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, padding: "24px 20px 20px", color: C.white, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>👥 Clientes</h1>
            <p style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>{clientes.length} cadastrado{clientes.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => { setForm({ nome: "", telefone: "", endereco: "", obs: "" }); setEditId(null); setModal(true); }}
            style={{ background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.5)", color: C.white, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 20 }}>+</button>
        </div>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar por nome ou telefone..."
          style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.grayBorder}`, fontSize: 14, background: C.white }} />
        {filtrados.length === 0 ? (
          <EmptyState icon="👥" text="Nenhum cliente cadastrado ainda." action={<Btn onClick={() => setModal(true)}>+ Novo Cliente</Btn>} />
        ) : filtrados.map(c => (
          <Card key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
              {c.nome[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{c.nome}</p>
              {c.telefone && <p style={{ fontSize: 13, color: C.gray }}>{c.telefone}</p>}
              <p style={{ fontSize: 12, color: C.primary, marginTop: 2 }}>{orcamentosCliente(c.id)} orçamento{orcamentosCliente(c.id) !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {c.telefone && <a href={`https://wa.me/55${c.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                style={{ fontSize: 20, textDecoration: "none" }}>💬</a>}
              <button onClick={() => abrir(c)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✏️</button>
              <button onClick={() => del(c.id)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>🗑️</button>
            </div>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal title={editId ? "Editar Cliente" : "Novo Cliente"} onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nome" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} required />
            <Input label="Telefone / WhatsApp" value={form.telefone} onChange={v => setForm(f => ({ ...f, telefone: v }))} placeholder="(11) 99999-9999" />
            <Input label="Endereço" value={form.endereco} onChange={v => setForm(f => ({ ...f, endereco: v }))} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, textTransform: "uppercase" }}>Observações</label>
              <textarea value={form.obs} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))}
                style={{ padding: 10, borderRadius: 8, border: `1.5px solid ${C.grayBorder}`, fontSize: 14, resize: "vertical", minHeight: 70, fontFamily: "Inter" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full color="gray" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn full onClick={save}>Salvar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TELA: ORÇAMENTOS ─────────────────────────────────────────────────────────
const TIPOS = ["Porta", "Janela", "Corrimão", "Box", "Fachada", "Guarda-corpo", "Outro"];
const FOLHAS = ["1", "2", "3", "4"];
const CORES_AL = ["Natural", "Branco", "Bronze", "Preto", "Champagne", "Anodizado", "Personalizado"];
const VIDROS = ["Comum", "Temperado", "Laminado", "Espelho", "Jateado", "Fumê", "Personalizado"];
const ESPESSURAS = ["4mm", "6mm", "8mm", "10mm", "12mm"];
const STATUS_OPTS = ["Or\u00e7amento", "Aprovado", "Em execu\u00e7\u00e3o", "Conclu\u00eddo", "Cancelado"];

const novoOrc = () => ({
  id: uid(),
  numero: "",
  clienteNome: "",
  clienteTel: "",
  obraEndereco: "",
  tipo: "Janela",
  folhas: "2",
  largura: "",
  altura: "",
  corAl: "Natural",
  tipoVidro: "Temperado",
  espVidro: "8mm",
  materiais: [],
  moDeObra: "",
  moDeObraPercent: false,
  percentInstalador: "",
  status: "Or\u00e7amento",
  obs: "",
  criadoEm: Date.now(),
});

const OrcamentoForm = ({ onSave, onCancel, inicial }) => {
  const cfg = DB.get("config") || {};
  const [o, setO] = useState(inicial || { ...novoOrc(), numero: gerarNumero(), percentInstalador: cfg.percentInstalador || "30" });
  const [tab, setTab] = useState(0);
  const [matNome, setMatNome] = useState(""); const [matQtd, setMatQtd] = useState("1"); const [matVlr, setMatVlr] = useState("");

  function gerarNumero() {
    const lista = DB.getAll("orcamentos");
    return String(lista.length + 1).padStart(3, "0");
  }

  const totalMat = o.materiais.reduce((s, m) => s + m.total, 0);
  const moValor = o.moDeObraPercent ? totalMat * (parseFloat(o.moDeObra || 0) / 100) : parseFloat(o.moDeObra || 0);
  const totalGeral = totalMat + moValor;
  const valorInstalador = totalGeral * (parseFloat(o.percentInstalador || 0) / 100);
  const lucro = totalGeral - totalMat - valorInstalador;

  const addMat = () => {
    if (!matNome || !matVlr) return;
    const total = parseFloat(matQtd || 1) * parseFloat(matVlr || 0);
    setO(x => ({ ...x, materiais: [...x.materiais, { id: uid(), nome: matNome, qtd: matQtd, vlr: matVlr, total }] }));
    setMatNome(""); setMatQtd("1"); setMatVlr("");
  };

  const remMat = (id) => setO(x => ({ ...x, materiais: x.materiais.filter(m => m.id !== id) }));

  const tabs = ["📋 Dados", "📐 Medidas", "🧱 Materiais", "💰 Valores"];

  return (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, padding: "20px 16px", color: C.white }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <button onClick={onCancel} style={{ background: "rgba(255,255,255,.2)", border: "none", color: C.white, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>←</button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>{inicial ? "Editar" : "Novo"} Orçamento</h2>
            <p style={{ fontSize: 12, opacity: .8 }}>Nº {o.numero}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              background: tab === i ? C.white : "rgba(255,255,255,.2)", color: tab === i ? C.primary : C.white,
              border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px 0" }}>
        {tab === 0 && (
          <div className="slide-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 10 }}>DADOS DO CLIENTE</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Input label="Nome do Cliente" value={o.clienteNome} onChange={v => setO(x => ({ ...x, clienteNome: v }))} required />
                <Input label="Telefone" value={o.clienteTel} onChange={v => setO(x => ({ ...x, clienteTel: v }))} placeholder="(11) 99999-9999" />
                <Input label="Endereço da Obra" value={o.obraEndereco} onChange={v => setO(x => ({ ...x, obraEndereco: v }))} />
                <Select label="Status" value={o.status} onChange={v => setO(x => ({ ...x, status: v }))} options={STATUS_OPTS.map(s => ({ value: s, label: s }))} />
              </div>
            </Card>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full color="gray" onClick={onCancel}>Cancelar</Btn>
              <Btn full onClick={() => setTab(1)}>Próximo →</Btn>
            </div>
          </div>
        )}
        {tab === 1 && (
          <div className="slide-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>TIPO DE PEÇA</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TIPOS.map(t => (
                  <button key={t} onClick={() => setO(x => ({ ...x, tipo: t }))} style={{
                    padding: "7px 14px", borderRadius: 20, border: `2px solid ${o.tipo === t ? C.primary : C.grayBorder}`,
                    background: o.tipo === t ? C.primary3 : C.white, color: o.tipo === t ? C.primary : C.dark,
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}>{t}</button>
                ))}
              </div>
            </Card>
            {!["Corrimão", "Fachada"].includes(o.tipo) && (
              <Card>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 10 }}>FOLHAS</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {FOLHAS.map(f => (
                    <button key={f} onClick={() => setO(x => ({ ...x, folhas: f }))} style={{
                      flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${o.folhas === f ? C.primary : C.grayBorder}`,
                      background: o.folhas === f ? C.primary : C.white, color: o.folhas === f ? C.white : C.dark,
                      fontWeight: 700, cursor: "pointer", fontSize: 15,
                    }}>{f}</button>
                  ))}
                </div>
              </Card>
            )}
            <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>DIMENSÕES</p>
              <div style={{ display: "flex", gap: 10 }}>
                <Input label="Largura" value={o.largura} onChange={v => setO(x => ({ ...x, largura: v }))} type="number" suffix="m" />
                <Input label="Altura" value={o.altura} onChange={v => setO(x => ({ ...x, altura: v }))} type="number" suffix="m" />
              </div>
            </Card>
            <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>MATERIAL</p>
              <Select label="Cor do Alumínio" value={o.corAl} onChange={v => setO(x => ({ ...x, corAl: v }))} options={CORES_AL.map(c => ({ value: c, label: c }))} />
              <div style={{ display: "flex", gap: 10 }}>
                <Select label="Tipo de Vidro" value={o.tipoVidro} onChange={v => setO(x => ({ ...x, tipoVidro: v }))} options={VIDROS.map(c => ({ value: c, label: c }))} />
                <Select label="Espessura" value={o.espVidro} onChange={v => setO(x => ({ ...x, espVidro: v }))} options={ESPESSURAS.map(c => ({ value: c, label: c }))} />
              </div>
            </Card>
            {(o.largura || o.altura) && (
              <Card>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 10 }}>CROQUI GERADO</p>
                <div style={{ background: C.grayLight, borderRadius: 10, padding: 10, overflow: "hidden" }}>
                  <Croqui tipo={o.tipo} folhas={o.folhas} largura={o.largura} altura={o.altura} cor={o.corAl} vidro={o.tipoVidro} />
                </div>
                <p style={{ fontSize: 11, color: C.gray, textAlign: "center", marginTop: 6 }}>
                  {o.tipo} {o.folhas}F • {o.largura || "?"}m × {o.altura || "?"}m • Al. {o.corAl} • Vidro {o.tipoVidro} {o.espVidro}
                </p>
              </Card>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full color="gray" onClick={() => setTab(0)}>← Voltar</Btn>
              <Btn full onClick={() => setTab(2)}>Próximo →</Btn>
            </div>
          </div>
        )}
        {tab === 2 && (
          <div className="slide-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 10 }}>ADICIONAR MATERIAL</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Input label="Nome do produto" value={matNome} onChange={setMatNome} placeholder="Ex: Perfil de alumínio 3m" />
                <div style={{ display: "flex", gap: 8 }}>
                  <Input label="Qtd" value={matQtd} onChange={setMatQtd} type="number" />
                  <Input label="Valor unit. (R$)" value={matVlr} onChange={setMatVlr} type="number" />
                </div>
                {matNome && matVlr && (
                  <p style={{ fontSize: 12, color: C.gray }}>Total: <strong style={{ color: C.primary }}>{fmt(parseFloat(matQtd || 1) * parseFloat(matVlr || 0))}</strong></p>
                )}
                <Btn full onClick={addMat} disabled={!matNome || !matVlr}>+ Adicionar</Btn>
              </div>
            </Card>
            {o.materiais.length > 0 && (
              <Card>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 10 }}>LISTA DE MATERIAIS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {o.materiais.map(m => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.grayBorder}` }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{m.nome}</p>
                        <p style={{ fontSize: 12, color: C.gray }}>{m.qtd} × {fmt(m.vlr)}</p>
                      </div>
                      <p style={{ fontWeight: 700, color: C.primary }}>{fmt(m.total)}</p>
                      <button onClick={() => remMat(m.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.red }}>✕</button>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6 }}>
                    <p style={{ fontWeight: 700 }}>Total materiais</p>
                    <p style={{ fontWeight: 800, color: C.primary, fontSize: 16 }}>{fmt(totalMat)}</p>
                  </div>
                </div>
              </Card>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full color="gray" onClick={() => setTab(1)}>← Voltar</Btn>
              <Btn full onClick={() => setTab(3)}>Próximo →</Btn>
            </div>
          </div>
        )}
        {tab === 3 && (
          <div className="slide-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>MÃO DE OBRA</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <button onClick={() => setO(x => ({ ...x, moDeObraPercent: false }))} style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${!o.moDeObraPercent ? C.primary : C.grayBorder}`,
                  background: !o.moDeObraPercent ? C.primary3 : C.white, color: !o.moDeObraPercent ? C.primary : C.dark, cursor: "pointer", fontWeight: 600, fontSize: 13,
                }}>Valor fixo (R$)</button>
                <button onClick={() => setO(x => ({ ...x, moDeObraPercent: true }))} style={{
                  flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${o.moDeObraPercent ? C.primary : C.grayBorder}`,
                  background: o.moDeObraPercent ? C.primary3 : C.white, color: o.moDeObraPercent ? C.primary : C.dark, cursor: "pointer", fontWeight: 600, fontSize: 13,
                }}>Percentual (%)</button>
              </div>
              <Input label={o.moDeObraPercent ? "Percentual da mão de obra" : "Valor da mão de obra"} value={o.moDeObra} onChange={v => setO(x => ({ ...x, moDeObra: v }))} type="number" suffix={o.moDeObraPercent ? "%" : "R$"} />
              <Input label="% Comissão do Instalador" value={o.percentInstalador} onChange={v => setO(x => ({ ...x, percentInstalador: v }))} type="number" suffix="%" />
            </Card>
            <Card style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, color: C.white }}>
              <p style={{ fontSize: 12, fontWeight: 700, opacity: .8, marginBottom: 12 }}>RESUMO DO ORÇAMENTO</p>
              {[
                ["Total de materiais", fmt(totalMat)],
                ["Mão de obra", fmt(moValor)],
                ["Comissão do instalador", fmt(valorInstalador)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ opacity: .85, fontSize: 14 }}>{k}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "rgba(255,255,255,.3)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>TOTAL GERAL</span>
                <span style={{ fontWeight: 800, fontSize: 20 }}>{fmt(totalGeral)}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: .75 }}>
                Lucro estimado: {fmt(lucro)}
              </div>
            </Card>
            <Card>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.gray, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Observações</p>
              <textarea value={o.obs} onChange={e => setO(x => ({ ...x, obs: e.target.value }))}
                style={{ width: "100%", border: `1.5px solid ${C.grayBorder}`, borderRadius: 8, padding: 10, fontSize: 14, resize: "vertical", minHeight: 60, fontFamily: "Inter" }} />
            </Card>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full color="gray" onClick={() => setTab(2)}>← Voltar</Btn>
              <Btn full color="green" onClick={() => onSave(o, totalMat, moValor, totalGeral, valorInstalador)}>✓ Salvar Orçamento</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Orcamentos = () => {
  const [lista, setLista] = useState(DB.getAll("orcamentos"));
  const [view, setView] = useState("list");
  const [sel, setSel] = useState(null);
  const [busca, setBusca] = useState("");

  const saveOrc = (o, totalMat, moValor, totalGeral, valorInstalador) => {
    const existentes = DB.getAll("orcamentos");
    let atualizado;
    if (existentes.find(x => x.id === o.id)) {
      atualizado = existentes.map(x => x.id === o.id ? { ...o, totalMat, moValor, totalGeral, valorInstalador } : x);
    } else {
      atualizado = [{ ...o, totalMat, moValor, totalGeral, valorInstalador }, ...existentes];
      const clientes = DB.getAll("clientes");
      if (o.clienteNome && !clientes.find(c => c.nome.toLowerCase() === o.clienteNome.toLowerCase())) {
        DB.set("clientes", [{ id: uid(), nome: o.clienteNome, telefone: o.clienteTel, endereco: o.obraEndereco, obs: "", criadoEm: Date.now() }, ...clientes]);
      }
      const fin = DB.getAll("financeiro");
      DB.set("financeiro", [{ id: uid(), tipo: "entrada", descricao: `Or\u00e7amento #${o.numero} \u2013 ${o.clienteNome}`, valor: totalGeral, orcId: o.id, data: Date.now(), status: "Aguardando" }, ...fin]);
    }
    DB.set("orcamentos", atualizado);
    setLista(atualizado);
    setView("list");
  };

  const del = (id) => {
    if (!confirm("Excluir or\u00e7amento?")) return;
    const atualizado = DB.getAll("orcamentos").filter(o => o.id !== id);
    DB.set("orcamentos", atualizado); setLista(atualizado);
  };

  const filtrados = lista.filter(o =>
    o.clienteNome?.toLowerCase().includes(busca.toLowerCase()) ||
    o.numero?.includes(busca)
  );

  if (view === "form") return <OrcamentoForm onSave={saveOrc} onCancel={() => setView("list")} inicial={sel} />;

  if (view === "detail" && sel) {
    const o = sel;
    const cfg = DB.get("config") || {};
    return (
      <div className="slide-in" style={{ padding: "0 0 80px" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, padding: "20px 16px", color: C.white }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setView("list")} style={{ background: "rgba(255,255,255,.2)", border: "none", color: C.white, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>←</button>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 800 }}>Or\u00e7amento #{o.numero}</h2>
              <p style={{ fontSize: 13, opacity: .8 }}>{o.clienteNome}</p>
            </div>
            <StatusBadge s={o.status} />
          </div>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 8 }}>CROQUI</p>
            <div style={{ background: C.grayLight, borderRadius: 10, padding: 8 }}>
              <Croqui tipo={o.tipo} folhas={o.folhas} largura={o.largura} altura={o.altura} cor={o.corAl} vidro={o.tipoVidro} />
            </div>
            <p style={{ fontSize: 11, color: C.gray, textAlign: "center", marginTop: 6 }}>
              {o.tipo} {o.folhas}F • {o.largura}m × {o.altura}m • Al. {o.corAl} • Vidro {o.tipoVidro} {o.espVidro}
            </p>
          </Card>
          <Card>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 8 }}>CLIENTE / OBRA</p>
            <p><strong>{o.clienteNome}</strong></p>
            {o.clienteTel && <p style={{ color: C.gray, fontSize: 13 }}>{o.clienteTel}</p>}
            {o.obraEndereco && <p style={{ color: C.gray, fontSize: 13 }}>{o.obraEndereco}</p>}
          </Card>
          {o.materiais?.length > 0 && (
            <Card>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 8 }}>MATERIAIS</p>
              {o.materiais.map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.grayBorder}`, fontSize: 13 }}>
                  <span>{m.nome} ({m.qtd}×)</span>
                  <span style={{ fontWeight: 600 }}>{fmt(m.total)}</span>
                </div>
              ))}
            </Card>
          )}
          <Card style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, color: C.white }}>
            {[["Materiais", fmt(o.totalMat)], ["M\u00e3o de obra", fmt(o.moValor)], ["Comiss\u00e3o instalador", fmt(o.valorInstalador)]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                <span style={{ opacity: .85 }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,.3)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800 }}>TOTAL GERAL</span>
              <span style={{ fontWeight: 800, fontSize: 18 }}>{fmt(o.totalGeral)}</span>
            </div>
          </Card>
          {cfg.versiculo && (
            <p style={{ textAlign: "center", fontStyle: "italic", color: C.gray, fontSize: 13, padding: "0 8px" }}>"{cfg.versiculo}"</p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn full color="primary" onClick={() => { setSel(o); setView("form"); }}>✏️ Editar</Btn>
            {o.clienteTel && (
              <Btn full color="green" onClick={() => {
                const msg = `Ol\u00e1 ${o.clienteNome}! Segue o resumo do or\u00e7amento:\n\n${o.tipo} ${o.folhas}F • ${o.largura}m×${o.altura}m\nMateriais: ${fmt(o.totalMat)}\nM\u00e3o de obra: ${fmt(o.moValor)}\n*Total: ${fmt(o.totalGeral)}*\n\n${cfg.empresa || ""}\n${cfg.celular || ""}`;
                window.open(`https://wa.me/55${o.clienteTel.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
              }}>💬 WhatsApp</Btn>
            )}
            <Btn full color="red" onClick={() => { del(o.id); setView("list"); }}>🗑️ Excluir</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-in" style={{ padding: "0 0 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, padding: "24px 20px 20px", color: C.white, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>📋 Orçamentos</h1>
            <p style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>{lista.length} orçamento{lista.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => { setSel(null); setView("form"); }}
            style={{ background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.5)", color: C.white, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 20 }}>+</button>
        </div>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar por cliente ou nº..."
          style={{ padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.grayBorder}`, fontSize: 14, background: C.white }} />
        {filtrados.length === 0 ? (
          <EmptyState icon="📋" text="Nenhum orçamento ainda." action={<Btn onClick={() => setView("form")}>+ Novo Orçamento</Btn>} />
        ) : filtrados.map(o => (
          <Card key={o.id} onClick={() => { setSel(o); setView("detail"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{o.clienteNome || "Sem nome"}</p>
                <p style={{ fontSize: 12, color: C.gray }}>#{o.numero} • {o.tipo} {o.folhas}F • {o.largura}×{o.altura}m</p>
              </div>
              <StatusBadge s={o.status} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, color: C.gray }}>Al. {o.corAl} • Vidro {o.tipoVidro}</p>
              <p style={{ fontWeight: 800, color: C.primary, fontSize: 16 }}>{fmt(o.totalGeral)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── TELA: FINANCEIRO ─────────────────────────────────────────────────────────
const Financeiro = () => {
  const [lista, setLista] = useState(DB.getAll("financeiro"));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ tipo: "entrada", descricao: "", valor: "", data: new Date().toISOString().slice(0, 10), status: "Pago" });
  const [filtro, setFiltro] = useState("todos");

  const save = () => {
    if (!form.descricao || !form.valor) return;
    const atualizado = [{ ...form, id: uid(), data: new Date(form.data).getTime() || Date.now(), valor: parseFloat(form.valor) }, ...DB.getAll("financeiro")];
    DB.set("financeiro", atualizado); setLista(atualizado);
    setModal(false); setForm({ tipo: "entrada", descricao: "", valor: "", data: new Date().toISOString().slice(0, 10), status: "Pago" });
  };

  const del = (id) => {
    const atualizado = lista.filter(x => x.id !== id);
    DB.set("financeiro", atualizado); setLista(atualizado);
  };

  const entradas = lista.filter(x => x.tipo === "entrada").reduce((s, x) => s + (x.valor || 0), 0);
  const saidas = lista.filter(x => x.tipo === "saida").reduce((s, x) => s + (x.valor || 0), 0);
  const saldo = entradas - saidas;

  const filtrados = filtro === "todos" ? lista : lista.filter(x => x.tipo === filtro);

  const meses = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" });
    const ent = lista.filter(x => x.tipo === "entrada" && new Date(x.data).getMonth() === d.getMonth() && new Date(x.data).getFullYear() === d.getFullYear()).reduce((s, x) => s + x.valor, 0);
    const sai = lista.filter(x => x.tipo === "saida" && new Date(x.data).getMonth() === d.getMonth() && new Date(x.data).getFullYear() === d.getFullYear()).reduce((s, x) => s + x.valor, 0);
    meses.push({ label, ent, sai });
  }
  const maxVal = Math.max(...meses.map(m => Math.max(m.ent, m.sai)), 1);

  return (
    <div className="slide-in" style={{ padding: "0 0 80px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primary2})`, padding: "24px 20px 20px", color: C.white, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>💰 Financeiro</h1>
            <p style={{ fontSize: 13, opacity: .85, marginTop: 4 }}>Controle de caixa</p>
          </div>
          <button onClick={() => setModal(true)}
            style={{ background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.5)", color: C.white, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 20 }}>+</button>
        </div>
      </div>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Card style={{ background: "#DCFCE7" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase" }}>Entradas</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.green, marginTop: 4 }}>{fmt(entradas)}</p>
          </Card>
          <Card style={{ background: "#FEE2E2" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: "uppercase" }}>Saídas</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.red, marginTop: 4 }}>{fmt(saidas)}</p>
          </Card>
        </div>
        <Card style={{ background: saldo >= 0 ? `linear-gradient(135deg, ${C.primary}, ${C.primary2})` : `linear-gradient(135deg, ${C.red}, #F87171)`, color: C.white }}>
          <p style={{ fontSize: 12, opacity: .8 }}>SALDO TOTAL</p>
          <p style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{fmt(saldo)}</p>
        </Card>
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, marginBottom: 12 }}>ÚLTIMOS 4 MESES</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 80 }}>
            {meses.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}>
                  <div style={{ width: 14, height: Math.max(4, (m.ent / maxVal) * 60), background: C.green, borderRadius: "4px 4px 0 0" }} />
                  <div style={{ width: 14, height: Math.max(4, (m.sai / maxVal) * 60), background: C.red, borderRadius: "4px 4px 0 0" }} />
                </div>
                <p style={{ fontSize: 10, color: C.gray, textTransform: "capitalize" }}>{m.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: C.green }}>■ Entradas</span>
            <span style={{ fontSize: 11, color: C.red }}>■ Saídas</span>
          </div>
        </Card>
        <div style={{ display: "flex", gap: 6 }}>
          {[["todos", "Todos"], ["entrada", "Entradas"], ["saida", "Saídas"]].map(([k, l]) => (
            <button key={k} onClick={() => setFiltro(k)} style={{
              flex: 1, padding: "7px", borderRadius: 8, border: `2px solid ${filtro === k ? C.primary : C.grayBorder}`,
              background: filtro === k ? C.primary3 : C.white, color: filtro === k ? C.primary : C.dark, fontWeight: 600, cursor: "pointer", fontSize: 12,
            }}>{l}</button>
          ))}
        </div>
        {filtrados.length === 0 ? (
          <EmptyState icon="💰" text="Nenhum lançamento ainda." action={<Btn onClick={() => setModal(true)}>+ Novo Lançamento</Btn>} />
        ) : filtrados.map(x => (
          <Card key={x.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: x.tipo === "entrada" ? "#DCFCE7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {x.tipo === "entrada" ? "↑" : "↓"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{x.descricao}</p>
              <p style={{ fontSize: 11, color: C.gray }}>{new Date(x.data).toLocaleDateString("pt-BR")} • {x.status || ""}</p>
            </div>
            <p style={{ fontWeight: 800, fontSize: 15, color: x.tipo === "entrada" ? C.green : C.red }}>
              {x.tipo === "entrada" ? "+" : "-"}{fmt(x.valor)}
            </p>
            <button onClick={() => del(x.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.gray }}>✕</button>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal title="Novo Lançamento" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {[["entrada", "↑ Entrada"], ["saida", "↓ Saída"]].map(([k, l]) => (
                <button key={k} onClick={() => setForm(f => ({ ...f, tipo: k }))} style={{
                  flex: 1, padding: "10px", borderRadius: 8, border: `2px solid ${form.tipo === k ? (k === "entrada" ? C.green : C.red) : C.grayBorder}`,
                  background: form.tipo === k ? (k === "entrada" ? "#DCFCE7" : "#FEE2E2") : C.white, cursor: "pointer", fontWeight: 700, fontSize: 14,
                  color: form.tipo === k ? (k === "entrada" ? C.green : C.red) : C.dark,
                }}>{l}</button>
              ))}
            </div>
            <Input label="Descrição" value={form.descricao} onChange={v => setForm(f => ({ ...f, descricao: v }))} required />
            <Input label="Valor (R$)" value={form.valor} onChange={v => setForm(f => ({ ...f, valor: v }))} type="number" required />
            <Input label="Data" value={form.data} onChange={v => setForm(f => ({ ...f, data: v }))} type="date" />
            <Select label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))}
              options={["Pago", "Aguardando", "Pago parcial", "Cancelado"].map(s => ({ value: s, label: s }))} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn full color="gray" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn full onClick={save}>Salvar</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TELA: HOME ───────────────────────────────────────────────────────────────
const Home = ({ setPage }) => {
  const cfg = DB.get("config") || {};
  const orcamentos = DB.getAll("orcamentos");
  const clientes = DB.getAll("clientes");
  const fin = DB.getAll("financeiro");
  const entradas = fin.filter(x => x.tipo === "entrada").reduce((s, x) => s + (x.valor || 0), 0);
  const saidas = fin.filter(x => x.tipo === "saida").reduce((s, x) => s + (x.valor || 0), 0);
  const pendentes = orcamentos.filter(o => o.status === "Aprovado" || o.status === "Em execu\u00e7\u00e3o").length;

  return (
    <div className="slide-in" style={{ padding: "0 0 80px" }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primary2} 60%, #FB923C 100%)`,
        padding: "28px 20px 32px", color: C.white, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, position: "relative" }}>
          {cfg.logo
            ? <img src={cfg.logo} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "contain", background: C.white, padding: 4 }} alt="logo" />
            : <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🪟</div>}
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{cfg.empresa || "Vidra\u00e7aPro"}</h1>
            <p style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>{cfg.celular || "Configure sua empresa"}</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, position: "relative" }}>
          {[
            { icon: "📋", val: orcamentos.length, label: "Or\u00e7amentos" },
            { icon: "👥", val: clientes.length, label: "Clientes" },
            { icon: "🔧", val: pendentes, label: "Em andamento" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,.18)", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{s.val}</div>
              <div style={{ fontSize: 10, opacity: .8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: .5 }}>Saldo Geral</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: (entradas - saidas) >= 0 ? C.green : C.red, marginTop: 4 }}>
            {fmt(entradas - saidas)}
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: C.green }}>↑ {fmt(entradas)}</span>
            <span style={{ fontSize: 12, color: C.red }}>↓ {fmt(saidas)}</span>
          </div>
        </Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: .5 }}>Ações Rápidas</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "📋", label: "Novo Or\u00e7amento", page: "orcamentos", color: C.primary },
            { icon: "👥", label: "Clientes", page: "clientes", color: "#7C3AED" },
            { icon: "💰", label: "Financeiro", page: "financeiro", color: C.green },
            { icon: "⚙️", label: "Configura\u00e7\u00f5es", page: "config", color: C.gray },
          ].map(a => (
            <button key={a.label} onClick={() => setPage(a.page)} style={{
              background: C.white, borderRadius: 14, padding: "16px 12px", border: `2px solid ${C.grayBorder}`,
              cursor: "pointer", textAlign: "left", boxShadow: "0 1px 4px rgba(0,0,0,.06)", transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.grayBorder; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{a.label}</p>
            </button>
          ))}
        </div>
        {orcamentos.length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: .5 }}>Recentes</p>
              <button onClick={() => setPage("orcamentos")} style={{ fontSize: 12, color: C.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Ver todos →</button>
            </div>
            {orcamentos.slice(0, 3).map(o => (
              <Card key={o.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primary3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🪟</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{o.clienteNome}</p>
                  <p style={{ fontSize: 12, color: C.gray }}>#{o.numero} • {o.tipo}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 800, color: C.primary }}>{fmt(o.totalGeral)}</p>
                  <StatusBadge s={o.status} />
                </div>
              </Card>
            ))}
          </>
        )}
        {cfg.versiculo && (
          <Card style={{ background: `linear-gradient(135deg, #FFF7ED, ${C.primary3})`, border: `1px solid ${C.primary3}`, textAlign: "center" }}>
            <p style={{ fontSize: 13, fontStyle: "italic", color: C.primary, lineHeight: 1.5 }}>✝️ {cfg.versiculo}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

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
        {/* conteúdo */}
        <div style={{ paddingBottom: 66 }}>
          {page === "home" && <Home setPage={setPage} />}
          {page === "orcamentos" && <Orcamentos />}
          {page === "clientes" && <Clientes setPage={setPage} />}
          {page === "financeiro" && <Financeiro />}
          {page === "config" && <Configuracoes />}
        </div>

        {/* bottom nav */}
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

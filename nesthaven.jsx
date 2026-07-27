import React, { useState, useMemo, useEffect } from "react";
import {
  Building2, Users, Wallet, MessageSquareWarning, BarChart3, LogOut,
  Plus, X, Check, Clock, AlertTriangle, Home, KeyRound, Phone, Mail,
  ChevronRight, User, ShieldCheck, DoorOpen, Menu
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------------------------------------------------------------
   TOKENS
   Ink navy / brass hospitality palette. Room "key tag" motif used
   as the signature element throughout (room + rent + tenant cards
   read like hotel room key fobs with a punched hole + numbered tag).
----------------------------------------------------------------*/
const C = {
  ink: "#1B2A41",
  inkSoft: "#28405F",
  linen: "#F3EEE3",
  linenDark: "#E8E0CE",
  brass: "#C9A46A",
  brassDark: "#A9834F",
  sage: "#7C9885",
  sageDark: "#5D7A67",
  clay: "#B85C4A",
  clayDark: "#9A4736",
  ink10: "rgba(27,42,65,0.08)",
};

const fontDisplay = { fontFamily: "'Georgia', 'Iowan Old Style', serif" };
const fontMono = { fontFamily: "'Courier New', monospace" };

/* ---------------------------------------------------------------
   HASH ROUTER
   Every page (landing, auth, dashboard, properties, tenants, rent,
   complaints, reports) lives at a real, bookmarkable/shareable URL
   fragment. Links are real <a href> tags, so right-click/open-in-new-
   tab, browser back/forward, and reload-to-same-page all work like
   an actual multi-page site.
----------------------------------------------------------------*/
function getRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  return hash;
}

function useHashRoute() {
  const [route, setRoute] = useState(getRoute());
  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return route;
}

function navigate(href) {
  window.location.hash = href.replace(/^#/, "");
}

function Link({ href, children, style, onClick }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        navigate(href);
      }}
      style={{ textDecoration: "none", color: "inherit", ...style }}
    >
      {children}
    </a>
  );
}

function NavLink({ href, active, children, style }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9,
        background: active ? "rgba(201,164,106,0.18)" : "transparent",
        color: active ? C.brass : C.linen,
        fontSize: 14, fontWeight: 600, cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------------
   SEED DATA
----------------------------------------------------------------*/
const seedProperties = [
  { id: "p1", name: "Maple Residency", address: "14 Church Street, Bengaluru" },
  { id: "p2", name: "Birchwood House", address: "22 Lake View Road, Bengaluru" },
];

const seedRooms = [
  { id: "r1", propertyId: "p1", number: "101", type: "Single", capacity: 1, rent: 9500 },
  { id: "r2", propertyId: "p1", number: "102", type: "Double", capacity: 2, rent: 7000 },
  { id: "r3", propertyId: "p1", number: "103", type: "Triple", capacity: 3, rent: 5500 },
  { id: "r4", propertyId: "p1", number: "201", type: "Single", capacity: 1, rent: 9500 },
  { id: "r5", propertyId: "p2", number: "G1", type: "Double", capacity: 2, rent: 7500 },
  { id: "r6", propertyId: "p2", number: "G2", type: "Single", capacity: 1, rent: 10000 },
];

const seedTenants = [
  { id: "t1", name: "Ananya Rao", phone: "98765 10001", email: "ananya@mail.com", roomId: "r1", idType: "Aadhaar", idNumber: "XXXX-1234", emergency: "Sunita Rao – 98700 11111", moveIn: "2026-01-10", status: "active" },
  { id: "t2", name: "Vikram Shah", phone: "98765 10002", email: "vikram@mail.com", roomId: "r2", idType: "Passport", idNumber: "P1234567", emergency: "Rakesh Shah – 98700 22222", moveIn: "2026-02-01", status: "active" },
  { id: "t3", name: "Divya Menon", phone: "98765 10003", email: "divya@mail.com", roomId: "r2", idType: "Aadhaar", idNumber: "XXXX-5678", emergency: "Leela Menon – 98700 33333", moveIn: "2026-02-15", status: "active" },
  { id: "t4", name: "Rohit Verma", phone: "98765 10004", email: "rohit@mail.com", roomId: "r3", idType: "Aadhaar", idNumber: "XXXX-9012", emergency: "Anil Verma – 98700 44444", moveIn: "2026-03-01", status: "active" },
  { id: "t5", name: "Priya Nair", phone: "98765 10005", email: "priya@mail.com", roomId: "r5", idType: "Aadhaar", idNumber: "XXXX-3456", emergency: "Suja Nair – 98700 55555", moveIn: "2026-01-20", status: "active" },
  { id: "t6", name: "Karan Malhotra", phone: "98765 10006", email: "karan@mail.com", roomId: "r6", idType: "Passport", idNumber: "P7654321", emergency: "Ravi Malhotra – 98700 66666", moveIn: "2026-04-05", status: "active" },
];

const months = ["April", "May", "June", "July"];
function seedRent() {
  let id = 1;
  const rows = [];
  seedTenants.forEach((t) => {
    const room = seedRooms.find((r) => r.id === t.roomId);
    months.forEach((m, i) => {
      let status = "paid";
      if (m === "July") status = Math.random() > 0.55 ? "due" : "paid";
      if (m === "June" && t.id === "t4") status = "overdue";
      rows.push({ id: `rent${id++}`, tenantId: t.id, month: m, amount: room.rent, status });
    });
  });
  return rows;
}

const seedComplaints = [
  { id: "c1", tenantId: "t1", title: "Leaking tap", description: "Bathroom tap has been leaking for two days.", status: "open", createdAt: "2026-07-20", response: "" },
  { id: "c2", tenantId: "t3", title: "Wi-Fi down", description: "No internet since last night in room 102.", status: "in-progress", response: "Technician scheduled for tomorrow morning.", createdAt: "2026-07-22" },
  { id: "c3", tenantId: "t5", title: "AC servicing", description: "AC making a rattling noise.", status: "resolved", response: "Serviced on 24 July, replaced fan belt.", createdAt: "2026-07-18" },
];

/* ---------------------------------------------------------------
   SMALL UI PRIMITIVES
----------------------------------------------------------------*/
function KeyTag({ children, style }) {
  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: 14,
        border: `1px solid ${C.ink10}`,
        boxShadow: "0 1px 2px rgba(27,42,65,0.06)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: C.linen,
          border: `2px solid ${C.brass}`,
        }}
      />
      {children}
    </div>
  );
}

function Pill({ tone = "sage", children }) {
  const map = {
    sage: { bg: "rgba(124,152,133,0.15)", fg: C.sageDark },
    clay: { bg: "rgba(184,92,74,0.14)", fg: C.clayDark },
    brass: { bg: "rgba(201,164,106,0.18)", fg: C.brassDark },
    ink: { bg: "rgba(27,42,65,0.08)", fg: C.ink },
  };
  const s = map[tone];
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", style, type = "button" }) {
  const base = {
    border: "none",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "opacity .15s ease",
  };
  const variants = {
    primary: { background: C.ink, color: C.linen },
    brass: { background: C.brass, color: C.ink },
    ghost: { background: "transparent", color: C.ink, border: `1px solid ${C.ink10}` },
    danger: { background: C.clay, color: "#fff" },
    subtle: { background: C.linenDark, color: C.ink },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseOver={(e) => (e.currentTarget.style.opacity = 0.85)}
      onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 5, letterSpacing: 0.3 }}>
        {label}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${C.linenDark}`,
  background: "#fff",
  fontSize: 14,
  color: C.ink,
  outline: "none",
};

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(27,42,65,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.linen, borderRadius: 16, padding: 24, width: "100%", maxWidth: 440,
          maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ ...fontDisplay, margin: 0, fontSize: 20, color: C.ink }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkSoft }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   LANDING PAGE
----------------------------------------------------------------*/
function LinkButton({ href, children, variant = "primary", style }) {
  const base = {
    border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600,
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
    textDecoration: "none", transition: "opacity .15s ease",
  };
  const variants = {
    primary: { background: C.ink, color: C.linen },
    brass: { background: C.brass, color: C.ink },
    ghost: { background: "transparent", color: C.ink, border: `1px solid ${C.ink10}` },
  };
  return (
    <Link href={href} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </Link>
  );
}

function Landing() {
  const features = [
    { icon: Building2, title: "Property & Rooms", desc: "Add properties, categorize rooms, track occupancy in real time." },
    { icon: Users, title: "Tenant Management", desc: "KYC, move-in/out, emergency contacts and profiles." },
    { icon: Wallet, title: "Rent & Payments", desc: "Generate monthly rent, track dues, and record payments." },
    { icon: MessageSquareWarning, title: "Complaints", desc: "Tenants raise issues; managers respond and resolve." },
    { icon: BarChart3, title: "Reports & Analytics", desc: "Revenue, occupancy, and expense insights with charts." },
    { icon: ShieldCheck, title: "Role-based Access", desc: "Admin, manager, and tenant scopes enforced end-to-end." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.linen, color: C.ink }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px" }}>
        <Link href="#/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <KeyRound size={22} color={C.brass} />
          <span style={{ ...fontDisplay, fontSize: 20, fontWeight: 700 }}>NestHaven</span>
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <LinkButton variant="ghost" href="#/auth">Sign in</LinkButton>
          <LinkButton variant="primary" href="#/auth">Get started</LinkButton>
        </div>
      </header>

      <section style={{ maxWidth: 780, margin: "60px auto 40px", textAlign: "center", padding: "0 24px" }}>
        <Pill tone="brass">Secure • Role-based • Modern</Pill>
        <h1 style={{ ...fontDisplay, fontSize: "clamp(32px,5vw,52px)", lineHeight: 1.1, margin: "20px 0" }}>
          Run your PG house<br />like a modern hotel
        </h1>
        <p style={{ fontSize: 17, color: C.inkSoft, maxWidth: 560, margin: "0 auto 28px", lineHeight: 1.6 }}>
          Manage properties, rooms, tenants, rent, complaints, and expenses from one clean
          portal — with separate dashboards for admins, managers, and residents.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <LinkButton variant="brass" href="#/auth">Create free account <ChevronRight size={16} /></LinkButton>
          <LinkButton variant="ghost" href="#/auth">Sign in</LinkButton>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: "40px auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
        {features.map((f, i) => (
          <Link key={i} href="#/auth">
            <KeyTag style={{ padding: "24px 20px 20px", cursor: "pointer" }}>
              <f.icon size={22} color={C.brassDark} style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {f.title} <ChevronRight size={15} color={C.brassDark} />
              </div>
              <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.5 }}>{f.desc}</div>
            </KeyTag>
          </Link>
        ))}
      </section>

      <footer style={{ textAlign: "center", padding: "40px 20px 24px", color: C.inkSoft, fontSize: 13 }}>
        © 2026 NestHaven
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------
   AUTH
----------------------------------------------------------------*/
function Auth({ onLogin }) {
  const [role, setRole] = useState("admin");
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState(seedTenants[0].id);

  return (
    <div style={{ minHeight: "100vh", background: C.linen, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <KeyTag style={{ width: 380, padding: "32px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <KeyRound size={20} color={C.brass} />
          <span style={{ ...fontDisplay, fontSize: 18, fontWeight: 700 }}>NestHaven</span>
        </div>
        <h2 style={{ ...fontDisplay, fontSize: 24, margin: "10px 0 20px" }}>Sign in</h2>

        <Field label="I am a...">
          <div style={{ display: "flex", gap: 8 }}>
            {["admin", "manager", "tenant"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer",
                  border: role === r ? `2px solid ${C.brass}` : `1px solid ${C.linenDark}`,
                  background: role === r ? "rgba(201,164,106,0.15)" : "#fff",
                  fontWeight: 600, fontSize: 13, textTransform: "capitalize", color: C.ink,
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </Field>

        {role !== "tenant" ? (
          <Field label="Your name">
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meera Iyer" />
          </Field>
        ) : (
          <Field label="Select your profile (demo)">
            <select style={inputStyle} value={tenantId} onChange={(e) => setTenantId(e.target.value)}>
              {seedTenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
        )}

        <Field label="Password">
          <input style={inputStyle} type="password" placeholder="••••••••" />
        </Field>

        <Button
          variant="primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
          onClick={() =>
            onLogin({
              role,
              name: role === "tenant" ? seedTenants.find((t) => t.id === tenantId).name : (name || "New User"),
              tenantId: role === "tenant" ? tenantId : null,
            })
          }
        >
          Sign in
        </Button>
        <Link href="#/" style={{ display: "block", textAlign: "center", color: C.inkSoft, marginTop: 14, cursor: "pointer", fontSize: 13 }}>
          ← Back to home
        </Link>
      </KeyTag>
    </div>
  );
}

/* ---------------------------------------------------------------
   APP SHELL / NAV
----------------------------------------------------------------*/
const NAV = {
  admin: [
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "properties", label: "Properties & Rooms", icon: Building2 },
    { key: "tenants", label: "Tenants", icon: Users },
    { key: "rent", label: "Rent & Payments", icon: Wallet },
    { key: "complaints", label: "Complaints", icon: MessageSquareWarning },
    { key: "reports", label: "Reports & Analytics", icon: BarChart3 },
  ],
  manager: [
    { key: "dashboard", label: "Dashboard", icon: Home },
    { key: "tenants", label: "Tenants", icon: Users },
    { key: "rent", label: "Rent & Payments", icon: Wallet },
    { key: "complaints", label: "Complaints", icon: MessageSquareWarning },
    { key: "reports", label: "Reports & Analytics", icon: BarChart3 },
  ],
  tenant: [
    { key: "dashboard", label: "My Room", icon: Home },
    { key: "rent", label: "My Rent", icon: Wallet },
    { key: "complaints", label: "My Complaints", icon: MessageSquareWarning },
  ],
};

function Shell({ user, onLogout, active, children }) {
  const items = NAV[user.role];
  return (
    <div style={{ minHeight: "100vh", background: C.linen, display: "flex" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 230, background: C.ink, color: C.linen, padding: "22px 16px",
          display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh",
        }}
        className="nh-sidebar"
      >
        <Link href="#/app/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 22px" }}>
          <KeyRound size={20} color={C.brass} />
          <span style={{ ...fontDisplay, fontSize: 18, fontWeight: 700 }}>NestHaven</span>
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {items.map((it) => (
            <NavLink key={it.key} href={`#/app/${it.key}`} active={active === it.key}>
              <it.icon size={17} /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(243,238,227,0.15)", paddingTop: 14, marginTop: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</div>
          <Pill tone="brass">{user.role}</Pill>
          <Link
            href="#/"
            onClick={onLogout}
            style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 13, opacity: 0.75 }}
          >
            <LogOut size={15} /> Log out
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
      <h2 style={{ ...fontDisplay, fontSize: 26, margin: 0, color: C.ink }}>{children}</h2>
      {action}
    </div>
  );
}

/* ---------------------------------------------------------------
   DASHBOARD (overview per role)
----------------------------------------------------------------*/
function Dashboard({ user, rooms, tenants, rentRecords, complaints }) {
  if (user.role === "tenant") {
    const t = tenants.find((x) => x.id === user.tenantId);
    const room = rooms.find((r) => r.id === t.roomId);
    const myRent = rentRecords.filter((r) => r.tenantId === t.id);
    const dueCount = myRent.filter((r) => r.status !== "paid").length;
    return (
      <div>
        <SectionTitle>Welcome back, {t.name.split(" ")[0]}</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          <KeyTag style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>ROOM</div>
            <div style={{ ...fontMono, fontSize: 26, marginTop: 6 }}>{room.number}</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>{room.type} occupancy</div>
          </KeyTag>
          <Link href="#/app/rent">
            <KeyTag style={{ padding: 20, cursor: "pointer" }}>
              <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>MONTHLY RENT</div>
              <div style={{ ...fontMono, fontSize: 26, marginTop: 6 }}>₹{room.rent.toLocaleString()}</div>
              <Pill tone={dueCount ? "clay" : "sage"}>{dueCount ? `${dueCount} month(s) due` : "All caught up"}</Pill>
            </KeyTag>
          </Link>
          <Link href="#/app/complaints">
            <KeyTag style={{ padding: 20, cursor: "pointer" }}>
              <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>MY COMPLAINTS</div>
              <div style={{ ...fontMono, fontSize: 26, marginTop: 6 }}>{complaints.filter((c) => c.tenantId === t.id).length}</div>
              <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>total raised</div>
            </KeyTag>
          </Link>
        </div>
      </div>
    );
  }

  const occupied = rooms.reduce((n, r) => n + tenants.filter((t) => t.roomId === r.id && t.status === "active").length, 0);
  const capacity = rooms.reduce((n, r) => n + r.capacity, 0);
  const revenue = rentRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const openComplaints = complaints.filter((c) => c.status !== "resolved").length;

  const stats = [
    { label: "Occupancy", value: `${occupied}/${capacity}`, sub: "beds filled", tone: "brass", href: user.role === "admin" ? "#/app/properties" : "#/app/tenants" },
    { label: "Active Tenants", value: tenants.filter((t) => t.status === "active").length, sub: "residents", tone: "sage", href: "#/app/tenants" },
    { label: "Rent Collected", value: `₹${revenue.toLocaleString()}`, sub: "this cycle", tone: "sage", href: "#/app/rent" },
    { label: "Open Complaints", value: openComplaints, sub: "need attention", tone: openComplaints ? "clay" : "sage", href: "#/app/complaints" },
  ];

  return (
    <div>
      <SectionTitle>Dashboard</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <Link key={i} href={s.href}>
            <KeyTag style={{ padding: 20, cursor: "pointer" }}>
              <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>{s.label.toUpperCase()}</div>
              <div style={{ ...fontMono, fontSize: 26, margin: "6px 0" }}>{s.value}</div>
              <Pill tone={s.tone}>{s.sub}</Pill>
            </KeyTag>
          </Link>
        ))}
      </div>
      <KeyTag style={{ padding: "20px 20px 8px" }}>
        <Link href="#/app/complaints">
          <div style={{ fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            Recent complaints <ChevronRight size={15} color={C.brassDark} />
          </div>
        </Link>
        {complaints.slice(0, 4).map((c) => {
          const t = tenants.find((x) => x.id === c.tenantId);
          return (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${C.linenDark}` }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: C.inkSoft }}>{t?.name} · {c.createdAt}</div>
              </div>
              <Pill tone={c.status === "resolved" ? "sage" : c.status === "in-progress" ? "brass" : "clay"}>{c.status}</Pill>
            </div>
          );
        })}
      </KeyTag>
    </div>
  );
}

/* ---------------------------------------------------------------
   PROPERTIES & ROOMS
----------------------------------------------------------------*/
function PropertiesView({ properties, setProperties, rooms, setRooms, tenants }) {
  const [showAddProp, setShowAddProp] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(null); // propertyId
  const [newProp, setNewProp] = useState({ name: "", address: "" });
  const [newRoom, setNewRoom] = useState({ number: "", type: "Single", capacity: 1, rent: "" });

  function addProperty() {
    if (!newProp.name) return;
    setProperties([...properties, { id: "p" + Date.now(), ...newProp }]);
    setNewProp({ name: "", address: "" });
    setShowAddProp(false);
  }
  function addRoom(propertyId) {
    if (!newRoom.number || !newRoom.rent) return;
    setRooms([...rooms, { id: "r" + Date.now(), propertyId, ...newRoom, capacity: Number(newRoom.capacity), rent: Number(newRoom.rent) }]);
    setNewRoom({ number: "", type: "Single", capacity: 1, rent: "" });
    setShowAddRoom(null);
  }

  return (
    <div>
      <SectionTitle action={<Button variant="brass" onClick={() => setShowAddProp(true)}><Plus size={16} /> Add property</Button>}>
        Properties & Rooms
      </SectionTitle>

      {properties.map((p) => {
        const propRooms = rooms.filter((r) => r.propertyId === p.id);
        return (
          <div key={p.id} style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: C.inkSoft }}>{p.address}</div>
              </div>
              <Button variant="ghost" onClick={() => setShowAddRoom(p.id)}><Plus size={15} /> Add room</Button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
              {propRooms.map((r) => {
                const occ = tenants.filter((t) => t.roomId === r.id && t.status === "active").length;
                const full = occ >= r.capacity;
                return (
                  <KeyTag key={r.id} style={{ padding: "18px 16px" }}>
                    <div style={{ ...fontMono, fontSize: 20 }}>{r.number}</div>
                    <div style={{ fontSize: 13, color: C.inkSoft, margin: "4px 0 8px" }}>{r.type} · ₹{r.rent.toLocaleString()}/mo</div>
                    <Pill tone={full ? "clay" : occ > 0 ? "brass" : "sage"}>
                      {occ}/{r.capacity} occupied
                    </Pill>
                  </KeyTag>
                );
              })}
              {propRooms.length === 0 && <div style={{ color: C.inkSoft, fontSize: 14 }}>No rooms yet.</div>}
            </div>
          </div>
        );
      })}

      {showAddProp && (
        <Modal title="Add property" onClose={() => setShowAddProp(false)}>
          <Field label="Property name"><input style={inputStyle} value={newProp.name} onChange={(e) => setNewProp({ ...newProp, name: e.target.value })} /></Field>
          <Field label="Address"><input style={inputStyle} value={newProp.address} onChange={(e) => setNewProp({ ...newProp, address: e.target.value })} /></Field>
          <Button variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={addProperty}>Save property</Button>
        </Modal>
      )}

      {showAddRoom && (
        <Modal title="Add room" onClose={() => setShowAddRoom(null)}>
          <Field label="Room number"><input style={inputStyle} value={newRoom.number} onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })} /></Field>
          <Field label="Type">
            <select style={inputStyle} value={newRoom.type} onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}>
              <option>Single</option><option>Double</option><option>Triple</option>
            </select>
          </Field>
          <Field label="Capacity"><input type="number" min="1" style={inputStyle} value={newRoom.capacity} onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })} /></Field>
          <Field label="Monthly rent (₹)"><input type="number" style={inputStyle} value={newRoom.rent} onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })} /></Field>
          <Button variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => addRoom(showAddRoom)}>Save room</Button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   TENANTS
----------------------------------------------------------------*/
function TenantsView({ tenants, setTenants, rooms, canEdit }) {
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", roomId: rooms[0]?.id || "", idType: "Aadhaar", idNumber: "", emergency: "", moveIn: "" });

  function addTenant() {
    if (!form.name || !form.roomId) return;
    setTenants([...tenants, { id: "t" + Date.now(), ...form, status: "active" }]);
    setForm({ name: "", phone: "", email: "", roomId: rooms[0]?.id || "", idType: "Aadhaar", idNumber: "", emergency: "", moveIn: "" });
    setShowAdd(false);
  }
  function moveOut(id) {
    setTenants(tenants.map((t) => (t.id === id ? { ...t, status: "moved-out" } : t)));
    setDetail(null);
  }

  return (
    <div>
      <SectionTitle action={canEdit && <Button variant="brass" onClick={() => setShowAdd(true)}><Plus size={16} /> Add tenant</Button>}>
        Tenants
      </SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
        {tenants.map((t) => {
          const room = rooms.find((r) => r.id === t.roomId);
          return (
            <KeyTag key={t.id} style={{ padding: "18px 16px", cursor: "pointer" }}>
              <div onClick={() => setDetail(t)}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                  <Pill tone={t.status === "active" ? "sage" : "ink"}>{t.status}</Pill>
                </div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>Room {room?.number} · {room?.type}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}><Phone size={12} /> {t.phone}</div>
              </div>
            </KeyTag>
          );
        })}
      </div>

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          <div style={{ fontSize: 14, lineHeight: 1.9 }}>
            <div><b>Phone:</b> {detail.phone}</div>
            <div><b>Email:</b> {detail.email}</div>
            <div><b>ID:</b> {detail.idType} · {detail.idNumber}</div>
            <div><b>Emergency contact:</b> {detail.emergency}</div>
            <div><b>Move-in date:</b> {detail.moveIn}</div>
            <div><b>Room:</b> {rooms.find((r) => r.id === detail.roomId)?.number}</div>
            <div><b>Status:</b> <Pill tone={detail.status === "active" ? "sage" : "ink"}>{detail.status}</Pill></div>
          </div>
          {canEdit && detail.status === "active" && (
            <Button variant="danger" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={() => moveOut(detail.id)}>
              <DoorOpen size={16} /> Mark as moved out
            </Button>
          )}
        </Modal>
      )}

      {showAdd && (
        <Modal title="Add tenant" onClose={() => setShowAdd(false)}>
          <Field label="Full name"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Assign room">
            <select style={inputStyle} value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.number} ({r.type})</option>)}
            </select>
          </Field>
          <Field label="ID type">
            <select style={inputStyle} value={form.idType} onChange={(e) => setForm({ ...form, idType: e.target.value })}>
              <option>Aadhaar</option><option>Passport</option><option>Driving Licence</option>
            </select>
          </Field>
          <Field label="ID number"><input style={inputStyle} value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} /></Field>
          <Field label="Emergency contact"><input style={inputStyle} value={form.emergency} onChange={(e) => setForm({ ...form, emergency: e.target.value })} /></Field>
          <Field label="Move-in date"><input type="date" style={inputStyle} value={form.moveIn} onChange={(e) => setForm({ ...form, moveIn: e.target.value })} /></Field>
          <Button variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={addTenant}>Save tenant</Button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   RENT & PAYMENTS
----------------------------------------------------------------*/
function RentView({ user, tenants, rentRecords, setRentRecords }) {
  const isTenant = user.role === "tenant";
  const myTenantId = user.tenantId;
  const [genMonth, setGenMonth] = useState("August");

  const visibleTenants = isTenant ? tenants.filter((t) => t.id === myTenantId) : tenants;

  function recordPayment(id) {
    setRentRecords(rentRecords.map((r) => (r.id === id ? { ...r, status: "paid" } : r)));
  }
  function generateRent() {
    const newRows = tenants
      .filter((t) => t.status === "active" && !rentRecords.some((r) => r.tenantId === t.id && r.month === genMonth))
      .map((t) => {
        const room = seedRooms.concat().find((r) => r.id === t.roomId);
        return { id: "rent" + Date.now() + t.id, tenantId: t.id, month: genMonth, amount: room ? room.rent : 0, status: "due" };
      });
    setRentRecords([...rentRecords, ...newRows]);
  }

  const toneFor = (s) => (s === "paid" ? "sage" : s === "overdue" ? "clay" : "brass");

  return (
    <div>
      <SectionTitle
        action={!isTenant && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select style={{ ...inputStyle, width: 140 }} value={genMonth} onChange={(e) => setGenMonth(e.target.value)}>
              {["August", "September", "October"].map((m) => <option key={m}>{m}</option>)}
            </select>
            <Button variant="brass" onClick={generateRent}><Plus size={16} /> Generate rent</Button>
          </div>
        )}
      >
        {isTenant ? "My Rent" : "Rent & Payments"}
      </SectionTitle>

      {visibleTenants.map((t) => {
        const rows = rentRecords.filter((r) => r.tenantId === t.id);
        return (
          <KeyTag key={t.id} style={{ padding: "16px 18px", marginBottom: 14 }}>
            {!isTenant && <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.name}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
              {rows.map((r) => (
                <div key={r.id} style={{ border: `1px solid ${C.linenDark}`, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>{r.month.toUpperCase()}</div>
                  <div style={{ ...fontMono, fontSize: 17, margin: "4px 0" }}>₹{r.amount.toLocaleString()}</div>
                  <Pill tone={toneFor(r.status)}>{r.status}</Pill>
                  {!isTenant && r.status !== "paid" && (
                    <Button variant="subtle" style={{ marginTop: 8, width: "100%", justifyContent: "center", padding: "6px 0", fontSize: 12 }} onClick={() => recordPayment(r.id)}>
                      <Check size={13} /> Record payment
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </KeyTag>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------
   COMPLAINTS
----------------------------------------------------------------*/
function ComplaintsView({ user, tenants, complaints, setComplaints }) {
  const isTenant = user.role === "tenant";
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [responding, setResponding] = useState(null);
  const [responseText, setResponseText] = useState("");

  const visible = isTenant ? complaints.filter((c) => c.tenantId === user.tenantId) : complaints;

  function raise() {
    if (!form.title) return;
    setComplaints([{ id: "c" + Date.now(), tenantId: user.tenantId, title: form.title, description: form.description, status: "open", response: "", createdAt: new Date().toISOString().slice(0, 10) }, ...complaints]);
    setForm({ title: "", description: "" });
    setShowNew(false);
  }
  function updateStatus(id, status) {
    setComplaints(complaints.map((c) => (c.id === id ? { ...c, status } : c)));
  }
  function sendResponse(id) {
    setComplaints(complaints.map((c) => (c.id === id ? { ...c, response: responseText, status: "in-progress" } : c)));
    setResponding(null);
    setResponseText("");
  }

  return (
    <div>
      <SectionTitle action={isTenant && <Button variant="brass" onClick={() => setShowNew(true)}><Plus size={16} /> Raise complaint</Button>}>
        {isTenant ? "My Complaints" : "Complaints"}
      </SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.length === 0 && <div style={{ color: C.inkSoft }}>No complaints yet.</div>}
        {visible.map((c) => {
          const t = tenants.find((x) => x.id === c.tenantId);
          return (
            <KeyTag key={c.id} style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  {!isTenant && <div style={{ fontSize: 12, color: C.inkSoft }}>{t?.name} · {c.createdAt}</div>}
                  <div style={{ fontSize: 14, marginTop: 6, color: C.inkSoft }}>{c.description}</div>
                  {c.response && (
                    <div style={{ fontSize: 13, marginTop: 8, background: C.linenDark, padding: "8px 10px", borderRadius: 8 }}>
                      <b>Response:</b> {c.response}
                    </div>
                  )}
                </div>
                <Pill tone={c.status === "resolved" ? "sage" : c.status === "in-progress" ? "brass" : "clay"}>{c.status}</Pill>
              </div>
              {!isTenant && c.status !== "resolved" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <Button variant="ghost" onClick={() => setResponding(c.id)}>Respond</Button>
                  <Button variant="subtle" onClick={() => updateStatus(c.id, "resolved")}><Check size={14} /> Mark resolved</Button>
                </div>
              )}
            </KeyTag>
          );
        })}
      </div>

      {showNew && (
        <Modal title="Raise a complaint" onClose={() => setShowNew(false)}>
          <Field label="Title"><input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Description">
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Button variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={raise}>Submit complaint</Button>
        </Modal>
      )}

      {responding && (
        <Modal title="Respond to complaint" onClose={() => setResponding(null)}>
          <Field label="Response">
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={responseText} onChange={(e) => setResponseText(e.target.value)} />
          </Field>
          <Button variant="primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => sendResponse(responding)}>Send response</Button>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   REPORTS & ANALYTICS
----------------------------------------------------------------*/
function ReportsView({ rooms, tenants, rentRecords }) {
  const revenueByMonth = months.map((m) => ({
    month: m.slice(0, 3),
    revenue: rentRecords.filter((r) => r.month === m && r.status === "paid").reduce((s, r) => s + r.amount, 0),
  }));

  const occupied = rooms.reduce((n, r) => n + tenants.filter((t) => t.roomId === r.id && t.status === "active").length, 0);
  const capacity = rooms.reduce((n, r) => n + r.capacity, 0);
  const occupancyData = [
    { name: "Occupied", value: occupied },
    { name: "Vacant", value: Math.max(capacity - occupied, 0) },
  ];
  const pieColors = [C.sage, C.linenDark];

  const expenseTrend = months.map((m, i) => ({ month: m.slice(0, 3), expenses: 8000 + i * 1200 + (i % 2 === 0 ? 900 : 0) }));

  return (
    <div>
      <SectionTitle>Reports & Analytics</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
        <KeyTag style={{ padding: "18px 18px 10px" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Revenue by month</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={C.inkSoft} />
              <YAxis tick={{ fontSize: 12 }} stroke={C.inkSoft} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill={C.brass} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </KeyTag>

        <KeyTag style={{ padding: "18px 18px 10px" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Occupancy</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={occupancyData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {occupancyData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </KeyTag>

        <KeyTag style={{ padding: "18px 18px 10px", gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Expense trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={expenseTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={C.inkSoft} />
              <YAxis tick={{ fontSize: 12 }} stroke={C.inkSoft} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="expenses" stroke={C.clay} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </KeyTag>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
----------------------------------------------------------------*/
export default function NestHavenApp() {
  const route = useHashRoute(); // e.g. "/", "/auth", "/app/tenants"
  const [user, setUser] = useState(null);

  const [properties, setProperties] = useState(seedProperties);
  const [rooms, setRooms] = useState(seedRooms);
  const [tenants, setTenants] = useState(seedTenants);
  const [rentRecords, setRentRecords] = useState(seedRent());
  const [complaints, setComplaints] = useState(seedComplaints);

  const isAppRoute = route.startsWith("/app/");
  const active = isAppRoute ? route.replace("/app/", "") : "dashboard";

  // Not signed in but trying to hit an app page directly (e.g. pasted URL)
  // sends them to sign in first, same as any real app would.
  useEffect(() => {
    if (isAppRoute && !user) {
      window.location.hash = "#/auth";
    }
  }, [isAppRoute, user]);

  if (isAppRoute && !user) return null;

  if (route === "/auth") {
    return (
      <Auth
        onLogin={(u) => {
          setUser(u);
          window.location.hash = "#/app/dashboard";
        }}
      />
    );
  }

  if (isAppRoute && user) {
    const canEdit = user.role === "admin" || user.role === "manager";
    return (
      <Shell
        user={user}
        active={active}
        onLogout={(e) => {
          e.preventDefault();
          setUser(null);
          window.location.hash = "#/";
        }}
      >
        {active === "dashboard" && <Dashboard user={user} rooms={rooms} tenants={tenants} rentRecords={rentRecords} complaints={complaints} />}
        {active === "properties" && user.role === "admin" && (
          <PropertiesView properties={properties} setProperties={setProperties} rooms={rooms} setRooms={setRooms} tenants={tenants} />
        )}
        {active === "tenants" && <TenantsView tenants={tenants} setTenants={setTenants} rooms={rooms} canEdit={canEdit} />}
        {active === "rent" && <RentView user={user} tenants={tenants} rentRecords={rentRecords} setRentRecords={setRentRecords} />}
        {active === "complaints" && <ComplaintsView user={user} tenants={tenants} complaints={complaints} setComplaints={setComplaints} />}
        {active === "reports" && <ReportsView rooms={rooms} tenants={tenants} rentRecords={rentRecords} />}
      </Shell>
    );
  }

  // default: "/" landing page
  return <Landing />;
}

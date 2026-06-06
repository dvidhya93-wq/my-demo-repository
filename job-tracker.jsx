import { useState, useEffect, useRef } from "react";

const STAGES = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"];

const WORK_MODES = ["Remote", "Hybrid", "On-site", "Unspecified"];

const MODE_COLORS = {
  Remote:      { bg: "#e4f5ec", text: "#1a5a38", border: "#90d4b0", dot: "#28a060" },
  Hybrid:      { bg: "#e8f0fb", text: "#2a4a7a", border: "#b8cef0", dot: "#4a7ac8" },
  "On-site":   { bg: "#fdf3e0", text: "#6b4b10", border: "#f0d898", dot: "#d4960a" },
  Unspecified: { bg: "#f0f0ec", text: "#4a4a42", border: "#d8d8d0", dot: "#b0afa8" },
};

const STAGE_COLORS = {
  Saved:     { bg: "#f0f0ec", text: "#4a4a42", border: "#d8d8d0", dot: "#b0afa8" },
  Applied:   { bg: "#e8f0fb", text: "#2a4a7a", border: "#b8cef0", dot: "#4a7ac8" },
  Screening: { bg: "#fdf3e0", text: "#6b4b10", border: "#f0d898", dot: "#d4960a" },
  Interview: { bg: "#e8f6ee", text: "#1a5a38", border: "#90d4b0", dot: "#28a060" },
  Offer:     { bg: "#f0eafd", text: "#4a1a8a", border: "#c8a8f0", dot: "#8040d0" },
  Rejected:  { bg: "#fce8e8", text: "#7a2020", border: "#f0a8a8", dot: "#c83030" },
};

const SAMPLE_JOBS = [
  { id: 1, title: "Senior Technical Writer", company: "Salesforce", location: "Remote", workMode: "Remote", stage: "Saved", note: "LinkedIn saved — direct nudge to apply", date: "2026-06-05", url: "" },
  { id: 2, title: "Senior Technical Content Designer", company: "Autodesk", location: "Remote", workMode: "Remote", stage: "Saved", note: "Platform documentation team", date: "2026-06-06", url: "" },
  { id: 3, title: "Senior Technical Writer", company: "Okta", location: "Remote", workMode: "Remote", stage: "Saved", note: "Secure identity focus", date: "2026-06-05", url: "" },
  { id: 4, title: "Remote Technical Content Writer", company: "Turing", location: "Remote", workMode: "Remote", stage: "Saved", note: "", date: "2026-06-06", url: "" },
  { id: 5, title: "Lead Technical Writer", company: "Quest Global", location: "", workMode: "Unspecified", stage: "Saved", note: "", date: "2026-06-05", url: "" },
];

const STORAGE_KEY = "job_tracker_v2";

function genId() { return Date.now() + Math.random(); }

function Pill({ stage }) {
  const c = STAGE_COLORS[stage] || STAGE_COLORS.Saved;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.03em", whiteSpace: "nowrap"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {stage}
    </span>
  );
}

function ModeBadge({ mode }) {
  const m = mode || "Unspecified";
  const c = MODE_COLORS[m] || MODE_COLORS.Unspecified;
  const icons = { Remote: "🌐", Hybrid: "🏢", "On-site": "📍", Unspecified: "·" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.02em", whiteSpace: "nowrap"
    }}>
      <span style={{ fontSize: 10 }}>{icons[m]}</span>
      {m}
    </span>
  );
}

function Modal({ job, onClose, onSave, onDelete }) {
  const defaultForm = { title: "", company: "", location: "", workMode: "Remote", stage: "Saved", note: "", date: new Date().toISOString().slice(0, 10), url: "" };
  const [form, setForm] = useState(job ? { workMode: "Unspecified", ...job } : defaultForm);
  const ref = useRef();

  useEffect(() => { ref.current?.focus(); }, []);
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,8,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#faf9f6", borderRadius: 16, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1a1a16", fontFamily: "'Playfair Display', Georgia, serif" }}>
            {job?.id ? "Edit role" : "Add role"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#888", lineHeight: 1, padding: 2 }}>×</button>
        </div>

        <div style={{ padding: "20px 28px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Job title", "title", "text"], ["Company", "company", "text"], ["City / country (optional)", "location", "text"], ["Link / URL", "url", "url"]].map(([label, key, type]) => (
            <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {label}
              <input ref={key === "title" ? ref : undefined} type={type} value={form[key]} onChange={e => set(key, e.target.value)}
                style={{ fontSize: 14, padding: "9px 12px", border: "1.5px solid #e0dfd8", borderRadius: 8, background: "#fff", color: "#1a1a16", outline: "none", fontFamily: "inherit" }}
                onFocus={e => e.target.style.borderColor = "#8a7a5a"}
                onBlur={e => e.target.style.borderColor = "#e0dfd8"} />
            </label>
          ))}

          {/* Work mode selector — prominent */}
          <label style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Work mode
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {WORK_MODES.map(m => {
                const c = MODE_COLORS[m];
                const active = form.workMode === m;
                return (
                  <button key={m} type="button" onClick={() => set("workMode", m)} style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    background: active ? c.bg : "#f5f4f0",
                    color: active ? c.text : "#888",
                    border: active ? `2px solid ${c.border}` : "2px solid transparent",
                    transition: "all 0.12s"
                  }}>
                    {{ Remote: "🌐", Hybrid: "🏢", "On-site": "📍", Unspecified: "·" }[m]} {m}
                  </button>
                );
              })}
            </div>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Stage
              <select value={form.stage} onChange={e => set("stage", e.target.value)}
                style={{ fontSize: 14, padding: "9px 12px", border: "1.5px solid #e0dfd8", borderRadius: 8, background: "#fff", color: "#1a1a16", outline: "none", fontFamily: "inherit" }}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Date saved
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                style={{ fontSize: 14, padding: "9px 12px", border: "1.5px solid #e0dfd8", borderRadius: 8, background: "#fff", color: "#1a1a16", outline: "none", fontFamily: "inherit" }} />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, fontWeight: 600, color: "#666", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Notes
            <textarea value={form.note} onChange={e => set("note", e.target.value)} rows={3}
              style={{ fontSize: 14, padding: "9px 12px", border: "1.5px solid #e0dfd8", borderRadius: 8, background: "#fff", color: "#1a1a16", outline: "none", resize: "vertical", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "#8a7a5a"}
              onBlur={e => e.target.style.borderColor = "#e0dfd8"} />
          </label>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <div>
              {job?.id && <button onClick={() => onDelete(job.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#c04040", fontSize: 13, padding: 0, textDecoration: "underline" }}>
                Remove role
              </button>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #d8d7d0", background: "none", cursor: "pointer", fontSize: 13, color: "#555", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={() => onSave(form)} disabled={!form.title || !form.company}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: form.title && form.company ? "#2a2a22" : "#bbb", color: "#fff", cursor: form.title && form.company ? "pointer" : "default", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onClick }) {
  const daysAgo = Math.floor((Date.now() - new Date(job.date)) / 86400000);
  return (
    <div onClick={() => onClick(job)} style={{
      background: "#fff", border: "1.5px solid #e8e7e0", borderRadius: 12, padding: "14px 16px",
      cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s",
      display: "flex", flexDirection: "column", gap: 8
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1a16", lineHeight: 1.3, fontFamily: "'Playfair Display', Georgia, serif" }}>{job.title}</p>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "#555", fontWeight: 500 }}>{job.company}</p>
        </div>
        <Pill stage={job.stage} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <ModeBadge mode={job.workMode || "Unspecified"} />
        {job.location && <span style={{ fontSize: 12, color: "#999" }}>{job.location}</span>}
      </div>

      {job.note && <p style={{ margin: 0, fontSize: 12, color: "#777", fontStyle: "italic", borderLeft: "2px solid #e0dfd0", paddingLeft: 8, lineHeight: 1.5 }}>{job.note}</p>}

      <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>
        {daysAgo === 0 ? "Added today" : daysAgo === 1 ? "Added yesterday" : `Added ${daysAgo} days ago`}
      </p>
    </div>
  );
}

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null);
  const [stageFilter, setStageFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("Remote");
  const [search, setSearch] = useState("");
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) {
          const parsed = JSON.parse(result.value);
          setJobs(parsed.jobs || []);
          setSeeded(parsed.seeded || false);
          return;
        }
        // Try migrating from old key
        const old = await window.storage.get("job_tracker_v1");
        if (old?.value) {
          const parsed = JSON.parse(old.value);
          const migrated = (parsed.jobs || []).map(j => ({ workMode: j.location?.toLowerCase().includes("remote") ? "Remote" : "Unspecified", ...j }));
          setJobs(migrated);
          setSeeded(parsed.seeded || false);
        }
      } catch {}
      setLoaded(true);
    }
    load();
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (jobs.length === 0 && !seeded) {
      setJobs(SAMPLE_JOBS.map(j => ({ ...j, id: genId() })));
      setSeeded(true);
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEY, JSON.stringify({ jobs, seeded: true })).catch(() => {});
  }, [jobs, loaded]);

  function saveJob(form) {
    if (modal?.id) {
      setJobs(js => js.map(j => j.id === modal.id ? { ...form, id: modal.id } : j));
    } else {
      setJobs(js => [{ ...form, id: genId() }, ...js]);
    }
    setModal(null);
  }

  function deleteJob(id) {
    setJobs(js => js.filter(j => j.id !== id));
    setModal(null);
  }

  const counts = {};
  STAGES.forEach(s => { counts[s] = jobs.filter(j => j.stage === s).length; });
  const modeCounts = {};
  WORK_MODES.forEach(m => { modeCounts[m] = jobs.filter(j => (j.workMode || "Unspecified") === m).length; });
  const total = jobs.length;

  const visible = jobs.filter(j => {
    const matchStage = stageFilter === "All" || j.stage === stageFilter;
    const matchMode = modeFilter === "All" || (j.workMode || "Unspecified") === modeFilter;
    const matchSearch = !search || `${j.title} ${j.company}`.toLowerCase().includes(search.toLowerCase());
    return matchStage && matchMode && matchSearch;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const remoteCount = modeCounts["Remote"] || 0;
  const nonRemoteCount = (modeCounts["Hybrid"] || 0) + (modeCounts["On-site"] || 0);

  if (!loaded) return <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>Loading…</div>;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

        {/* Header */}
        <div style={{ background: "#1a1a14", padding: "28px 32px 24px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#f5f4f0", fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
                  Job tracker
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>{total} role{total !== 1 ? "s" : ""} tracked · {remoteCount} remote</p>
              </div>
              <button onClick={() => setModal("new")}
                style={{ background: "#d4b870", color: "#1a1a14", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "inherit" }}>
                + Add role
              </button>
            </div>

            {/* Work mode filter — top row, prominent */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {["All", ...WORK_MODES].map(m => {
                const active = modeFilter === m;
                const c = m === "All" ? null : MODE_COLORS[m];
                const cnt = m === "All" ? total : modeCounts[m];
                const icons = { All: "◈", Remote: "🌐", Hybrid: "🏢", "On-site": "📍", Unspecified: "·" };
                return (
                  <button key={m} onClick={() => setModeFilter(m)} style={{
                    background: active ? (m === "All" ? "#d4b870" : c.bg) : "rgba(255,255,255,0.08)",
                    color: active ? (m === "All" ? "#1a1a14" : c.text) : "#aaa",
                    border: active && m !== "All" ? `1.5px solid ${c.border}` : "1.5px solid transparent",
                    borderRadius: 8, padding: "6px 13px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 5
                  }}>
                    <span>{icons[m]}</span>
                    {m}
                    {cnt > 0 && <span style={{ opacity: 0.65, fontWeight: 500 }}>({cnt})</span>}
                  </button>
                );
              })}
            </div>

            {/* Stage filter pills */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["All", ...STAGES].map(s => {
                const active = stageFilter === s;
                const c = s === "All" ? null : STAGE_COLORS[s];
                const cnt = s === "All" ? total : counts[s];
                return (
                  <button key={s} onClick={() => setStageFilter(s)} style={{
                    background: active ? (s === "All" ? "rgba(255,255,255,0.18)" : c.bg) : "transparent",
                    color: active ? (s === "All" ? "#f5f4f0" : c.text) : "#666",
                    border: active && s !== "All" ? `1px solid ${c.border}` : "1px solid transparent",
                    borderRadius: 20, padding: "4px 11px", fontSize: 11, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit"
                  }}>
                    {s} {cnt > 0 && <span style={{ opacity: 0.7 }}>({cnt})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 32px 40px" }}>

          {/* Funnel summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 24 }}>
            {STAGES.slice(0, 5).map(s => {
              const c = STAGE_COLORS[s];
              const modeFiltered = modeFilter === "All" ? counts[s] : jobs.filter(j => j.stage === s && (j.workMode || "Unspecified") === modeFilter).length;
              return (
                <div key={s} onClick={() => setStageFilter(s)} style={{
                  background: "#fff", border: `1.5px solid ${c.border}`, borderRadius: 10, padding: "12px 14px",
                  cursor: "pointer", transition: "transform 0.12s"
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: c.text, fontFamily: "'Playfair Display', Georgia, serif" }}>{modeFiltered}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: c.dot, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s}</p>
                  {modeFilter !== "All" && <p style={{ margin: "2px 0 0", fontSize: 10, color: "#bbb" }}>{modeFilter} only</p>}
                </div>
              );
            })}
          </div>

          {/* Active filter banner */}
          {modeFilter !== "All" && (
            <div style={{ background: MODE_COLORS[modeFilter]?.bg, border: `1.5px solid ${MODE_COLORS[modeFilter]?.border}`, borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: MODE_COLORS[modeFilter]?.text }}>
                Showing {modeFilter} roles only · {visible.length} match{visible.length !== 1 ? "es" : ""}
              </p>
              <button onClick={() => setModeFilter("All")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: MODE_COLORS[modeFilter]?.text, textDecoration: "underline", fontFamily: "inherit" }}>
                Show all
              </button>
            </div>
          )}

          {/* Search */}
          <div style={{ marginBottom: 20 }}>
            <input placeholder="Search by role or company…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 16px", border: "1.5px solid #e0dfd8", borderRadius: 10, fontSize: 14, background: "#fff", color: "#1a1a16", outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = "#8a7a5a"}
              onBlur={e => e.target.style.borderColor = "#e0dfd8"} />
          </div>

          {/* Cards */}
          {visible.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
              <p style={{ fontSize: 32, margin: "0 0 12px" }}>○</p>
              <p style={{ fontSize: 14 }}>No roles match. Try adjusting the filters or add a new role.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {visible.map(job => <JobCard key={job.id} job={job} onClick={j => setModal(j)} />)}
            </div>
          )}

          {/* Nudge: Saved pileup */}
          {counts["Saved"] >= 3 && stageFilter !== "Applied" && (
            <div style={{ marginTop: 24, background: "#fffbec", border: "1.5px solid #f0d898", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#6b4b10" }}>
                  {counts["Saved"]} roles still saved — none applied yet
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "#8a6820" }}>
                  Pick one today. Even a rough application beats a perfect plan.
                </p>
              </div>
              <button onClick={() => { setStageFilter("Saved"); setModeFilter("Remote"); }}
                style={{ background: "#d4960a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                See remote + saved
              </button>
            </div>
          )}

          {/* Nudge: non-remote roles exist */}
          {nonRemoteCount > 0 && modeFilter === "All" && (
            <div style={{ marginTop: 14, background: "#f0f4fc", border: "1.5px solid #b8cef0", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#2a4a7a" }}>
                {nonRemoteCount} role{nonRemoteCount !== 1 ? "s are" : " is"} hybrid or on-site — you're focusing on remote only.
              </p>
              <button onClick={() => setModeFilter("Remote")}
                style={{ background: "#4a7ac8", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                Show remote only
              </button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          job={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveJob}
          onDelete={deleteJob}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomeClient({ entries, allAffirmations }: { entries: any[], allAffirmations: string[] }) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [affirmationsList, setAffirmationsList] = useState(allAffirmations);
  const [newAffirmationText, setNewAffirmationText] = useState("");
  const [addingAffirmation, setAddingAffirmation] = useState(false);

  const handleAddAffirmation = async () => {
    if (!newAffirmationText.trim()) return;
    setAddingAffirmation(true);
    try {
      const res = await fetch("/api/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newAffirmationText })
      });
      if (res.ok) {
        setAffirmationsList(prev => [...prev, newAffirmationText.trim()]);
        setNewAffirmationText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingAffirmation(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const entriesMap = new Map(entries.map(e => [e.date, e]));

  // Calendar generation for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 className="header-title" style={{ color: 'var(--ink)' }}>She already is.</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" style={{ borderColor: view === 'calendar' ? 'var(--gold)' : '', color: view === 'calendar' ? 'var(--gold)' : '' }} onClick={() => setView('calendar')}>Calendar</button>
          <button className="btn-ghost" style={{ borderColor: view === 'list' ? 'var(--gold)' : '', color: view === 'list' ? 'var(--gold)' : '' }} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <Link href={`/day/${todayStr}`} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '0.85rem' }}>
          {entriesMap.has(todayStr) ? "Continue today's ritual →" : "Start today's ritual →"}
        </Link>
      </div>

      {view === "calendar" ? (
        <div className="card" style={{ padding: '32px' }}>
          <h2 className="font-serif" style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.2rem', fontStyle: 'italic' }}>{monthName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{d}</div>
            ))}
            {days.map((day, i) => {
              if (!day) return <div key={i} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasEntry = entriesMap.has(dateStr);
              return (
                <Link key={i} href={`/day/${dateStr}`} style={{
                  textDecoration: 'none',
                  padding: '12px 0',
                  borderRadius: '2px',
                  background: hasEntry ? 'var(--gold-light)' : 'var(--fog)',
                  color: hasEntry ? 'var(--white)' : 'var(--ink)',
                  opacity: (dateStr > todayStr && !hasEntry) ? 0.3 : 1,
                  pointerEvents: (dateStr > todayStr && !hasEntry) ? 'none' : 'auto'
                }}>
                  {day}
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>No past entries yet.</div>
          ) : (
            entries.map((entry) => (
              <Link key={entry.date} href={`/day/${entry.date}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '20px 24px', transition: 'background 0.2s' }} 
                     onMouseOver={(e) => e.currentTarget.style.background = 'var(--warm)'}
                     onMouseOut={(e) => e.currentTarget.style.background = 'var(--white)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="font-serif" style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>
                      {new Date(entry.date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.05em' }}>
                      {JSON.parse(entry.actionsDone).length} actions
                    </div>
                  </div>
                  {entry.closingText && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '8px', fontStyle: 'italic' }}>
                      "{entry.closingText}"
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      <div className="section-label" style={{ marginTop: '40px' }}>Her Words (Master List)</div>
      <div className="card" style={{ background: "var(--fog)" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            className="input-field"
            placeholder="Add a new affirmation..."
            value={newAffirmationText}
            onChange={(e) => setNewAffirmationText(e.target.value)}
            style={{ flex: 1, borderBottomColor: "var(--muted)" }}
          />
          <button className="btn-primary" onClick={handleAddAffirmation} disabled={addingAffirmation}>
            {addingAffirmation ? "Adding..." : "Add"}
          </button>
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "10px" }}>
          {affirmationsList.map((aff, i) => (
            <div key={i} className="font-serif" style={{ fontSize: "1.1rem", padding: "16px", background: "var(--white)", borderRadius: "2px", borderLeft: "2px solid var(--gold)" }}>
              {aff}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

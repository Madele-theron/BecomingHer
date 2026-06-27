"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomeClient({ entries, affirmations }: { entries: any[], affirmations: any[] }) {
  const [view, setView] = useState<"calendar" | "list" | "affirmations">("calendar");
  const [affirmationsList, setAffirmationsList] = useState(affirmations);
  const [newAffirmationText, setNewAffirmationText] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [customCategory, setCustomCategory] = useState("");
  const [addingAffirmation, setAddingAffirmation] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = Array.from(new Set(affirmationsList.map(a => a.category).filter(Boolean)));

  const handleAddAffirmation = async () => {
    if (!newAffirmationText.trim()) return;
    
    const categoryToUse = newCategory === "Custom" ? customCategory.trim() : newCategory;
    if (!categoryToUse) return;

    setAddingAffirmation(true);
    try {
      const res = await fetch("/api/affirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newAffirmationText, category: categoryToUse })
      });
      if (res.ok) {
        const data = await res.json();
        setAffirmationsList(prev => [...prev, data.data]);
        setNewAffirmationText("");
        setCustomCategory("");
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

  const filteredAffirmations = selectedCategory === "All" 
    ? affirmationsList 
    : affirmationsList.filter(a => a.category === selectedCategory);

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 className="header-title" style={{ color: 'var(--ink)' }}>She already is.</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" style={{ borderColor: view === 'calendar' ? 'var(--gold)' : '', color: view === 'calendar' ? 'var(--gold)' : '' }} onClick={() => setView('calendar')}>Calendar</button>
          <button className="btn-ghost" style={{ borderColor: view === 'list' ? 'var(--gold)' : '', color: view === 'list' ? 'var(--gold)' : '' }} onClick={() => setView('list')}>List</button>
          <button className="btn-ghost" style={{ borderColor: view === 'affirmations' ? 'var(--gold)' : '', color: view === 'affirmations' ? 'var(--gold)' : '' }} onClick={() => setView('affirmations')}>Affirmations</button>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <Link href={`/day/${todayStr}`} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '0.85rem' }}>
          {entriesMap.has(todayStr) ? "Continue today's ritual →" : "Start today's ritual →"}
        </Link>
      </div>

      {view === "calendar" && (
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
      )}

      {view === "list" && (
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

      {view === "affirmations" && (
        <>
          <div className="card" style={{ background: "var(--fog)", marginBottom: "20px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "10px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Add a new affirmation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <input
                className="input-field"
                placeholder="The braver I am, the luckier I get..."
                value={newAffirmationText}
                onChange={(e) => setNewAffirmationText(e.target.value)}
                style={{ flex: 1, borderBottomColor: "var(--muted)" }}
              />
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <select 
                  className="input-field" 
                  style={{ flex: 1, padding: "10px", borderBottomColor: "var(--muted)", background: "transparent" }}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {categories.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                  <option value="Custom">+ Create New Category</option>
                </select>
                {newCategory === "Custom" && (
                  <input
                    className="input-field"
                    placeholder="New category name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{ flex: 1, borderBottomColor: "var(--muted)" }}
                  />
                )}
                <button className="btn-primary" onClick={handleAddAffirmation} disabled={addingAffirmation || !newAffirmationText.trim() || (newCategory === "Custom" && !customCategory.trim())}>
                  {addingAffirmation ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div className="section-label" style={{ margin: 0 }}>Her Words (Master List)</div>
            <select 
              className="input-field" 
              style={{ padding: "6px 12px", width: "auto", fontSize: "0.85rem", background: "var(--fog)", border: "none", borderRadius: "2px" }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredAffirmations.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>No affirmations found for this category.</div>
            ) : (
              filteredAffirmations.map((aff: any, i) => (
                <div key={aff.id || i} className="font-serif" style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "1.1rem", padding: "20px", background: "var(--white)", borderRadius: "2px", borderLeft: "2px solid var(--gold)" }}>
                  <div>{aff.text}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--gold)", letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>
                    {aff.category}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

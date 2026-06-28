"use client";

import { useState, useEffect } from "react";
import { IDENTITY_QUESTIONS, OTHERS_PROMPTS, DAILY_ACTIONS, GESTURES } from "@/lib/constants";
import ThemeToggle from "./ThemeToggle";

export default function DailyRitualClient({ date, initialData, allAffirmations }: { date: string, initialData: any, allAffirmations: { text: string, category: string }[] }) {
  const [affirmationsList, setAffirmationsList] = useState(allAffirmations);
  
  const [data, setData] = useState({
    affirmationIndex: 0,
    pinnedAffirmation: "",
    readCount: 0,
    questionIndex: 0,
    identityAnswer: "",
    aiInsight: "",
    actionsDone: [] as number[],
    othersPerson: "",
    othersGesture: -1,
    othersOwn: "",
    othersHonest: "",
    eveningOthers: "",
    eveningWin: "",
    eveningGap: "",
    eveningTomorrow: "",
    closingText: "",
    ...initialData,
  });

  const [insightLoading, setInsightLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Initialize rotating indices based on date if not already set by initial data
  useEffect(() => {
    if (!initialData) {
      const dateObj = new Date(date);
      const dayIndex = dateObj.getDate();
      setData((prev: any) => ({
        ...prev,
        affirmationIndex: dayIndex % affirmationsList.length,
        questionIndex: (dayIndex + Math.floor(dayIndex / 7)) % IDENTITY_QUESTIONS.length,
      }));
    }
  }, [date, initialData]);

  const saveProgress = async (currentData: any, manual = false) => {
    if (manual) setIsSaving(true);
    try {
      await fetch(`/api/entries/${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentData,
          actionsDone: JSON.stringify(currentData.actionsDone),
          othersGesture: currentData.othersGesture.toString(),
          pinnedAffirmation: currentData.pinnedAffirmation,
        }),
      });
      if (manual) showToast("Progress saved");
    } catch (e) {
      if (manual) showToast("Error saving progress");
    } finally {
      if (manual) setIsSaving(false);
    }
  };

  // Auto-save debounced
  useEffect(() => {
    const handler = setTimeout(() => {
      saveProgress(data, false);
    }, 1000);
    return () => clearTimeout(handler);
  }, [data, date]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const update = (key: string, val: any) => setData((prev: any) => ({ ...prev, [key]: val }));

  const nextAffirmation = () => {
    if (data.pinnedAffirmation) return;
    update("affirmationIndex", (data.affirmationIndex + 1) % affirmationsList.length);
    update("readCount", data.readCount + 1);
  };

  const previousAffirmation = () => {
    if (data.pinnedAffirmation) return;
    update("affirmationIndex", (data.affirmationIndex - 1 + affirmationsList.length) % affirmationsList.length);
    update("readCount", data.readCount + 1);
  };

  const pinAffirmation = () => {
    if (data.pinnedAffirmation) {
      update("pinnedAffirmation", "");
    } else {
      update("pinnedAffirmation", affirmationsList[data.affirmationIndex].text);
    }
  };

  const readAloud = () => {
    const text = data.pinnedAffirmation || affirmationsList[data.affirmationIndex].text;
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.85;
      utt.pitch = 1.05;
      window.speechSynthesis.speak(utt);
      update("readCount", data.readCount + 1);
    } else {
      showToast("Read it out loud — your own voice is the most powerful.");
    }
  };

  const toggleAction = (i: number) => {
    const newActions = data.actionsDone.includes(i)
      ? data.actionsDone.filter((x: number) => x !== i)
      : [...data.actionsDone, i];
    update("actionsDone", newActions);
  };

  const getInsight = async () => {
    if (!data.identityAnswer.trim()) {
      showToast("Write your answer first.");
      return;
    }
    setInsightLoading(true);
    try {
      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: IDENTITY_QUESTIONS[data.questionIndex],
          answer: data.identityAnswer
        })
      });
      const resData = await res.json();
      if (resData.success) {
        update("aiInsight", resData.text);
      } else {
        showToast("Error getting insight.");
      }
    } catch (e) {
      showToast("Connection error.");
    } finally {
      setInsightLoading(false);
    }
  };

  const closeDay = async () => {
    if (!data.eveningWin && !data.eveningGap) {
      showToast("Fill in at least one evening field.");
      return;
    }
    setCloseLoading(true);
    try {
      const res = await fetch("/api/ai/close-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          others: data.eveningOthers,
          win: data.eveningWin,
          gap: data.eveningGap,
          tomorrow: data.eveningTomorrow,
        })
      });
      const resData = await res.json();
      if (resData.success) {
        update("closingText", resData.text);
        showToast("Day closed. Sleep well, Madelé.");
      } else {
        showToast("Error closing day.");
      }
    } catch (e) {
      showToast("Connection error.");
    } finally {
      setCloseLoading(false);
    }
  };

  const dateStr = new Date(date).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' });
  const isPinned = !!data.pinnedAffirmation;
  let displayedText = "";
  let displayedCategory = "";

  if (isPinned) {
    displayedText = data.pinnedAffirmation;
    displayedCategory = affirmationsList.find((a: any) => a.text === data.pinnedAffirmation)?.category || "General";
  } else {
    const currentAff = affirmationsList[data.affirmationIndex];
    if (currentAff) {
      displayedText = currentAff.text;
      displayedCategory = currentAff.category;
    }
  }

  return (
    <>
      <div className="header">
        <a href="/" className="header-title">She already is.</a>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ThemeToggle />
          <button 
            onClick={() => saveProgress(data, true)} 
            disabled={isSaving}
            className="btn-ghost" 
            style={{ fontSize: "0.7rem", padding: "6px 12px" }}
          >
            {isSaving ? "Saving..." : "Save Progress"}
          </button>
          <span className="header-date">{dateStr}</span>
        </div>
      </div>

      <div className="container">
        <div className="section-label">Morning — open with her words</div>
        <div className="card" style={{ background: "var(--ink)", position: "relative", padding: "36px 32px" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "var(--gold)" }}></div>
          <div className="font-serif" style={{ fontSize: "1.6rem", fontStyle: "italic", color: "var(--white)", marginBottom: "8px", minHeight: "72px", lineHeight: 1.5 }}>
            {displayedText}
          </div>
          <div style={{ fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px", fontFamily: "var(--font-sans)" }}>
            {displayedCategory}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {!isPinned && <button className="btn-ghost" onClick={previousAffirmation}>Previous</button>}
            {!isPinned && <button className="btn-ghost" onClick={nextAffirmation}>Next</button>}
            <button className="btn-ghost" onClick={readAloud}>Read aloud</button>
            <button 
              className="btn-ghost" 
              onClick={pinAffirmation}
              style={{ borderColor: isPinned ? "var(--gold)" : "", color: isPinned ? "var(--gold)" : "" }}
            >
              {isPinned ? "Unpin" : "Pin for today"}
            </button>
            <span style={{ fontSize: "0.7rem", color: "#6a6a6a", marginLeft: "auto" }}>{data.readCount} read today</span>
          </div>
        </div>

        <div className="section-label">Who is she today</div>
        <div className="card" style={{ borderLeft: "3px solid var(--gold)" }}>
          <div className="font-serif" style={{ fontSize: "1.15rem", fontStyle: "italic", color: "var(--muted)", marginBottom: "12px", lineHeight: 1.5 }}>
            {IDENTITY_QUESTIONS[data.questionIndex]}
          </div>
          <textarea
            className="input-field"
            style={{ minHeight: "60px" }}
            placeholder="Write freely. No one is grading this."
            value={data.identityAnswer}
            onChange={(e) => update("identityAnswer", e.target.value)}
          />
          <button className="btn-primary" onClick={getInsight} disabled={insightLoading} style={{ marginTop: "14px" }}>
            Get her perspective →
          </button>
        </div>

        <div className="card" style={{ background: "var(--warm)", marginTop: "3px", minHeight: "80px" }}>
          {insightLoading ? (
            <div className="loading-dots"><span></span><span></span><span></span></div>
          ) : data.aiInsight ? (
            <div style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>{data.aiInsight}</div>
          ) : (
            <div style={{ fontSize: "0.85rem", color: "var(--muted)", fontStyle: "italic" }}>
              Write your answer above, then ask for her perspective — the version of you that already is everything you wrote in those affirmations.
            </div>
          )}
        </div>

        <div className="section-label">Her actions today</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {DAILY_ACTIONS.map((action, i) => {
            const isDone = data.actionsDone.includes(i);
            return (
              <div
                key={i}
                onClick={() => toggleAction(i)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px 20px", 
                  background: isDone ? "var(--warm)" : "var(--white)", cursor: "pointer", transition: "background 0.15s"
                }}
              >
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0, marginTop: "2px",
                  border: "1.5px solid var(--gold)", background: isDone ? "var(--gold)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "10px"
                }}>
                  {isDone && "✓"}
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", lineHeight: 1.5, textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--muted)" : "var(--ink)" }}>
                    {action.text}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "3px" }}>
                    {action.why}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-label" style={{ color: "var(--teal)" }}>For others — she gives freely</div>
        <div className="card" style={{ borderLeft: "3px solid var(--teal)" }}>
          <div className="font-serif" style={{ fontSize: "1.1rem", fontStyle: "italic", marginBottom: "6px" }}>
            {OTHERS_PROMPTS[(new Date(date).getDate() + 3) % OTHERS_PROMPTS.length]}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "16px" }}>
            Think of one specific person. Not "people in general." One face.
          </div>
          <input
            className="input-field"
            placeholder="Their name, or just who came to mind..."
            value={data.othersPerson}
            onChange={(e) => update("othersPerson", e.target.value)}
            style={{ marginBottom: "20px" }}
          />

          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "10px", letterSpacing: "0.05em" }}>Pick one gesture — or write your own</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            {GESTURES.map((g, i) => (
              <div
                key={i}
                onClick={() => update("othersGesture", i)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px",
                  borderRadius: "1px", cursor: "pointer", fontSize: "0.85rem",
                  background: data.othersGesture === i ? "var(--teal-light)" : "var(--fog)",
                  border: data.othersGesture === i ? "1px solid var(--teal)" : "1px solid transparent",
                  color: data.othersGesture === i ? "var(--teal-dark)" : "var(--ink)"
                }}
              >
                <span>{g.icon}</span><span>{g.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ borderLeft: "3px solid var(--red-light)", marginTop: "3px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
            Honest check — the hard one
          </div>
          <div className="font-serif" style={{ fontSize: "1rem", color: "var(--muted)" }}>
            Is there someone you were inconsiderate toward recently — even unintentionally?
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "6px" }}>
            You don't have to fix it today. But name it. Awareness is where it starts.
          </div>
          <textarea
            className="input-field"
            placeholder="If yes — who, and what happened? If no, write 'clear'."
            value={data.othersHonest}
            onChange={(e) => update("othersHonest", e.target.value)}
            style={{ minHeight: "44px", marginTop: "10px" }}
          />
        </div>

        <div className="section-label">Evening — close the loop</div>
        <div className="card" style={{ background: "var(--ink)", color: "var(--white)" }}>
          {[{ label: "Where did she show up for someone else today?", key: "eveningOthers", p: "Even a small moment..." },
            { label: "Where did she show up today?", key: "eveningWin", p: "Even small moments count..." },
            { label: "Where did the old version pull her back?", key: "eveningGap", p: "Be honest, not harsh..." },
            { label: "What does she do differently tomorrow?", key: "eveningTomorrow", p: "One concrete thing..." }].map((q, i) => (
            <div key={i} style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "#6a6a6a", marginBottom: "6px", letterSpacing: "0.03em" }}>{q.label}</div>
              <textarea
                value={(data as any)[q.key]}
                onChange={(e) => update(q.key, e.target.value)}
                placeholder={q.p}
                style={{
                  width: "100%", background: "#232323", border: "none", borderBottom: "1px solid #333",
                  padding: "8px 0", color: "var(--white)", resize: "none", outline: "none", minHeight: "48px"
                }}
              />
            </div>
          ))}

          {!data.closingText ? (
            <button className="btn-primary" onClick={closeDay} disabled={closeLoading}>
              {closeLoading ? "Closing..." : "Close today →"}
            </button>
          ) : (
            <div className="font-serif" style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #2a2a2a", fontSize: "1.1rem", color: "var(--gold)", fontStyle: "italic", lineHeight: 1.7 }}>
              "{data.closingText}"
            </div>
          )}
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "20px" }}>
            <div style={{ flex: 1, height: "3px", background: "#2a2a2a", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "var(--gold)", width: `${(data.actionsDone.length / DAILY_ACTIONS.length) * 100}%`, transition: "width 0.4s ease" }}></div>
            </div>
            <span style={{ fontSize: "0.7rem", color: "#4a4a4a" }}>{data.actionsDone.length} / {DAILY_ACTIONS.length} actions</span>
          </div>
        </div>

      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "var(--white)", fontSize: "0.8rem", padding: "10px 20px", borderRadius: "2px", zIndex: 100
        }}>
          {toast}
        </div>
      )}
    </>
  );
}

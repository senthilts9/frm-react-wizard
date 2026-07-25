import { useEffect, useState } from "react";

// Dev-only, local-only: reads the private, gitignored study-data repo that
// lives outside this project (never bundled into `vite build`, so it can
// never reach the public GitHub Pages deploy -- see vite.config.js).
const PRIVATE_DATA_URL = "/@fs/C:/Meridian/frm-mock-answers-private/mock_answers_2026.json";

export function MockAnswersBank() {
  const [readings, setReadings] = useState(null);
  const [error, setError] = useState(null);
  const [openReading, setOpenReading] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(PRIVATE_DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setReadings)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section className="card">
        <span className="eyebrow">Mock answers (local only)</span>
        <h2>Private data not found</h2>
        <p className="muted">
          This view only works on the machine that has the private study-data repo cloned
          as a sibling folder (<code>../frm-mock-answers-private</code>). Fetch failed:{" "}
          {error}
        </p>
      </section>
    );
  }

  if (!readings) {
    return (
      <section className="card">
        <span className="eyebrow">Mock answers (local only)</span>
        <h2>Loading...</h2>
      </section>
    );
  }

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? readings.filter((r) => r.reading.toLowerCase().includes(needle))
    : readings;

  return (
    <section className="card bank-view">
      <div>
        <span className="eyebrow">Mock answers (local only, not in the public build)</span>
        <h2>{readings.reduce((sum, r) => sum + r.questions.length, 0)} questions across {readings.length} readings</h2>
        <p className="muted">
          Source: private study data, never committed to this (public) repo or deployed.
        </p>
      </div>
      <input
        placeholder="Filter by reading name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 12, width: "100%", padding: "8px 10px" }}
      />
      <div className="bank-list">
        {filtered.map((r) => (
          <div key={r.reading}>
            <button type="button" onClick={() => setOpenReading(openReading === r.reading ? null : r.reading)}>
              <span>
                <strong>{r.reading}</strong>
                <small>{r.questions.length} question{r.questions.length === 1 ? "" : "s"}</small>
              </span>
            </button>
            {openReading === r.reading && (
              <div style={{ padding: "8px 12px 16px" }}>
                {r.questions.map((q) => (
                  <div key={q.question_id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #eee" }}>
                    <p><strong>Q{q.question_number}.</strong> {q.body}</p>
                    <p className="muted"><em>Explanation:</em> {q.explanation}</p>
                    <small className="muted">Book {q.book}, Module {q.module}, LO {q.lo}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

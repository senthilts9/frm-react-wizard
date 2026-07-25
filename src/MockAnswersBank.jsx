import { useEffect, useState } from "react";

// Dev-only, local-only: reads the private, gitignored study-data repo that
// lives outside this project (never bundled into `vite build`, so it can
// never reach the public GitHub Pages deploy -- see vite.config.js).
const DATA_URL = "/@fs/C:/Meridian/frm-mock-answers-private/mock_answers_2026_v2.json";
const ANSWER_KEY_URL = "/@fs/C:/Meridian/frm-mock-answers-private/answer_key_progress.json";

function QuizQuestion({ q, verifiedAnswer }) {
  const [selected, setSelected] = useState(null);
  const letters = Object.keys(q.choices);
  const known = Boolean(verifiedAnswer);

  return (
    <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border-soft)" }}>
      <p style={{ marginBottom: 12 }}>
        <strong>Q{q.question_number}.</strong> {q.stem}
      </p>
      <div>
        {letters.map((letter) => {
          const isSelected = selected === letter;
          const isCorrectLetter = known && verifiedAnswer === letter;
          let cls = "quiz-choice";
          if (selected) {
            if (known && isCorrectLetter) cls += " correct";
            else if (isSelected && known && !isCorrectLetter) cls += " incorrect";
            else if (!isSelected) cls += " dim";
          }
          return (
            <button
              key={letter}
              type="button"
              className={cls}
              disabled={Boolean(selected)}
              onClick={() => setSelected(letter)}
            >
              <span className="letter">{letter}</span>
              <span>{q.choices[letter]}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="quiz-explanation">
          {known ? (
            <p className={`quiz-verdict ${selected === verifiedAnswer ? "correct" : "incorrect"}`}>
              {selected === verifiedAnswer ? "Correct" : `Incorrect — correct answer is ${verifiedAnswer}`}
            </p>
          ) : (
            <p className="quiz-verdict unknown">Not yet verified — read the explanation to judge for yourself</p>
          )}
          <p style={{ margin: 0 }}>{q.explanation}</p>
          <small className="muted">Book {q.book}, Module {q.module}, LO {q.lo}</small>
        </div>
      )}
    </div>
  );
}

export function MockAnswersBank() {
  const [readings, setReadings] = useState(null);
  const [answerKey, setAnswerKey] = useState({});
  const [error, setError] = useState(null);
  const [openReading, setOpenReading] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(DATA_URL).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      fetch(ANSWER_KEY_URL)
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
    ])
      .then(([data, key]) => {
        setReadings(data);
        setAnswerKey(key);
      })
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

  const verifiedCount = Object.keys(answerKey).length;
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
          {verifiedCount} verified with confirmed correct answers (reading-comprehension checked, not guessed).
          The rest show the explanation only, unlabeled, until verified.
        </p>
      </div>
      <input
        placeholder="Filter by reading name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 12, width: "100%" }}
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
              <div style={{ padding: "12px 4px 4px" }}>
                {r.questions.map((q) => (
                  <QuizQuestion key={q.question_id} q={q} verifiedAnswer={answerKey[q.question_id]} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

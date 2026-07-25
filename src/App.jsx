import { useEffect, useMemo, useState } from "react";
import modules from "./data/modules.json";
import { MockAnswersBank } from "./MockAnswersBank.jsx";

const MEMORY_LEVELS = ["New", "Learning", "Remembered", "Mastered"];
const STEP_LABELS = ["Concept", "Triggers", "Why it works", "Notation & inputs", "Worked example", "Practice"];

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function ProgressRing({ value }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-ring" style={{ "--progress": `${safe * 3.6}deg` }} aria-label={`${Math.round(safe)} percent mastered`}>
      <div>
        <strong>{Math.round(safe)}%</strong>
        <span>mastered</span>
      </div>
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function Stepper({ step, setStep }) {
  return (
    <nav className="stepper" aria-label="Lesson steps">
      {STEP_LABELS.map((label, index) => (
        <button
          key={label}
          type="button"
          className={index === step ? "active" : index < step ? "done" : ""}
          onClick={() => setStep(index)}
        >
          <span>{index + 1}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

function LessonPanel({ module, step, setStep, memory, setMemory, questionStats, setQuestionStats }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [working, setWorking] = useState("");

  useEffect(() => {
    setQuestionIndex(0);
    setShowHint(false);
    setShowSolution(false);
    setSelectedChoice("");
    setWorking("");
  }, [module.id]);

  const question = module.questions[questionIndex] || null;

  function revealSolution() {
    if (!question) return;
    const key = question.id;
    setQuestionStats((prev) => ({
      ...prev,
      [key]: {
        attempts: (prev[key]?.attempts || 0) + 1,
        lastChoice: selectedChoice || working,
        revealed: true,
      },
    }));
    setShowSolution(true);
  }

  function promote() {
    const current = memory[module.id] || "New";
    const nextIndex = Math.min(MEMORY_LEVELS.indexOf(current) + 1, MEMORY_LEVELS.length - 1);
    setMemory((prev) => ({ ...prev, [module.id]: MEMORY_LEVELS[nextIndex] }));
  }

  const currentMemory = memory[module.id] || "New";

  return (
    <section className="lesson card">
      <header className="lesson-header">
        <div>
          <div className="eyebrow">{module.book}</div>
          <h2>{module.name}</h2>
          <div className="pill-row">
            <Pill tone="accent">{module.topic}</Pill>
            <Pill>{module.kind === "formula" ? "Formula module" : "Concept module"}</Pill>
            <Pill tone={currentMemory === "Mastered" ? "success" : "neutral"}>{currentMemory}</Pill>
          </div>
        </div>
        <label className="memory-picker">
          <span>Memory status</span>
          <select
            value={currentMemory}
            onChange={(event) => setMemory((prev) => ({ ...prev, [module.id]: event.target.value }))}
          >
            {MEMORY_LEVELS.map((level) => <option key={level}>{level}</option>)}
          </select>
        </label>
      </header>

      <Stepper step={step} setStep={setStep} />

      <div className="lesson-body">
        {step === 0 && (
          <div className="section-stack">
            <article className="callout">
              <span className="section-kicker">What problem does it solve?</span>
              <p>{module.purpose}</p>
            </article>
            <article>
              <h3>Real-world use</h3>
              <p>{module.realWorld}</p>
            </article>
            <article>
              <h3>Plain-English idea</h3>
              <p>{module.plainEnglish}</p>
            </article>
          </div>
        )}

        {step === 1 && (
          <div className="section-stack">
            <article>
              <h3>Exam keywords that should trigger this module</h3>
              <div className="keyword-grid">
                {module.keywords.map((word) => <Pill key={word} tone="accent">{word}</Pill>)}
              </div>
            </article>
            <article className="callout">
              <span className="section-kicker">Decision rule</span>
              <p>
                Do not select a formula only because one familiar word appears. Match the requested output,
                the supplied inputs, units, and the financial setting.
              </p>
            </article>
          </div>
        )}

        {step === 2 && (
          <div className="section-stack">
            <article>
              <h3>Why the method works</h3>
              <ol className="numbered-steps">
                {module.whyItWorks.map((item, index) => (
                  <li key={`${module.id}-why-${index}`}>
                    <span>{index + 1}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </article>
            <article className="memory-box">
              <span className="section-kicker">Memory hook</span>
              <strong>{module.memoryHook}</strong>
            </article>
          </div>
        )}

        {step === 3 && (
          <div className="section-stack">
            <article>
              <h3>Formula</h3>
              <pre className="formula-box">{module.formula}</pre>
            </article>

            {module.notation.length > 0 && (
              <article>
                <h3>Every notation</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Symbol</th><th>Meaning</th></tr>
                    </thead>
                    <tbody>
                      {module.notation.map((row) => (
                        <tr key={`${module.id}-${row.symbol}`}>
                          <td><strong>{row.symbol}</strong></td>
                          <td>{row.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            )}

            {module.inputOrigins.length > 0 && (
              <article>
                <h3>Where each value comes from</h3>
                <div className="input-origin-list">
                  {module.inputOrigins.map((row) => (
                    <div key={`${module.id}-origin-${row.symbol}`}>
                      <strong>{row.symbol}</strong>
                      <p>{row.source}</p>
                    </div>
                  ))}
                </div>
              </article>
            )}

            <article className="warning-box">
              <span className="section-kicker">Common FRM trap</span>
              <p>{module.trap}</p>
            </article>
          </div>
        )}

        {step === 4 && (
          <div className="section-stack">
            <article>
              <h3>Step-by-step worked example</h3>
              <ol className="numbered-steps">
                {module.workedExample.steps.map((item, index) => (
                  <li key={`${module.id}-example-${index}`}>
                    <span>{index + 1}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </article>
            <article className="callout">
              <span className="section-kicker">Interpretation</span>
              <p>{module.workedExample.interpretation}</p>
            </article>
          </div>
        )}

        {step === 5 && question && (
          <div className="section-stack">
            <article className="question-card">
              <div className="question-meta">
                <span>Question {questionIndex + 1} of {module.questions.length}</span>
                <span>{question.type === "concept" ? "Concept check" : "Calculation"}</span>
              </div>
              <h3>{question.prompt}</h3>

              {question.choices.length > 0 ? (
                <div className="choice-list">
                  {question.choices.map((choice) => (
                    <label key={choice} className={selectedChoice === choice ? "selected" : ""}>
                      <input
                        type="radio"
                        name={`choice-${question.id}`}
                        value={choice}
                        checked={selectedChoice === choice}
                        onChange={(event) => setSelectedChoice(event.target.value)}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <label className="working-box">
                  <span>Your formula, substitution and working</span>
                  <textarea
                    rows="5"
                    value={working}
                    onChange={(event) => setWorking(event.target.value)}
                    placeholder="1. Identify values\n2. Write formula\n3. Substitute\n4. Calculate\n5. Interpret"
                  />
                </label>
              )}

              <div className="button-row">
                <button type="button" className="secondary" onClick={() => setShowHint((value) => !value)}>
                  {showHint ? "Hide hint" : "Show hint"}
                </button>
                <button type="button" className="primary" onClick={revealSolution}>Reveal full solution</button>
              </div>

              {showHint && <div className="hint-box"><strong>Hint:</strong> {question.hint}</div>}

              {showSolution && (
                <div className="solution-box" aria-live="polite">
                  <span className="section-kicker">Complete solution</span>
                  <ol className="numbered-steps compact">
                    {question.solutionSteps.map((item, index) => (
                      <li key={`${question.id}-solution-${index}`}>
                        <span>{index + 1}</span>
                        <p>{item}</p>
                      </li>
                    ))}
                  </ol>
                  <p><strong>Answer:</strong> {question.answer}</p>
                  <p><strong>Meaning:</strong> {question.explanation}</p>
                </div>
              )}

              <div className="question-nav">
                <button
                  type="button"
                  className="secondary"
                  disabled={questionIndex === 0}
                  onClick={() => {
                    setQuestionIndex((value) => value - 1);
                    setShowHint(false);
                    setShowSolution(false);
                    setSelectedChoice("");
                    setWorking("");
                  }}
                >
                  Previous question
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={questionIndex >= module.questions.length - 1}
                  onClick={() => {
                    setQuestionIndex((value) => value + 1);
                    setShowHint(false);
                    setShowSolution(false);
                    setSelectedChoice("");
                    setWorking("");
                  }}
                >
                  Next question
                </button>
              </div>
            </article>

            <article className="memory-actions">
              <div>
                <span className="section-kicker">After attempting</span>
                <p>Promote only when you can identify the trigger and reproduce the method without looking.</p>
              </div>
              <div className="button-row">
                <button type="button" className="secondary" onClick={() => setMemory((prev) => ({ ...prev, [module.id]: "Learning" }))}>
                  Need review
                </button>
                <button type="button" className="primary" onClick={promote}>
                  I remembered — promote
                </button>
              </div>
            </article>
          </div>
        )}
      </div>

      <footer className="lesson-footer">
        <button type="button" className="secondary" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
          ← Previous step
        </button>
        <span>Step {step + 1} of {STEP_LABELS.length}</span>
        <button type="button" className="primary" disabled={step === STEP_LABELS.length - 1} onClick={() => setStep((value) => Math.min(STEP_LABELS.length - 1, value + 1))}>
          Next step →
        </button>
      </footer>
    </section>
  );
}

function MockExam({ filteredModules, questionStats, setQuestionStats }) {
  const allQuestions = useMemo(
    () => filteredModules.flatMap((module) => module.questions.map((question) => ({ ...question, moduleName: module.name, topic: module.topic }))),
    [filteredModules]
  );
  const [size, setSize] = useState(10);
  const [paper, setPaper] = useState([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  function startMock() {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setPaper(shuffled.slice(0, Math.min(size, shuffled.length)));
    setCurrent(0);
    setRevealed(false);
  }

  if (!paper.length) {
    return (
      <section className="card empty-state">
        <h2>Mock exam generator</h2>
        <p>Build a mixed paper from the current question bank. More banks can be added as separate JSON files later.</p>
        <label>
          Number of questions
          <select value={size} onChange={(event) => setSize(Number(event.target.value))}>
            {[5, 10, 20, 40].map((number) => <option key={number} value={number}>{number}</option>)}
          </select>
        </label>
        <button type="button" className="primary" onClick={startMock}>Start mock</button>
      </section>
    );
  }

  const question = paper[current];

  return (
    <section className="card mock-card">
      <div className="question-meta">
        <span>Mock question {current + 1} of {paper.length}</span>
        <span>{question.topic} · {question.moduleName}</span>
      </div>
      <h2>{question.prompt}</h2>
      {question.choices.length > 0 && (
        <div className="choice-list">
          {question.choices.map((choice) => <div key={choice} className="mock-choice">{choice}</div>)}
        </div>
      )}
      <button
        type="button"
        className="primary"
        onClick={() => {
          setRevealed(true);
          setQuestionStats((prev) => ({
            ...prev,
            [question.id]: { attempts: (prev[question.id]?.attempts || 0) + 1, revealed: true },
          }));
        }}
      >
        Reveal answer
      </button>
      {revealed && (
        <div className="solution-box">
          <p><strong>Answer:</strong> {question.answer}</p>
          <ol className="numbered-steps compact">
            {question.solutionSteps.map((item, index) => (
              <li key={`${question.id}-mock-${index}`}><span>{index + 1}</span><p>{item}</p></li>
            ))}
          </ol>
        </div>
      )}
      <div className="question-nav">
        <button type="button" className="secondary" disabled={current === 0} onClick={() => { setCurrent((v) => v - 1); setRevealed(false); }}>
          Previous
        </button>
        <button type="button" className="secondary" disabled={current === paper.length - 1} onClick={() => { setCurrent((v) => v + 1); setRevealed(false); }}>
          Next
        </button>
        <button type="button" className="secondary" onClick={startMock}>Restart</button>
      </div>
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("learn");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All topics");
  const [kind, setKind] = useState("All modules");
  const [currentId, setCurrentId] = usePersistentState("frm-current-module", "expected-value");
  const [memory, setMemory] = usePersistentState("frm-memory-v2", {});
  const [questionStats, setQuestionStats] = usePersistentState("frm-question-stats-v2", {});
  const [step, setStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topics = useMemo(() => ["All topics", ...new Set(modules.map((module) => module.topic))], []);

  const filteredModules = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return modules.filter((module) => {
      const topicMatches = topic === "All topics" || module.topic === topic;
      const kindMatches = kind === "All modules" || (kind === "Formulas" ? module.kind === "formula" : module.kind === "concept");
      const textMatches = !needle || module.searchText.includes(needle);
      return topicMatches && kindMatches && textMatches;
    });
  }, [query, topic, kind]);

  useEffect(() => {
    if (filteredModules.length && !filteredModules.some((module) => module.id === currentId)) {
      setCurrentId(filteredModules[0].id);
    }
  }, [filteredModules, currentId, setCurrentId]);

  const currentModule = modules.find((module) => module.id === currentId) || modules[0];
  const masteredCount = modules.filter((module) => memory[module.id] === "Mastered").length;
  const attemptedCount = Object.values(questionStats).filter((value) => value?.attempts > 0).length;
  const totalQuestions = modules.reduce((sum, module) => sum + module.questions.length, 0);
  const masteryPercent = modules.length ? (masteredCount / modules.length) * 100 : 0;

  function chooseModule(id) {
    setCurrentId(id);
    setStep(0);
    setSidebarOpen(false);
    setView("learn");
  }

  function randomWeakModule() {
    const weak = filteredModules.filter((module) => memory[module.id] !== "Mastered");
    const pool = weak.length ? weak : filteredModules;
    if (!pool.length) return;
    chooseModule(pool[Math.floor(Math.random() * pool.length)].id);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Expandable FRM study system</span>
          <h1>FRM Part I Study Wizard</h1>
        </div>
        <button type="button" className="mobile-menu secondary" onClick={() => setSidebarOpen((value) => !value)}>
          {sidebarOpen ? "Close modules" : "Browse modules"}
        </button>
        <nav className="main-tabs" aria-label="Main sections">
          {[
            ["learn", "Learn"],
            ["bank", "Question bank"],
            ["mock", "Mock exam"],
            ...(import.meta.env.DEV ? [["answers", "Mock Answers (dev)"]] : []),
          ].map(([id, label]) => (
            <button key={id} type="button" className={view === id ? "active" : ""} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <section className="dashboard">
        <div className="metric">
          <span>Modules</span><strong>{modules.length}</strong><small>formula + concept</small>
        </div>
        <div className="metric">
          <span>Questions</span><strong>{totalQuestions}</strong><small>expandable banks</small>
        </div>
        <div className="metric">
          <span>Attempted</span><strong>{attemptedCount}</strong><small>saved locally</small>
        </div>
        <div className="metric">
          <span>Mastered</span><strong>{masteredCount}</strong><small>of {modules.length}</small>
        </div>
        <ProgressRing value={masteryPercent} />
      </section>

      <div className="workspace">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="filter-stack">
            <label>
              Search
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="formula, keyword, topic..." />
            </label>
            <div className="filter-grid">
              <label>
                Topic
                <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                  {topics.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                Type
                <select value={kind} onChange={(event) => setKind(event.target.value)}>
                  <option>All modules</option>
                  <option>Formulas</option>
                  <option>Concepts</option>
                </select>
              </label>
            </div>
            <button type="button" className="secondary full" onClick={randomWeakModule}>Random weak module</button>
          </div>

          <div className="module-list" aria-label="Module list">
            {filteredModules.map((module) => (
              <button
                key={module.id}
                type="button"
                className={module.id === currentId ? "active" : ""}
                onClick={() => chooseModule(module.id)}
              >
                <span className={`status-dot status-${(memory[module.id] || "New").toLowerCase()}`} />
                <span>
                  <strong>{module.name}</strong>
                  <small>{module.topic} · {module.questions.length} question{module.questions.length === 1 ? "" : "s"}</small>
                </span>
              </button>
            ))}
            {!filteredModules.length && <p className="muted">No matching module.</p>}
          </div>
        </aside>

        <main>
          {view === "learn" && (
            <LessonPanel
              module={currentModule}
              step={step}
              setStep={setStep}
              memory={memory}
              setMemory={setMemory}
              questionStats={questionStats}
              setQuestionStats={setQuestionStats}
            />
          )}

          {view === "bank" && (
            <section className="card bank-view">
              <div>
                <span className="eyebrow">Question bank</span>
                <h2>{filteredModules.reduce((sum, module) => sum + module.questions.length, 0)} questions in current filters</h2>
                <p className="muted">Select a question to open its full lesson, derivation and solution.</p>
              </div>
              <div className="bank-list">
                {filteredModules.flatMap((module) =>
                  module.questions.map((question) => (
                    <button key={question.id} type="button" onClick={() => { chooseModule(module.id); setStep(5); }}>
                      <span>
                        <strong>{question.prompt}</strong>
                        <small>{module.topic} · {module.name}</small>
                      </span>
                      <Pill tone={questionStats[question.id]?.attempts ? "success" : "neutral"}>
                        {questionStats[question.id]?.attempts ? `${questionStats[question.id].attempts} attempt(s)` : "Not attempted"}
                      </Pill>
                    </button>
                  ))
                )}
              </div>
            </section>
          )}

          {view === "mock" && (
            <MockExam
              filteredModules={filteredModules}
              questionStats={questionStats}
              setQuestionStats={setQuestionStats}
            />
          )}

          {view === "answers" && import.meta.env.DEV && <MockAnswersBank />}
        </main>
      </div>

      <footer className="site-footer">
        Educational study aid. Add only material and question banks you are authorised to use.
      </footer>
    </div>
  );
}

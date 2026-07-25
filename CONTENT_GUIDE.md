# Adding Modules and Question Banks

## Recommended organisation

Keep each future source or subject in its own JSON file, for example:

```text
src/data/
  quicksheet-modules.json
  book-1-foundations.json
  book-2-quantitative-analysis.json
  question-bank-a.json
  mock-exam-1.json
```

Then combine the arrays in a small `index.js` file.

## Module schema

```json
{
  "id": "expected-value",
  "book": "Book 2",
  "topic": "Quantitative Analysis",
  "name": "Expected Value",
  "kind": "formula",
  "purpose": "What problem it solves",
  "realWorld": "Where it is used",
  "keywords": ["expected payoff", "probability-weighted mean"],
  "formula": "E(X) = Σ P(xᵢ)xᵢ",
  "plainEnglish": "Multiply each outcome by its probability and add",
  "notation": [
    { "symbol": "xᵢ", "meaning": "possible outcome" }
  ],
  "whyItWorks": [
    "Explain the reasoning, not merely the formula."
  ],
  "inputOrigins": [
    { "symbol": "P(xᵢ)", "source": "Probability supplied in the question" }
  ],
  "workedExample": {
    "steps": ["Every substitution step"],
    "interpretation": "Financial meaning of the result"
  },
  "trap": "Common exam mistake",
  "memoryHook": "Short memory phrase",
  "questions": []
}
```

## Question schema

```json
{
  "id": "expected-value-q5",
  "type": "worked",
  "prompt": "Question text",
  "choices": [],
  "answer": "Final answer",
  "hint": "One useful clue",
  "solutionSteps": [
    "Identify values",
    "Write formula",
    "Substitute",
    "Calculate",
    "Interpret"
  ],
  "explanation": "Why the answer makes financial sense"
}
```

For multiple-choice questions, populate `choices` with four options.

## Content quality checklist

Every numerical module should explain:

1. What is being calculated?
2. Why is the formula appropriate?
3. Which words in the question signal it?
4. What does every symbol mean?
5. Where does every input value come from?
6. Are rates decimals or percentages?
7. Are time periods consistent?
8. What sign convention applies?
9. What does the final result mean?
10. What is the most likely exam trap?

## Adding copyrighted source material

Do not paste or publish whole chapters, commercial question banks, or official exam questions. Add paraphrased explanations and original practice questions based on concepts you are authorised to study.

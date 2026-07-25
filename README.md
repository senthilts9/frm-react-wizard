# FRM Part I Study Wizard (React)

A mobile-first, expandable React/Vite study application for FRM Part I.

## Included in this starter

- 63 modules across Foundations, Quantitative Analysis, Financial Markets, and Valuation & Risk Models
- 67 original practice questions
- Concept-first lesson flow:
  1. Concept
  2. Exam trigger words
  3. Why the formula/method works
  4. Notation and where every input comes from
  5. Step-by-step worked example
  6. Practice and memory status
- Detailed Expected Value derivation showing why it is a probability-weighted mean
- Formula/concept search and topic filters
- Question bank view
- Randomised mock-exam generator
- Browser-local progress tracking
- Responsive iPhone/mobile layout

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production files will be written to `dist/`.

## Deploy free on Cloudflare Pages

1. Create a GitHub repository and push this folder.
2. In Cloudflare Dashboard, open **Workers & Pages**.
3. Choose **Create application → Pages → Import an existing Git repository**.
4. Use:
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Deploy.

## Content structure

All study content is in:

```text
src/data/modules.json
```

Each module contains:

- `topic`, `name`, `kind`
- `purpose`, `realWorld`, `keywords`
- `formula`, `plainEnglish`
- `notation`
- `whyItWorks`
- `inputOrigins`
- `workedExample`
- `trap`, `memoryHook`
- `questions[]`

See `CONTENT_GUIDE.md` before adding new modules or question banks.

## Future phases

- Add book/chapter/module navigation
- Import more authorised question banks as separate JSON files
- Timed mock exams, scoring and review flags
- Spaced-repetition scheduling
- Optional Supabase authentication and cloud progress sync
- Admin content editor
- PDF upload and private retrieval (backend required)

## Copyright and exam integrity

Use only material you are authorised to use. Keep uploaded books and commercial question banks private. The included questions are original study questions, not official GARP exam questions.

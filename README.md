# autodev-demo-todo

Todo demo app used as an `autodev` consumer-project tracer bullet.

## Local run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Vite dev server:

   ```bash
   npm run dev
   ```

3. Open the local URL printed by Vite to exercise the add-todo flow.

## E2E verification

- Install the Playwright browser once: `npx playwright install chromium`
- Run the end-to-end check: `npm run test:e2e`

## Worker feedback checks

- `npm test`
- `npm run test:e2e`
- `npm run build`

## Demo artifact refs

- Worker result: `docs/agents/worker-results/issue-3.yaml`
- Handoff: `docs/agents/handoffs/issue-3.yaml`
- Playwright result index: `playwright-report/results.json`
- Runtime checkpoint: `docs/agents/runtime/context-checkpoint.yaml`
- Root-session resume note: `docs/agents/operator-resume-guide.md`

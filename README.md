# ShadowRecall

**A live memory-influence debugger for automated action planning.**

ShadowRecall tests whether an AI system’s stored memory changes what it is about to do. It compares a memory-informed structured plan against an amnesiac control, highlights changed action fields, identifies the likely influencing memory, and pauses the plan for human review.

> Existing tools show what an AI remembers. ShadowRecall shows whether that memory changed the action.

## The problem

Persistent AI memory can improve personalization, but it also creates an invisible source of influence. A remembered preference may quietly alter an agent’s date, recipient, channel, priority, or other consequential action fields.

Users can often inspect stored memories, but they generally cannot see whether a particular memory materially changed a planned action.

ShadowRecall makes that influence visible and testable before execution.

## How it works

1. The user enters an instruction.
2. ShadowRecall retrieves relevant memories from Backboard.
3. A structured planner creates a memory-informed action.
4. The same planner runs again with memory deliberately withheld.
5. A deterministic difference engine compares the resulting tool and arguments.
6. If the actions diverge, ShadowRecall removes retrieved memories one at a time.
7. The memory whose removal eliminates the most changed fields is identified as the likely influence.
8. The action remains simulated until the user approves or rejects it.

The MVP never invokes an external calendar, messaging, or task-management tool.

## Modes

### Guided demo

Uses a deterministic memory fixture and scenario so the complete product can be demonstrated reliably without network access.

### Live Backboard memory

Performs a genuine semantic search against the configured Backboard assistant. Retrieved memories are passed into ShadowRecall’s deterministic structured planner, while the amnesiac control receives no memories.

Backboard provides persistent memory storage and semantic retrieval. The local planner keeps the experiment reproducible and avoids claiming that deterministic differences were produced by a paid LLM call.

## Features

- Live semantic memory retrieval through Backboard
- Remembering-plan versus amnesiac-control comparison
- Calendar, messaging, and task action schemas
- Field-level structured action differences
- Leave-one-memory-out counterfactual attribution
- Risk classification for consequential changes
- Human approval gate
- Guided offline demonstration
- Server-side credential protection
- Runtime request validation
- Responsive interface
- Automated unit tests

## Technology

- Next.js 16
- React
- TypeScript
- Backboard REST API
- Zod
- Vitest
- Lucide React

## Project structure

```text
app/
  api/
    analyze/route.ts     Analysis API
    health/route.ts      Configuration health check
  globals.css            Product styling
  layout.tsx             Application layout
  page.tsx               Main interface

lib/
  analyze.ts             Live-memory experiment and attribution
  backboard.ts           Server-side Backboard memory adapter
  demo.ts                Guided deterministic scenario
  diff.ts                Structured action comparison
  planner.ts             Deterministic action planner
  schema.ts              Request and action validation
  types.ts               Shared TypeScript types

tests/
  demo.test.ts           Guided-demo tests
  diff.test.ts           Difference-engine and risk tests
  planner.test.ts        Structured-planner tests

docs/
  ARCHITECTURE.md        Technical architecture
  DEMO_SCRIPT.md         Presentation script
  DEVPOST.md             Submission draft
```

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm
- A Backboard account for live-memory mode

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Guided-demo mode works without credentials.

## Configure live Backboard memory

Copy `.env.example` to `.env.local` and enter:

```env
BACKBOARD_API_KEY=your_api_key
BACKBOARD_ASSISTANT_ID=your_assistant_id
BACKBOARD_BASE_URL=https://app.backboard.io/api
```

Never commit `.env.local`.

Add this example memory to the configured Backboard assistant:

```text
The user prefers morning meetings when timing is flexible.
```

Start the application, select **Live Backboard memory**, and analyze:

```text
Schedule the project review for the earliest available time.
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm test` | Run all automated tests |
| `npm run typecheck` | Validate TypeScript |
| `npm run build` | Create the production build |
| `npm start` | Run the production build |

## Verification

The current MVP passes:

- 3 test files
- 9 automated tests
- TypeScript validation
- Next.js production compilation
- Production dependency audit with zero known vulnerabilities

## Attribution method

Suppose the memory-informed and amnesiac plans differ across two fields.

ShadowRecall removes each retrieved memory in turn and regenerates the memory-informed plan. It then measures how many changed fields return to the amnesiac baseline.

If removing one memory eliminates both changed fields, that memory has:

```text
2 / 2 changed fields explained
```

The interface currently presents this as an attribution score. It represents field-level explanatory coverage, not universal statistical certainty.

## Security and reliability

- The Backboard API key is used only by server-side code.
- `.env.local` is excluded from Git.
- User instructions are length-limited and validated with Zod.
- Planned actions conform to a restricted schema.
- No arbitrary external tool is executed.
- Backboard errors are returned through a controlled API response.
- Guided-demo mode remains available during network failure.

## Limitations

- The MVP planner supports calendar, messaging, and task actions rather than arbitrary tools.
- Available calendar slots are part of the controlled hackathon scenario.
- Leave-one-out attribution may not detect complex interactions between multiple memories.
- The attribution score measures changed-field coverage, not probabilistic causal certainty.
- The MVP simulates approval and does not execute external actions.

## Future work

- Sandboxed calendar and messaging integrations
- Configurable action schemas
- Repeated model trials with stability intervals
- Multi-memory interaction analysis
- Organization-level memory policies
- Audit-history export
- Automatic escalation for sensitive action fields

## Hackathon tracks

- **Primary:** Workflows
- **Secondary:** Apps
- **Secondary:** Design

## AI-use disclosure

AI-assisted development tools were used for brainstorming, implementation support, debugging, testing, and documentation. The submitted application’s integration, comparison engine, interface, tests, and project decisions were assembled and verified during the hackathon. The developer used ChatGPT Sola 5.6 during the course of the hackathon for the above purposes.

## License

MIT

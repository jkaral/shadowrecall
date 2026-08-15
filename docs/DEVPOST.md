# Devpost submission copy

## Project name

ShadowRecall

## Tagline

A live memory-influence debugger that reveals when stored AI memory changes a planned action.

## Inspiration

AI systems increasingly remember our preferences, history, and habits. That can make them more useful, but it also creates an invisible source of influence.

A stored preference might silently change when a meeting is scheduled, which person receives a message, or how urgently a task is treated. Existing memory dashboards largely answer:

> What does the AI remember?

ShadowRecall asks a different question:

> Did that memory change what the system was about to do?

## What it does

ShadowRecall compares two controlled action-planning paths:

- A remembering planner that receives relevant memories retrieved live from Backboard
- An amnesiac control that receives the same instruction but no memories

Both produce structured action plans. ShadowRecall compares their tool names and arguments field by field.

If the plans differ, it:

1. Pauses the hypothetical action
2. Highlights each changed field
3. Removes retrieved memories one at a time
4. Regenerates the plan after each removal
5. Identifies the memory that explains the greatest number of changed fields
6. Presents the result for human approval or rejection

The MVP supports calendar, messaging, and task actions. It deliberately simulates execution rather than invoking external tools.

## How we built it

ShadowRecall uses:

- Next.js 16 and React for the application
- TypeScript for end-to-end type safety
- Backboard for persistent memory and semantic retrieval
- A deterministic structured planner for reproducible action generation
- A field-level difference engine for consequential comparisons
- Leave-one-memory-out interventions for attribution
- Zod for runtime API validation
- Vitest for automated verification

Live mode sends the user’s instruction to Backboard’s semantic memory search. Retrieved memories are passed only to the remembering planner. The amnesiac planner receives an empty memory set, keeping memory as the isolated experimental variable.

A guided-demo mode provides a deterministic offline scenario for reliable presentation.

## Why it is different

Memory managers show stored facts. Agent firewalls check whether actions violate rules. Observability dashboards show what an agent already did.

ShadowRecall focuses on a separate question:

> Did memory silently cause the system to choose a different action?

Its defining interaction is a pre-execution comparison between a remembering system and an amnesiac control, followed by direct memory-removal tests.

## Challenges

### Separating action changes from wording changes

Comparing ordinary chatbot responses would incorrectly treat harmless wording differences as meaningful. We solved this by comparing validated structured actions instead of prose.

### Isolating memory as the variable

Two unconstrained model runs may disagree because of randomness. The MVP uses the same deterministic planner and withholds memory only from the control path, allowing differences to be attributed to memory rather than sampling variation.

### Working within API-credit constraints

Backboard memory storage and semantic retrieval were available, while hosted LLM chat required separate paid credits. Rather than disguise that limitation, we redesigned the architecture so Backboard performs genuine live memory retrieval and the structured planner runs locally and reproducibly.

### Describing attribution accurately

A memory may explain every changed field in one scenario without providing universal statistical certainty. We therefore report **field coverage**, not a misleading probability of causation.

## Accomplishments

- Genuine Backboard memory storage and semantic retrieval
- Controlled remembering-versus-amnesiac comparison
- Structured calendar, messaging, and task plans
- Field-level difference highlighting
- Leave-one-memory-out attribution
- Human approval boundary
- Guided offline demonstration
- Responsive product interface
- Server-only credentials
- Nine passing automated tests
- Successful TypeScript and production builds
- Zero known production dependency vulnerabilities

## What we learned

Transparency requires more than showing users a list of memories. The more important question is whether those memories materially change system behaviour.

We also learned that explainability claims must match the measurement. ShadowRecall can demonstrate which memory explains observed changed fields in a controlled scenario, but it does not claim philosophical or universal proof of causation.

## What's next

- Sandboxed calendar and messaging integrations
- User-defined action schemas
- Repeated LLM trials with stability intervals
- Multi-memory interaction analysis
- Policy rules for sensitive action fields
- Organization-level memory governance
- Exportable audit histories

## Tracks

### Primary: Workflows

ShadowRecall is a pre-execution governance and debugging workflow for memory-enabled systems.

### Secondary: Apps

It is delivered as a complete user-facing web application.

### Secondary: Design

Its value depends on making invisible memory influence understandable through side-by-side action cards, field differences, attribution evidence, and a human approval gate.

## Built with

- Next.js
- React
- TypeScript
- Backboard
- Zod
- Vitest
- Lucide React

## AI-use disclosure

AI-assisted development tools were used for brainstorming, implementation support, debugging, testing, and documentation. The submitted application’s architecture, Backboard integration, comparison engine, interface, tests, and project decisions were assembled and verified during the hackathon.
# Claude Code guidance

Read [AGENTS.md](AGENTS.md) first; it is the canonical source for shared repository rules.

Claude-specific expectations:

- inspect the current implementation and active documentation before editing;
- prefer focused changes over broad rewrites;
- preserve FSD boundaries and use the executable architecture checker;
- keep English and Spanish user-facing content synchronized;
- add a regression test for behavior changes and Astro navigation lifecycles where relevant;
- do not invent professional, coverage or performance claims;
- do not recreate historical plans or audit archives in the repository; synchronize durable rationale and handoffs to Cortex-L7.

Use commands from [package.json](package.json). Start validation with `bun run check` and add the relevant test, build or performance command for the change.

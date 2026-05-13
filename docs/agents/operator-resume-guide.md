# Operator Resume Guide

- Primary replay surfaces stay the workflow artifacts: issue packet, handoff, worker result, and verifier evidence.
- Latest root-session metadata lives in `.opencode/runtime/new-session-result.json`.
- Read `rootSessionID` there if you need the latest root session id.
- Read `cliOpenCommand` there if you want the already-prepared CLI reopen command.
- Exact reopen command from `new-session-result.json`:

```bash
opencode --session "$(jq -r '.rootSessionID' .opencode/runtime/new-session-result.json)"
```

- Equivalent command pattern after reading the id:

```bash
opencode --session <rootSessionID>
```

- Current repo example from `.opencode/runtime/new-session-result.json`:

```bash
opencode --session ses_1e0c96ac1ffeKgol7Lsj6Vvz6G
```

- The same file may also include `tuiResumeCommand` when the operator wants to switch sessions from the TUI.

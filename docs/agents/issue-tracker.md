# Issue tracker

This project uses GitHub issues and pull requests in `paulpai0412/autodev-demo-todo`.

## Labels

- `ready-for-agent`: issue is fully specified and can be picked up by an `issue_worker`.
- `agent-in-progress`: issue is currently being executed by the workflow.

## Branch and PR policy

- Branches follow `agent/issue-<number>-<slug>` and are created from `main`.
- Each ready issue should ship through one issue branch and one pull request.
- Pull requests must link the GitHub issue and include compact verification plus artifact refs.

## Worker result contract

- `issue_worker` writes `docs/agents/worker-results/issue-<n>.yaml` using the shared worker-result template.
- `status: success` is allowed only after the issue branch is pushed and the PR already exists.
- A successful worker result must contain real `pr.number` and `pr.url` values.
- If implementation is done but push or PR creation is still incomplete, the worker must write `blocked` or `failed` instead of an optimistic success result.
- Final acceptance still belongs to `pr_verifier`; worker self-checks are implementation feedback only.

## Evidence conventions

- Keep repo artifacts compact and index-only.
- Store raw logs, traces, and long transcripts outside the main agent context.
- Use local artifact refs such as `docs/agents/worker-results/`, `docs/agents/evidence/`, and `docs/agents/handoffs/` in PR summaries.

## Seeded queue notes

- Issue `#24` is the seeded bootstrap item for the current watch-mode cycle.
- Keeping this seeded issue visible in repo-local workflow docs makes the ready-for-agent queue observably live before later seeded issues are selected and processed.
- Issue `#23` is the seeded continuation item for the current watch-mode cycle.
- Keeping this seeded issue visible in repo-local workflow docs makes the next ready queue slot observable after the bootstrap item is selected and processed.
- Issue `#22` is the seeded monitor-tail item for the current watch-mode cycle.
- Keeping this seeded issue visible in repo-local workflow docs makes the third ready queue slot observable while earlier seeded issues are selected and processed.
- Issue `#31` is the seeded fresh-ready restart item for the current happy-path cycle.
- Keeping this seeded issue visible in repo-local workflow docs makes the next orchestrator restart observable from a freshly ready issue after the prior seeded cycle completes.

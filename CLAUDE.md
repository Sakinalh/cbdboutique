@AGENTS.md

# cbdboutique — working rules for Claude

Learning project: the user writes the code, Claude explains what/why and reviews.
Conversation in French; code, comments, commits and PRs in English.

## Non-negotiable on every ticket

- **Clean architecture**: dependencies point inward to the domain
  (`docs/adr/0003`, `0004`, `0005`, `0006`). Business rules never import a framework,
  the DB, HTTP or GraphQL. Point out any boundary violation in review.
- **Clean code**: small functions, intention-revealing names, no dead code,
  errors as values (`docs/adr/0008`), tests next to the behaviour they cover.
- **Accessibility** (WCAG 2.2 AA / RGAA) is part of "done", never a later pass:
  semantic HTML, keyboard, focus, labels, contrast, axe-core in E2E.
  The same applies to the future React Native app (accessibilityLabel/Role, screen readers).

## DevSecOps: always remind the user

Whenever a ticket touches something security-relevant, raise it briefly before moving on:
Dockerfiles and images (non-root, pinned base, image scan), CI workflows
(least-privilege `permissions`, pinned actions, secrets), dependencies (audit, Dependabot),
HTTP (headers, CORS, rate limiting), auth/sessions, input validation, secrets/env vars,
logs (no personal data), payment/webhooks (signature, idempotency).

## Upcoming direction (not yet in docs/plan.md)

- **System design section** to add to `docs/plan.md`: components, data flows, scaling,
  caching, failure modes, trade-offs.
- **React Native mobile app** after the web app: it consumes the same API,
  so the API must stay client-agnostic (auth must work without browser cookies).
- **GraphQL** (chosen for learning) as a **gateway / BFF between the clients and the REST API**:
  web + mobile → GraphQL → `apps/api` (REST, Zod/OpenAPI contract from `docs/adr/0007` unchanged).
  The REST API stays the source of truth (webhooks, cron, health hit it directly).
  Needs an ADR: where the gateway runs, DataLoader against N+1 REST calls, auth forwarding,
  added latency, query depth/complexity limits.

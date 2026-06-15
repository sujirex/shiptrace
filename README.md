# 🛡️ ShipTrace

**Self-hosted NCR & defect intelligence for shipyard quality control — Pareto analytics, pattern detection, and one-command Docker deployment.**

Live app: **[shiptrace.sujikumar.com](https://shiptrace.sujikumar.com)**

---

## The problem

Non-conformance reports (NCRs) and defects pile up in spreadsheets and never get analyzed, so the same problems keep recurring across vessels. ShipTrace turns raw NCR data into intelligence — which defect types dominate, where they cluster, and what patterns repeat — and runs entirely on the yard's own infrastructure, so quality data never leaves the premises.

## What it does

- **NCR & defect tracking** — log and manage non-conformance reports and defects.
- **Pareto analytics** — surfaces the vital-few defect categories driving most of the problems.
- **Pattern detection** — flags recurring defects and clusters across vessels or areas.
- **Self-hosted** — deploys on internal infrastructure; data stays on-premise.

## Tech stack

- **Next.js**
- **Docker** for containerized, self-hosted deployment

## Deploy with Docker

```bash
git clone https://github.com/sujirex/ShipTrace.git
cd ShipTrace
docker compose up -d
```

App runs on the configured port (document it here, e.g. http://localhost:3000).

> Document any required environment variables (database URL, admin credentials) in a `.env.example` file.

## About

Built by **Suji Kumar C** — Digital Maritime Engineer with hands-on shipyard quality, production, and IT experience.
Portfolio: [sujikumar.com](https://sujikumar.com) · LinkedIn: [in/sujirex](https://www.linkedin.com/in/sujirex)

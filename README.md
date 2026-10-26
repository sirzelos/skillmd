# skillmd

ชุด Claude Code skills และ global preferences สำหรับตั้งค่าเครื่องใหม่

## ติดตั้ง

```powershell
git clone https://github.com/sirzelos/skillmd.git
cd skillmd
powershell -ExecutionPolicy Bypass -File .\install.ps1   # Windows
```

```bash
./install.sh   # macOS / Linux / WSL / Git Bash
```

สคริปต์จะ copy `skills/*` และ `vendor/*/*` ไปที่ `~/.claude/skills/` และ copy `global/CLAUDE.md` ไปที่ `~/.claude/CLAUDE.md` ถ้ามีของเดิมอยู่จะสำรองเป็น `*.bak-<เวลา>` ก่อน และจะรัน `npm install` ให้ skill สัญญาเช่า จากนั้นให้ restart Claude Code

## Skills ในชุดนี้

| Skill | ใช้เมื่อ |
|---|---|
| `python-clean-code` | ตรวจและเก็บกวาดโค้ด Python (PEP 8, black, isort, flake8, mypy, pytest) |
| `java-spring-clean-code` | review โค้ด Java/Spring Boot/WebFlux/Kafka/Redis |
| `full-verify` | ก่อนบอกว่าเสร็จ: test ทั้งชุดเทียบ baseline, path ที่เปลี่ยนทำงานจริง, ตรงตามสเปก |
| `git-team-workflow` | merge release, กฎแก้ conflict, กันไฟล์ local ไม่ให้ขึ้น git, ตั้งชื่อ commit |
| `cve-fix` | แก้ CVE/SCA พร้อมหลักฐาน Trivy before/after |
| `spec-writing` | เขียนสเปกให้ทำได้จริง, AC ทดสอบได้, ภาษาคน |
| `thai-team-message` | ร่างข้อความภาษาไทยถึง lead/ทีม (แทนตัวว่า "ผม") |
| `long-task-monitor` | รันงานนานใน background พร้อม heartbeat |
| `wsl-podman-troubleshoot` | แก้ปัญหา WSL/podman บนเครื่องบริษัท และคืนพื้นที่ C: |
| `thai-lease-contract` | ร่างสัญญาเช่าภาษาไทยเป็นไฟล์ Word ตามรูปแบบหนังสือราชการ |
| `coding-guidelines` | กฎพื้นฐานทุกงานโค้ด: คิดก่อนเขียน, ง่ายไว้ก่อน, แก้เฉพาะจุด, มีเป้าที่ตรวจได้ |
| `implementation-plan` | ทำความเข้าใจโจทย์ → เขียนแผนทีละ step → ทำทีละ step พร้อม verify |
| `code-review-checklist` | review PR (ถูกต้อง, security, breaking change, performance, test) และการตอบ review |
| `api-design` | ออกแบบ REST/event contract: status code, error format, pagination, idempotency, versioning |
| `database-migration` | migration ที่ไม่ทำให้ระบบหยุด (expand/contract), lock, backfill, rollback |
| `secure-coding` | OWASP: injection, authz/IDOR, SSRF, path traversal, secret/PII |
| `observability` | log/metric/trace/alert (histogram สำหรับ p95, traceId, SLO) |
| `performance-tuning` | วัดก่อนแก้: EXPLAIN, profiler, pool, cache, N+1 |
| `dockerfile-best-practices` | Dockerfile/compose: multi-stage, non-root, cache layer, healthcheck |
| `pr-description` | เขียน title และ body ของ PR (What/Why/How to test/Risk) |

## Skills ยอดนิยมจากภายนอก (อยู่ใน `vendor/` ติดตั้งให้แล้ว)

คัดลอกมาเฉพาะตัวที่ license อนุญาต รายละเอียดที่มาและ license อยู่ใน [vendor/README.md](vendor/README.md) อัปเดตจากต้นทางด้วย `./update-vendor.sh`

| ชุด | Skills |
|---|---|
| **Superpowers** (obra, MIT) | `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`, `writing-skills`, `using-superpowers`, `diagnosing-superpowers` |
| **Anthropic** (Apache-2.0) | `frontend-design`, `webapp-testing` (Playwright), `mcp-builder`, `claude-api`, `skill-creator`, `web-artifacts-builder`, `internal-comms`, `brand-guidelines`, `theme-factory`, `canvas-design`, `algorithmic-art`, `slack-gif-creator`, `academy-guide`, `discernment-nudge` |
| **Karpathy guidelines** (MIT) | `karpathy-guidelines` |
| **Composio** (Apache-2.0) | `changelog-generator` |

ที่ใส่ไม่ได้เพราะ license: `docx`, `pdf`, `pptx`, `xlsx` ของ Anthropic ชุดนี้ sync มาจากบัญชี claude.ai ให้เอง หรือติดตั้งเองด้วย:

```text
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
```

ทางเลือก: ติดตั้ง Superpowers เป็น plugin (ได้ hooks ครบและอัปเดตอัตโนมัติ) ด้วย `/plugin install superpowers@claude-plugins-official` ถ้าติดตั้งแบบนี้ ให้ลบโฟลเดอร์ skill ชื่อซ้ำใน `~/.claude/skills` ออก

เพิ่มเติม:
- คำสั่งที่มากับ Claude Code อยู่แล้ว: `/code-review`, `/security-review`, `/simplify`, `/init`
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills): รวม skill เชื่อมกับ Jira, Linear, Slack, GitHub (ต้องใช้บัญชี Composio)

## เพิ่ม skill ใหม่
สร้าง `skills/<name>/SKILL.md` ที่มี frontmatter `name` และ `description` (description บอกว่าทำอะไรและใช้เมื่อไร) แล้วรัน install ใหม่

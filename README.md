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

สคริปต์จะ copy `skills/*` ไปที่ `~/.claude/skills/` และ copy `global/CLAUDE.md` ไปที่ `~/.claude/CLAUDE.md` ถ้ามีของเดิมอยู่จะสำรองเป็น `*.bak-<เวลา>` ก่อน และจะรัน `npm install` ให้ skill สัญญาเช่า จากนั้นให้ restart Claude Code

## Skills ในชุดนี้

| Skill | ใช้เมื่อ |
|---|---|
| `python-clean-code` | ตรวจและเก็บกวาดโค้ด Python (PEP 8, black, isort, flake8, mypy, pytest) |
| `java-spring-clean-code` | review โค้ด Java/Spring Boot/WebFlux/Kafka/Redis |
| `full-verify` | ก่อนบอกว่าเสร็จ: test ทั้งชุดเทียบ baseline, path ที่เปลี่ยนทำงานจริง, ตรงตามสเปก |
| `systematic-debugging` | หา root cause ก่อนแก้ bug หรือ error |
| `test-driven-development` | เขียน test ก่อน (red → green → refactor) |
| `git-team-workflow` | merge release, กฎแก้ conflict, กันไฟล์ local ไม่ให้ขึ้น git, ตั้งชื่อ commit |
| `cve-fix` | แก้ CVE/SCA พร้อมหลักฐาน Trivy before/after |
| `spec-writing` | เขียนสเปกให้ทำได้จริง, AC ทดสอบได้, ภาษาคน |
| `thai-team-message` | ร่างข้อความภาษาไทยถึง lead/ทีม (แทนตัวว่า "ผม") |
| `long-task-monitor` | รันงานนานใน background พร้อม heartbeat |
| `wsl-podman-troubleshoot` | แก้ปัญหา WSL/podman บนเครื่องบริษัท และคืนพื้นที่ C: |
| `thai-lease-contract` | ร่างสัญญาเช่าภาษาไทยเป็นไฟล์ Word ตามรูปแบบหนังสือราชการ |

## Skills ยอดนิยมจากภายนอก (แนะนำให้ติดตั้งเพิ่ม)

ชุดเหล่านี้มีคนดูแลอัปเดตอยู่ จึงติดตั้งจาก marketplace แทนการ copy มาเก็บไว้ ให้รันใน Claude Code:

```text
# Anthropic official: docx, xlsx, pptx, pdf, skill-creator, frontend-design, mcp-builder, ...
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills

# Superpowers (obra): brainstorming, writing-plans, executing-plans, TDD, systematic-debugging,
# verification-before-completion, requesting/receiving code review, git worktrees
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

- ถ้าใช้บัญชี claude.ai ตัวเดียวกัน skill ของ Anthropic (docx/pdf/pptx/xlsx/skill-creator) จะ sync มาให้อัตโนมัติ
- คำสั่งที่มากับ Claude Code อยู่แล้ว: `/code-review`, `/security-review`, `/simplify`, `/init`
- ถ้าคำสั่ง `/plugin` ใช้ไม่ได้ ให้ดูชื่อ marketplace/plugin ล่าสุดที่ https://github.com/anthropics/skills และ https://github.com/obra/superpowers

## เพิ่ม skill ใหม่
สร้าง `skills/<name>/SKILL.md` ที่มี frontmatter `name` และ `description` (description บอกว่าทำอะไรและใช้เมื่อไร) แล้วรัน install ใหม่

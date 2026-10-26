---
name: git-team-workflow
description: Team git workflow — syncing a release branch into a feature branch, resolving merge conflicts, keeping local-only helper files out of commits, branch/commit naming, and safe push. Use when the user asks to pull/merge release, resolve conflicts, commit, push, open a PR, or "อย่าให้ไฟล์นี้ขึ้น git".
---

# Git team workflow

## Sync release เข้า branch งาน
1. `git fetch origin`
2. `git stash push -m "local tweaks"` (เก็บงานที่ยังไม่ commit)
3. `git merge origin/<release-branch>`
4. แก้ conflict (ดูกฎด้านล่าง) แล้ว `git commit` เป็น merge commit
5. `git stash pop`
6. รัน unit test ที่ได้รับผลกระทบ แล้ว push **เฉพาะเมื่อ test ผ่าน**

## กฎแก้ conflict
- **ถ้าทั้งสองฝั่งแก้ unit test จุดเดียวกัน ให้เลือกฝั่ง release (ของคนอื่น)** เพราะถือว่าสะท้อน behavior ล่าสุดที่ทีมตั้งใจ
- โค้ด product: อ่านทั้งสองฝั่งแล้วรวมเจตนาของทั้งคู่ ถ้าไม่ชัดให้ถาม
- ไฟล์ generated/export (lock, jsonl ที่สร้างใหม่ได้): สร้างใหม่หรือ `git restore` อย่าแก้ด้วยมือ

## ไฟล์ส่วนตัวบนเครื่อง (ห้ามขึ้น git)
- ไฟล์ใหม่ที่ใช้เฉพาะเครื่อง (สคริปต์รัน, compose override, `.env`, คู่มือส่วนตัว) ให้ใส่ใน `.git/info/exclude` ไม่ใช่ `.gitignore` เพราะ `.gitignore` ทั้งทีมใช้ร่วมกัน
- อย่าแก้ไฟล์ที่ทีม track เพื่อความต้องการบนเครื่องตัวเอง ให้ copy เป็น `*.local.*` ที่ถูก exclude แล้วแก้ตัวนั้น
- หลีกเลี่ยง `git update-index --skip-worktree` เพราะจะ block การ checkout เมื่อไฟล์ต่างกันระหว่าง branch ถ้าจำเป็นต้องใช้ ให้ unskip/stash ก่อนสลับ branch

## Commit / branch
- ชื่อ branch: `feature/<ticket>-<slug>`, `fix/<ticket>`, `fix/CVE-<batch>`
- ข้อความ commit แบบ Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `chore: ...`, `test: ...`
- commit ละหนึ่งเรื่อง ห้ามมีไฟล์ local helper ติดไป ให้ตรวจ `git status` และ `git diff --cached --stat` ก่อนทุกครั้ง
- ห้าม `--no-verify` และห้าม force push branch ที่แชร์กับคนอื่น ถ้าจำเป็นให้ใช้ `--force-with-lease` และถามก่อน
- ถ้า push/fetch ติด auth ให้บอกผู้ใช้ อย่าพยายามเลี่ยง

## ก่อน push
ดู skill `full-verify`

---
name: pr-description
description: Write a clear pull request / merge request title and description from the branch diff — what changed, why, how it was tested, risks, and rollout. Use when the user asks to open a PR/MR, write a PR description, or summarize a branch for reviewers.
---

# PR description

1. อ่าน `git log <base>..HEAD` และ `git diff <base>...HEAD --stat` แล้วเปิดดูไฟล์สำคัญ ห้ามเขียนจากชื่อ commit อย่างเดียว
2. ตรวจว่าไม่มีไฟล์ local helper, secret หรือ debug code ติดมาด้วย

## Title
`<type>(<scope>): <สรุปสั้นๆ>` ไม่เกินประมาณ 70 ตัวอักษร พร้อม ticket ID ถ้าทีมใช้

## Body
```markdown
## What
- สิ่งที่เปลี่ยน เป็นข้อๆ ในมุมของ behavior ไม่ใช่รายชื่อไฟล์

## Why
ปัญหาหรือ requirement ที่ทำให้ต้องเปลี่ยน + ลิงก์ ticket/สเปก

## How to test
คำสั่งหรือขั้นตอนที่ reviewer ใช้ตรวจได้ + ผลที่ควรเห็น

## Test results
ผล test ทั้งชุดเทียบ base (ไม่มี fail ใหม่ / รายการที่ fail อยู่แล้วก่อนหน้า)

## Risk & rollout
breaking change, migration, config/flag ใหม่, ลำดับการ deploy, วิธี rollback
```

- เขียนให้คนที่ไม่รู้บริบทอ่านแล้วเข้าใจภายใน 1 นาที
- ภาษาให้ตามที่ทีมใช้ ถ้าไม่แน่ใจให้ถามผู้ใช้
- ห้ามสร้างหรือ push PR เองถ้าผู้ใช้ยังไม่ได้สั่ง

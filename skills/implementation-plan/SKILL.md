---
name: implementation-plan
description: Clarify requirements and write a step-by-step implementation plan before coding a non-trivial feature or change (brainstorm → plan → execute in small verified steps). Use when the user asks for a new feature, a multi-file change, a migration, or says "วางแผน", "plan", "ออกแบบก่อน".
---

# Implementation plan

## 1. เข้าใจโจทย์ (brainstorm)
- ถามทีละข้อเฉพาะสิ่งที่ยังไม่ชัด: เป้าหมาย, ผู้ใช้, input/output, ข้อจำกัด (performance, security, backward compat), สิ่งที่ไม่ต้องทำ
- เสนอ 2-3 แนวทางพร้อม trade-off สั้นๆ แล้ว **แนะนำหนึ่งแนวทาง** พร้อมเหตุผล
- อ่านโค้ดจริงเพื่อยืนยันว่าแนวทางนั้นทำได้ (ห้ามเสนอลอยๆ)

## 2. เขียนแผน
แต่ละ step ต้องเล็กพอที่ทำเสร็จและ verify ได้ในครั้งเดียว และระบุ:
- ไฟล์ที่แก้หรือสร้าง (path จริง)
- สิ่งที่เปลี่ยน
- test ที่ต้องเขียนหรือรัน และผลที่คาดไว้
- ความเสี่ยง หรือสิ่งที่ต้องให้คนอื่นทำ (DevOps, สิทธิ์, flag)

ท้ายแผนให้มี: ลำดับการ deploy/rollback, DoD, รายการสิ่งที่ไม่ทำ

## 3. ทำตามแผน
- ทำทีละ step: เขียน test → implement → verify → ค่อยไป step ถัดไป
- ถ้าแผนผิดระหว่างทาง ให้หยุด อัปเดตแผน แล้วแจ้งผู้ใช้ อย่าเบี่ยงออกไปเงียบๆ
- จบแต่ละ checkpoint ให้สรุปสั้นๆ ว่าเสร็จอะไร และเหลืออะไร

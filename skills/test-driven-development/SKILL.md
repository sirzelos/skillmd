---
name: test-driven-development
description: Implement features and bug fixes test-first (red → green → refactor) in any language. Use when implementing a new feature, fixing a bug, or when the user asks for TDD or "เขียน test ก่อน".
---

# Test-driven development

1. **Red:** เขียน test ที่อธิบาย behavior ที่ต้องการทีละข้อ รันแล้วต้อง **fail ด้วยเหตุผลที่ถูกต้อง** (ไม่ใช่ fail เพราะ import ผิด)
2. **Green:** เขียนโค้ดน้อยที่สุดที่พอให้ test ผ่าน
3. **Refactor:** ทำโค้ดให้สะอาดโดยที่ test ยังผ่าน
4. ทำซ้ำกับ behavior ถัดไป เรียงจาก happy path → edge case → error case

## หลักการ
- test หนึ่งตัวทดสอบ behavior เดียว ชื่อบอก behavior และแบ่งเป็น Arrange-Act-Assert
- mock เฉพาะ boundary (HTTP, clock, queue) อย่า mock ของที่เราเป็นเจ้าของจนไม่ได้ทดสอบอะไรจริง
- bug fix ต้องเขียน test ที่ทำให้ bug เกิดซ้ำก่อนทุกครั้ง
- test ต้อง deterministic: ไม่พึ่งเวลา ลำดับ หรือเครือข่ายจริง และลบเฉพาะข้อมูลที่ตัวเองสร้าง (ห้าม `DELETE FROM table` แบบไม่จำกัด scope)
- ห้ามแก้ test เดิมให้ผ่านโดยไม่เข้าใจว่าทำไมถึง fail
- จบงานให้รันทั้งชุด (`full-verify`)

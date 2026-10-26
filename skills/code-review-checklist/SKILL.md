---
name: code-review-checklist
description: Review a diff/PR (own or a teammate's) for correctness, security, performance, tests, and maintainability, and handle incoming review feedback well. Use when the user asks to review code or a PR, self-review before pushing, or respond to review comments.
---

# Code review checklist

## ก่อนเริ่ม
อ่าน ticket/สเปกให้รู้ว่า PR นี้ตั้งใจทำอะไร แล้วดู `git diff <base>...HEAD` ทั้งหมด ไม่ใช่แค่ไฟล์ที่ดูน่าสนใจ

## ไล่ตามลำดับความสำคัญ
1. **ถูกต้อง:** logic ทำตาม requirement หรือไม่, edge case (null/empty/ซ้ำ/ขอบเขต/timezone), error handling, concurrency/race, transaction boundary
2. **Security:** input validation, injection (SQL/command/path), authz ทุก endpoint, secret หรือ PII ใน log หรือโค้ด, dependency ใหม่ (ดู `secure-coding`)
3. **Breaking change:** API contract, schema/migration, config/env ใหม่, consumer ที่ได้รับผลกระทบ
4. **Performance:** N+1, query ไม่มี index, โหลดทั้งตารางเข้า memory, blocking call ใน async/reactive, loop ที่เรียก network
5. **Test:** มี test ครอบ behavior ใหม่และ bug ที่แก้ไหม, test fail ได้จริงไหมถ้าโค้ดผิด, ไม่ได้แก้ test ให้ผ่านแบบหลอกๆ
6. **อ่านง่าย:** ชื่อ, ขนาด function, duplication, dead code, comment (1-2 บรรทัดเฉพาะ WHY)

## รายงาน
- เรียงจากรุนแรงมากไปน้อย: **Blocker / Should fix / Nit**
- แต่ละข้อ: `file:line`, ปัญหา, สถานการณ์ที่ทำให้พัง, ข้อเสนอแก้
- ไม่แน่ใจให้บอกว่าไม่แน่ใจ และบอกว่าตรวจอะไรไปแล้ว

## เมื่อได้รับ review
- อ่านให้ครบแล้วตรวจกับโค้ดจริงว่าเข้าใจถูก (รีวิวจาก lead ให้ถือว่าถูก แล้วโฟกัสที่วิธีแก้)
- แก้ทีละข้อพร้อม test แล้วตอบทุก comment ว่าแก้อย่างไร หรือมีเหตุผลอะไรถ้าไม่แก้
- ถ้าไม่เห็นด้วย ให้ตอบด้วยหลักฐาน (โค้ด, test, เอกสาร) ไม่ใช่ความเห็น

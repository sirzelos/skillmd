---
name: full-verify
description: Full verification before calling implementation work done, at the end of each implementation day, or before commit/push — run the whole test suite against a base-branch baseline, prove the changed paths work, and check spec/requirement conformance. Use when the user says verify, "เสร็จหรือยัง", end of day, before commit, or "check everything".
---

# Full verification

ใช้ก่อนบอกว่างานเสร็จ ก่อน commit และทุกครั้งที่จบวันของงานหลายวัน ต้องครอบคลุม **งานทุกวันที่ทำมาแล้ว** ไม่ใช่แค่ของวันนี้

## ขั้นตอน
1. **Baseline:** รัน test suite ทั้งชุดบน base branch (ใช้ `git worktree add` แยกออกไป ไม่ต้องสลับ branch ที่ทำงานอยู่) แล้วบันทึกรายการที่ fail
2. **Branch:** รันทั้งชุดบน branch งาน (unit + integration) **ห้ามเลือกไฟล์ test ด้วย grep** เพราะจะพลาด test ที่พังโดยไม่รู้ตัว
3. **Diff:** fail ใหม่ถือเป็น regression ต้องแก้ ส่วน fail ที่มีอยู่แล้วใน baseline ให้แยกรายงาน ถ้าสงสัยว่า flaky ให้รันซ้ำเพื่อยืนยัน
4. **Works:** path ที่เปลี่ยนต้องรันได้จริง (migration up/down, round-trip, parity, endpoint ตอบจริง)
5. **Conforms:** ไล่ AC และ section ในสเปกทีละข้อ ระบุว่า done + หลักฐาน / pending (วันไหน) / deviates (เพราะอะไร)
6. Lint/format/type check ตามภาษา (Python ดู `python-clean-code`, Java ดู `java-spring-clean-code`)

## รายงาน (ตารางสั้น)
| ด้าน | ผล | หลักฐาน |
|---|---|---|
| Tests vs baseline | ไม่มี fail ใหม่ / มี N | คำสั่ง + จำนวน pass/fail |
| Works | ... | ... |
| Spec conformance | x/y done | ... |

- อะไรที่ยังไม่ได้ verify ให้เขียนตรงๆ ว่ายังไม่ได้ verify อย่าเขียนให้ดูเหมือนตรวจแล้ว
- CI อาจไม่ได้รัน test บางกลุ่ม การรันทั้งชุดบนเครื่อง local จึงเป็นด่านสุดท้าย
- test ที่ใช้เวลานานให้รันใน background พร้อม monitor (ดู `long-task-monitor`)
- ถ้า test ต้องเขียน DB ให้ระวังไม่ให้ไปลบข้อมูล local ที่ผู้ใช้ใช้อยู่

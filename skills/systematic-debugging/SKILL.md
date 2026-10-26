---
name: systematic-debugging
description: Find the root cause of a bug, failing test, crash, or error output before changing code — reproduce, isolate, hypothesize, verify, then fix with a regression test. Use when the user reports a bug, pastes an error / stack trace / terminal output, or a test fails unexpectedly.
---

# Systematic debugging

**ห้ามแก้โค้ดก่อนรู้ root cause** เพราะการเดาแล้วแก้ทีละจุดเสียเวลามากกว่า

1. **Reproduce:** หาคำสั่งที่ทำให้ error เกิดซ้ำได้ทุกครั้ง ถ้ายัง reproduce ไม่ได้ให้เก็บข้อมูลเพิ่ม (log, env, version) อย่าเพิ่งแก้
2. **อ่าน error ให้ครบ:** อ่าน stack trace ทั้งหมด ข้อความแรกกับ "Caused by" ตัวสุดท้ายมักสำคัญที่สุด
3. **Isolate:** ลด input และขอบเขตให้เล็กที่สุด เทียบกับสภาพที่ทำงานได้ (`git bisect`, base branch, เครื่องอื่น, ค่า config)
4. **Hypothesis:** ตั้งสมมติฐานทีละข้อ ทำนายว่าถ้าจริงควรเห็นอะไร แล้วทดสอบด้วยการสังเกต (log, debugger, query) ไม่ใช่ด้วยการแก้โค้ด
5. **Root cause:** ถาม "ทำไม" ต่อไปจนถึงต้นเหตุ อย่าหยุดที่อาการ
6. **Fix:** แก้ที่ต้นเหตุจุดเดียว พร้อม test ที่ fail ก่อนแก้และผ่านหลังแก้
7. **Verify:** รัน reproduction เดิม + test ทั้งชุด และตรวจว่าที่อื่นไม่มี pattern เดียวกัน
8. **รายงาน:** สาเหตุ 1-2 บรรทัด, สิ่งที่แก้, วิธีพิสูจน์

ข้อห้าม: ห้าม skip/xfail test เพื่อให้ผ่าน, ห้ามเติม retry/sleep เพื่อกลบอาการ, ห้ามแก้ product code เพื่อแก้ปัญหา env
ถ้าลองไป 3 สมมติฐานแล้วยังไม่เจอ ให้หยุดและสรุปสิ่งที่รู้ให้ผู้ใช้

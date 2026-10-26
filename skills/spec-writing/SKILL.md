---
name: spec-writing
description: Write, revise, or clean up a technical design spec / tech spec / design doc (Thai or English) so it is implementable, testable, and reads like a human wrote it. Use when the user asks to write, review, polish, or finalize a spec, design doc, acceptance criteria (AC), or wiki spec page.
---

# Spec writing

สเปกที่ดีต้องเอาไปทำได้จริง ทดสอบได้จริง และอ่านรู้เรื่องทั้งคนที่เพิ่งเข้าทีมและคนที่รู้โค้ดลึก

## 1. ตรวจกับโค้ดจริงก่อนเขียน
- ก่อนเสนอแนวทางใด ให้อ่านโค้ดจริงบน base branch ห้ามเสนอทางเลือกลอยๆ
- design แต่ละข้อต้องระบุ: โค้ดที่เปลี่ยน (file:line บน base), caller ที่ได้รับผลกระทบ, เหตุผลเรื่อง performance จาก code path จริง (sync/async, round-trip, index)
- บอกด้วยว่าทางเลือกไหนโค้ดยังไม่รองรับถ้าไม่ทำงานเพิ่ม
- อ้างอิงเฉพาะไฟล์ที่มีอยู่ใน repo เป้าหมายจริง ห้ามอ้างไฟล์ที่มีแค่ในโฟลเดอร์ทำงานบนเครื่องเรา
- สเปกคือแผนการเปลี่ยนแปลงบน base branch จริง ไม่ใช่คำอธิบาย branch อ้างอิงอื่น (เช่น เลข migration อาจชนกับ base)
- ตรวจเส้นทาง deploy: ใคร build/push/deploy อะไร และผู้รับงานมีสิทธิ์ทำหรือไม่ (registry, superuser, disk)

## 2. AC ต้องทดสอบได้
AC แต่ละข้อต้องมี environment, คำสั่งหรือ test ที่ใช้, prerequisite (flag, limit, data, สิทธิ์, ใครต้องลงมือ) และเกณฑ์ผ่าน
- ตัดหรือย้าย AC ที่ผู้รับงานรันเองไม่ได้ (ไม่มีสิทธิ์ หรือต้องรอทีมอื่น deploy)
- เช็กว่า metric ให้ตัวเลขนั้นได้จริง (เช่น จะวัด p95 ได้ต้องมี histogram ไม่ใช่แค่ `_count/_sum`)
- เช็ก flag/limit บน env ที่อาจ block การทดสอบ
- AC ที่เป็นขั้นตอนทำงาน ("แนบผลใน ticket") ให้เปลี่ยนเป็น deliverable
- การเปลี่ยน signature (เช่น sync→async) ให้ประเมินจำนวน test เดิมที่จะพัง
- ทำ simulation คร่าวๆ พิสูจน์ก่อนส่งถ้าทำได้ และพิสูจน์ด้วยข้อมูลจริง ไม่ใช่แค่ข้อมูลสุ่ม

## 3. ภาษาและโครงสร้าง
- แต่ละประเด็นขึ้นด้วยประโยคภาษาคนว่าทำอะไร ทำไม แล้วค่อยใส่รายละเอียดเทคนิค (file:line, flag) ในวงเล็บหรือต่อท้าย
- เขียนเป็นประโยคเต็ม ไม่ใช้ bullet แบบป้ายสั้นๆ ไม่มีกลิ่น AI ไม่มีคำฟุ่มเฟือย ใช้ภาษาไทยที่เป็นธรรมชาติและเป็นทางการ
- อธิบาย scope (ทำ/ไม่ทำ, ส่วนไหนเป็นงานแยก) **ที่ section Scope ที่เดียว**
- อย่าโปรยเลข sprint/ticket ทั่วเอกสาร (เช่น "S3" ชนกับ S3 object store) ให้ใช้คำว่า "งานแยก", "เฟสถัดไป" แทน
- Summary (§0) ห้ามมี file:line ให้อ้าง § และชื่อ function/class แทน
- สเปกต้องอ่านจบในตัว ไม่อ้าง v1/v2 ข้อเท็จจริงที่เปลี่ยนให้เขียนเป็นปัจจุบันใน section ที่เกี่ยวข้อง
- ห้ามมีเสียงบทสนทนาในเนื้อหา: ชื่อ lead, "รอ DevOps confirm", สภาพเครื่อง local, ผลการเช็กส่วนตัว, การย้ายไฟล์ในเครื่อง (lead ปรากฏได้แค่ในช่อง source ของ Changelog)
- สเปกภาษาอังกฤษห้ามอ้างถึงฉบับภาษาไทย
- ไม่ต้องใส่ Traceability matrix หรือ port plan ถ้าไม่ได้ขอ ส่วนที่ควรมี: Impact assessment, Breaking-change check, Definition of Done, Dependencies & risks, Error code catalogue, Decision register (`ID | Decision | Why`)
- ตัดสิ่งที่ไม่ใช่เนื้อหา (revision history, badge จากการ review, open question ที่ปิดแล้วให้ย้ายเป็น Known limitations) แต่ห้ามทำเนื้อหาหาย
- ถ้ามีสเปกของคนอื่นในทีม ให้เปิดดูและเขียนด้วยโทนเดียวกัน

## 4. Review จาก lead
ถือว่าผลรีวิวจาก lead ถูกต้อง ให้นำไปแก้ได้เลย อ่านโค้ดเพื่อหาวิธีแก้ ไม่ใช่เพื่อหาว่ารีวิวผิดหรือไม่

## 5. เมื่อผู้ใช้อนุมัติ draft
อย่าวาง draft ลงไปตรงๆ ให้เกลาภาษาให้อ่านง่ายและเป็นทางการก่อนเสมอ

## 6. Validation pass (ทำทุกครั้งหลังแก้)
1. ไม่มีกลิ่น AI
2. คนใหม่อ่านครั้งแรกแล้วเข้าใจ
3. คนเก่ายังได้รายละเอียดลึก
4. grep หาเสียงบทสนทนา: `lead|confirm|loaded|tip|Thai|ภาระ`
5. เลข section/case ต่อเนื่อง ไม่มีช่องว่าง, cross-ref §x ถูก, anchor ใน TOC ตรงกับ `id=`, div ใน HTML ปิดครบ
6. รายงานผลการตรวจให้ผู้ใช้

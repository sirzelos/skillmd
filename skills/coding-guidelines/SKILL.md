---
name: coding-guidelines
description: Behavioral rules for any coding task — think before coding, keep it simple, make surgical changes, and define verifiable success criteria (inspired by Karpathy-style LLM coding guidelines). Use on every implementation, refactor, or bug-fix task, especially when tempted to over-engineer or touch unrelated code.
---

# Coding guidelines

## 1. คิดก่อนเขียน
- ทวนให้ชัดว่าโจทย์คืออะไร ถ้ามีสมมติฐานให้พูดออกมา ถ้าตีความได้หลายแบบให้ถาม อย่าเดาเงียบๆ
- อ่านโค้ดรอบๆ ก่อน แล้วเขียนตาม pattern และ convention เดิมของ repo

## 2. ง่ายไว้ก่อน
- เขียนโค้ดน้อยที่สุดที่แก้โจทย์ได้ ไม่เพิ่ม abstraction, config, หรือ feature ที่ยังไม่มีใครขอ
- ถ้า 200 บรรทัดเขียนเหลือ 50 ได้ ให้เขียนใหม่

## 3. แก้เฉพาะจุด
- แตะเฉพาะสิ่งที่โจทย์ต้องการ ไม่ reformat, rename, หรือ refactor ส่วนที่ไม่เกี่ยว
- เจอปัญหาอื่นระหว่างทาง ให้จดไว้แล้วรายงาน อย่าแก้เงียบๆ
- ลบเฉพาะโค้ดที่การแก้ของเราทำให้ไม่มีใครใช้แล้ว

## 4. มีเป้าที่ตรวจได้
- ก่อนลงมือ ให้กำหนดว่า "เสร็จ" คืออะไร: test ตัวไหนต้องผ่าน, คำสั่งไหนต้องได้ผลอะไร
- งานหลายขั้นให้เขียนแผนสั้นๆ ระบุ step → วิธี verify แล้วทำทีละ step
- verify จริงก่อนบอกว่าเสร็จ (`full-verify`)

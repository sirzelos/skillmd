---
name: secure-coding
description: Apply and check secure-coding practices (OWASP Top 10 / ASVS, secrets, PII, authn/authz, injection, SSRF, path traversal, dependency risk) when writing or reviewing backend code. Use when touching auth, user input, file handling, external calls, personal or financial data, or when the user asks for a security check.
---

# Secure coding

## Input และ injection
- validate ทุก input ที่ boundary (type, length, range, allow-list) ห้ามเชื่อข้อมูลจาก client
- SQL ใช้ parameterized query หรือ ORM ห้ามต่อ string; command ใช้ list args ห้ามใช้ `shell=True`
- path จาก user ต้อง normalize แล้วตรวจว่ายังอยู่ใต้ base dir (ระวัง ZIP-Slip ตอน extract archive และ path separator ของ Windows)
- URL ที่ server ไปเรียกเองต้องกัน SSRF: allow-list host และห้าม IP ภายในหรือ metadata
- ปิด XXE ใน XML parser และห้าม deserialize object จากแหล่งที่ไม่น่าเชื่อถือ (pickle, Java native serialization)

## Auth
- ตรวจ authorization ที่ทุก endpoint และทุก resource (กัน IDOR: ต้องเช็กว่าเป็นเจ้าของ `id` นั้นจริง)
- password ใช้ bcrypt/argon2; token มีอายุสั้นและตรวจ signature, `exp`, `aud`
- rate limit กับ login และ endpoint ที่แพง

## ข้อมูลลับ และ PII
- ห้าม hardcode secret ห้าม commit `.env` ให้ใช้ vault หรือ secret manager
- ห้าม log password, token, เลขบัตร, เลขบัญชี, เลขบัตรประชาชน ถ้าจำเป็นให้ mask
- เข้ารหัสข้อมูลอ่อนไหวทั้งตอน at rest และ in transit (TLS) และเก็บเท่าที่จำเป็น

## Dependency และ config
- อัปเดต dependency ที่มี CVE (`cve-fix`) และ pin version ใน lock file
- container ไม่รันเป็น root, ใช้ base image ขนาดเล็ก, ปิด debug และ stack trace ใน production
- ตั้ง security header (CSP, HSTS) และ CORS แบบ allow-list

## ตอนรีวิว
ไล่ checklist ข้างบนกับ diff แล้วรายงานแต่ละข้อเป็น `file:line` + วิธีโจมตีที่เป็นไปได้ + วิธีแก้

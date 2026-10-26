---
name: api-design
description: Design or review REST/HTTP APIs and event contracts — resource naming, status codes, error format (RFC 9457), pagination, versioning, idempotency, OpenAPI. Use when creating or changing an endpoint, API contract, OpenAPI spec, or Kafka event schema.
---

# API design

## REST
- resource เป็นคำนามพหูพจน์: `GET /accounts/{id}/transactions` ไม่ใช่ `/getTransactions`
- method: GET อ่าน (ไม่มี side effect), POST สร้าง/สั่งงาน, PUT แทนที่ทั้งก้อน, PATCH แก้บางส่วน, DELETE ลบ
- status: 200/201 (+`Location`)/204, 400 validation, 401 ไม่ได้ login, 403 ไม่มีสิทธิ์, 404, 409 conflict, 422 business rule, 429 rate limit, 5xx เฉพาะความผิดฝั่ง server
- error ใช้รูปแบบเดียวทั้งระบบ (RFC 9457 `application/problem+json`): `type`, `title`, `status`, `detail`, `instance` + `code` ของระบบ + `traceId` ห้ามส่ง stack trace ออกไป
- JSON ใช้ camelCase ให้สม่ำเสมอ, เวลาเป็น ISO-8601 UTC, เงินเป็น string/decimal พร้อม currency
- list ต้องมี pagination (cursor สำหรับข้อมูลใหญ่, page/size สำหรับข้อมูลเล็ก) พร้อม max size, filter และ sort ผ่าน query param

## ความทนทาน
- POST ที่สั่งงานสำคัญ (โอนเงิน, ชำระเงิน) ต้องรับ `Idempotency-Key` และเก็บผลไว้คืนซ้ำ
- ใช้ optimistic locking ด้วย `ETag`/`If-Match` หรือ version field เมื่อมีการแก้ไขพร้อมกัน
- ตั้ง timeout ทุก outbound call พร้อม retry เฉพาะ error ที่ retry ได้ (มี backoff + jitter) และ circuit breaker

## Versioning และ compatibility
- เพิ่ม field ใหม่ได้ (consumer ต้อง ignore field ที่ไม่รู้จัก) แต่ห้ามลบหรือเปลี่ยนความหมาย field เดิมใน version เดียวกัน
- breaking change ให้ออก `/v2` หรือ version ใน header แล้วประกาศ deprecation พร้อมวันเลิกใช้
- event (Kafka) ใช้ schema registry, ตรวจ backward compatibility และใส่ `eventId`, `occurredAt`, `version`

## เอกสาร
- อัปเดต OpenAPI ไปพร้อมโค้ด มีตัวอย่าง request/response และ error
- มี contract test หรือ integration test ต่อ endpoint

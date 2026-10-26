---
name: database-migration
description: Write and review safe database schema/data migrations (Alembic, Flyway, Liquibase) for PostgreSQL/MySQL/SQL Server — zero-downtime expand/contract, locking, backfill, rollback, and verification. Use when adding or changing a table, column, index, constraint, or data migration.
---

# Database migration

## ก่อนเขียน
- ดู head ปัจจุบันบน base branch และเลข migration ล่าสุด ต้องไม่ชนกับ branch อื่น (rebase ก่อน merge แล้วตรวจอีกรอบ)
- ประเมินขนาดตาราง และระยะเวลาที่ lock ใน production

## Zero-downtime (expand → migrate → contract)
1. **Expand:** เพิ่มของใหม่ที่ไม่ทำให้โค้ดเดิมพัง (column ที่ nullable หรือมี default, ตารางใหม่)
2. **Deploy โค้ด** ที่เขียนทั้งของเดิมและของใหม่ (dual-write) หรืออ่านแบบรองรับทั้งสองแบบ
3. **Backfill** เป็น batch เล็ก พร้อม checkpoint และรันซ้ำได้ (idempotent) ห้ามอยู่ใน transaction เดียวกับ DDL
4. **Contract:** ลบของเดิมใน release ถัดไป หลังจากยืนยันแล้วว่าไม่มีใครใช้

## PostgreSQL ที่ต้องระวัง
- `CREATE INDEX CONCURRENTLY` (ต้องอยู่นอก transaction) แทน `CREATE INDEX` บนตารางใหญ่
- ADD COLUMN ที่มี default คงที่ทำได้เร็ว แต่ default ที่ volatile หรือการเปลี่ยน type จะ rewrite ทั้งตาราง
- เพิ่ม constraint ด้วย `NOT VALID` แล้วค่อย `VALIDATE CONSTRAINT`; NOT NULL ให้ผ่าน check constraint ก่อน
- ตั้ง `lock_timeout` / `statement_timeout` ใน migration
- `CREATE EXTENSION` ต้องใช้สิทธิ์ superuser ให้ตรวจว่า env จริงมีสิทธิ์นี้

## Rollback และ verify
- ทุก migration ต้องมี downgrade หรือมีแผนย้อนกลับที่เขียนไว้ (ถ้าย้อนไม่ได้ เช่นลบข้อมูล ต้องบอกชัด)
- ทดสอบ upgrade → downgrade → upgrade บน DB ที่มีข้อมูลจริง (สำเนา) ไม่ใช่ DB เปล่า
- ตรวจ test ที่ pin head ของ migration graph และ test ที่ลบข้อมูลในตาราง
- เก็บ query ตรวจผลหลัง migrate (จำนวนแถว, null, index ถูกใช้ด้วย `EXPLAIN`)

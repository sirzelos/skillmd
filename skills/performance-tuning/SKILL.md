---
name: performance-tuning
description: Diagnose and fix backend performance problems — measure first, then find the bottleneck in SQL (EXPLAIN ANALYZE, indexes, N+1), JVM/Python CPU and memory (profilers, GC, heap dumps), connection pools, caching, and concurrency. Use when something is slow, times out, uses too much memory/CPU, or the user asks to optimize.
---

# Performance tuning

**วัดก่อนแก้เสมอ** ห้ามปรับจากความรู้สึก

1. **กำหนดเป้า:** metric ไหน (p95 latency, throughput, memory) ค่าปัจจุบันเท่าไร เป้าหมายเท่าไร
2. **Reproduce + วัด baseline** ด้วยข้อมูลและโหลดที่ใกล้ของจริง (k6, JMeter, Gatling, locust)
3. **หาคอขวด:** ใช้ trace/APM ดูว่าเวลาหมดไปตรงไหน
   - DB: `EXPLAIN (ANALYZE, BUFFERS)`, `pg_stat_statements`, slow query log, N+1 (นับจำนวน query ต่อ request)
   - JVM: async-profiler/JFR, GC log, heap dump (Eclipse MAT), thread dump เมื่อค้าง
   - Python: py-spy, cProfile, tracemalloc
   - Pool: connection หรือ thread pool เต็ม (รอ connection), Kafka consumer lag
4. **แก้ทีละจุด** ที่หนักที่สุดก่อน แล้ววัดซ้ำทุกครั้ง
5. **รายงาน:** ก่อน/หลังเป็นตัวเลข + สาเหตุ + สิ่งที่แก้ + ผลข้างเคียง

## สาเหตุที่เจอบ่อย
- query ไม่มี index หรือ index ที่ไม่ถูกใช้ (function บน column, type ไม่ตรง, `LIKE '%x'`)
- ดึงข้อมูลเกิน (`SELECT *`, ไม่มี pagination, โหลด collection แบบ eager)
- เรียก network หรือ DB ใน loop แทนการทำ batch
- blocking call บน event loop (WebFlux/asyncio)
- cache ไม่มี TTL หรือ hit ratio ต่ำ, เกิด cache stampede
- object ใหญ่ค้างใน memory, ใช้ static collection เป็น cache โดยไม่มีขอบเขต
- vector/ANN search ที่ filter แล้วได้ผลน้อยกว่าที่ขอ (ต้องเพิ่ม `ef_search` หรือใช้ iterative scan)

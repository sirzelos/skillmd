---
name: observability
description: Add or review logging, metrics, tracing, and alerts (structured JSON logs, correlation/trace IDs, Prometheus/Micrometer metrics, OpenTelemetry, Kibana/APM/Grafana dashboards, SLOs). Use when building a new service or flow, debugging production issues, or when the user asks about logs, metrics, monitoring, or alerts.
---

# Observability

## Log
- ใช้ structured log (JSON) ที่มี `timestamp`, `level`, `service`, `traceId`, `spanId`, `event` และ context สำคัญ (เช่น `accountId` ที่ mask แล้ว)
- level: ERROR = ต้องมีคนดู, WARN = ผิดปกติแต่ยังทำงานได้, INFO = เหตุการณ์ทาง business, DEBUG = ปิดใน production
- log exception ครั้งเดียว ณ จุดที่จัดการ พร้อม stack trace อย่า log ซ้ำทุกชั้น
- ห้าม log PII/secret (ดู `secure-coding`) และห้าม log ใน loop ที่รันถี่ๆ

## Metric (RED + USE)
- ต่อ endpoint และต่อ consumer: Rate, Errors, Duration ใช้ **histogram** เพื่อให้คำนวณ p95/p99 ได้ (`_count/_sum` อย่างเดียวคำนวณ percentile ไม่ได้)
- resource: connection pool, thread, queue lag (Kafka consumer lag), cache hit ratio
- label ต้องมี cardinality ต่ำ ห้ามใส่ userId หรือ requestId เป็น label
- ตรวจว่า metric ออกมาที่ `/metrics` จริง และ scraper ดึงไปได้

## Trace
- ส่งต่อ trace context (W3C `traceparent`) ผ่าน HTTP และ header ของ Kafka message
- สร้าง span รอบ DB call, external call และงานที่ใช้เวลานาน

## Alert และ SLO
- alert จากอาการที่ผู้ใช้เจอ (error rate, latency เทียบ SLO, lag) ไม่ใช่จาก CPU อย่างเดียว
- ทุก alert ต้องมี runbook สั้นๆ ว่าดูอะไรต่อและแก้อย่างไร
- dashboard ต่อ service: traffic, error, latency p95, saturation, deploy marker

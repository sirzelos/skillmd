---
name: java-spring-clean-code
description: Review and clean Java / Spring Boot / WebFlux / Kafka / Redis code to common industry standards (Google Java Style, Spotless, Checkstyle, SpotBugs, Sonar rules, JUnit 5 + Mockito, Testcontainers) before a change is done. Use when the user asks to review, refactor, lint, or verify Java/Spring code, or at the end of a Java implementation step.
---

# Java / Spring clean code

## เครื่องมือ (ใช้ตัวที่โปรเจกต์มีอยู่ อย่าเพิ่ม config ใหม่เอง)
- Format: `mvn spotless:apply` / `./gradlew spotlessApply` (google-java-format)
- Static analysis: Checkstyle, SpotBugs, PMD, Sonar
- Test: `mvn verify` / `./gradlew check` (JUnit 5, Mockito, AssertJ, Testcontainers)

## Checklist
**โครงสร้าง**
- Controller บาง → Service (business logic) → Repository ห้ามมี logic ใน controller/entity
- ใช้ constructor injection + `final` field (ห้าม field `@Autowired`)
- DTO แยกจาก Entity (record/MapStruct) และ validate input ด้วย `@Valid` + Bean Validation
- Config ใช้ `@ConfigurationProperties` ห้าม hardcode ค่า secret ต้องมาจาก env/vault

**ความถูกต้อง**
- `@Transactional` อยู่ที่ public method ของ service ระวัง self-invocation, query อ่านอย่างเดียวใช้ `readOnly = true`
- ระวัง N+1 (`@EntityGraph`/fetch join) และทำ pagination กับ list ใหญ่
- Optional ห้าม `.get()` ตรงๆ และห้ามคืน null collection
- Exception จัดการรวมที่ `@RestControllerAdvice` ห้ามกลืน exception, log พร้อม context แต่ห้าม log PII/เลขบัตร/เลขบัญชี
- เงินใช้ `BigDecimal` + RoundingMode ที่กำหนด ห้ามใช้ double
- เวลาใช้ `java.time` และระบุ timezone ชัดเจน

**WebFlux / Reactive**
- ห้าม block (`.block()`, JDBC, `Thread.sleep`) บน event loop ถ้าจำเป็นให้ใช้ `Schedulers.boundedElastic()`
- ห้าม subscribe ซ้อนกัน ให้ใช้ `flatMap`/`zip` และตั้ง timeout/retry พร้อม backoff

**Kafka**
- consumer ต้อง idempotent (dedupe ด้วย key/eventId) ตั้ง error handler + DLT
- commit offset หลังประมวลผลสำเร็จ producer ใช้ `acks=all` + `enable.idempotence=true`
- schema ต้อง backward compatible

**Redis**: ตั้ง TTL ทุก key, กำหนด key naming, คิดเรื่อง cache stampede และ invalidation

**Test**
- unit test ต่อ service (Mockito) และ integration test ใช้ Testcontainers ไม่ใช้ H2 แทน DB จริง
- ชื่อ test บอก behavior เช่น `shouldRejectWhenBalanceInsufficient`
- ทุก bug fix ต้องมี test ที่ fail ก่อนแก้

**สไตล์**: method สั้นและทำอย่างเดียว, ชื่อสื่อความหมาย, comment 1-2 บรรทัดเฉพาะ WHY, ไม่มีโค้ดที่ comment ทิ้งไว้

## จบงาน
รัน format + static analysis + test ทั้งชุด แล้วรายงานผล (ดู `full-verify`)

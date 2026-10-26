---
name: long-task-monitor
description: Run long operations (installs, builds, uv sync, npm install, test suites, container startup, downloads, migrations) in the background with heartbeat progress and an explicit success/failure signal, so the user never has to ask whether it hung. Use whenever a command may take more than about 30 seconds.
---

# Long task monitor

1. รันคำสั่งใน background และเขียน log ลงไฟล์: `cmd > <log> 2>&1; echo "EXIT=$?" >> <log>`
2. ตั้ง monitor/heartbeat ทุก 60-120 วินาที เช่น process ยังอยู่ไหม, log กี่บรรทัด, ขนาดไฟล์โตขึ้นไหม, test ผ่านไปกี่ตัว
3. filter ต้องจับทั้ง success และ **failure signature** (`error|failed|Traceback|EXIT=[1-9]`) เพราะการเงียบไม่ได้แปลว่าสำเร็จ
4. ระหว่างรอให้อัปเดตสั้นๆ ถ้าผู้ใช้ถาม "ถึงไหนแล้ว / ติดอะไร" ให้ตอบสถานะก่อน แล้วค่อยบอก blocker
5. จบแล้วรายงานบรรทัดเดียว: ผ่านหรือไม่ผ่าน, ใช้เวลาเท่าไร, ขั้นตอนต่อไป
6. หยุดงานของเราด้วย PID ที่จดไว้เท่านั้น **ห้าม `pkill -f`** เพราะจะไปฆ่างานที่ผู้ใช้รันเองด้วย

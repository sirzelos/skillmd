---
name: dockerfile-best-practices
description: Write or review Dockerfiles and docker/podman compose files — small secure images, multi-stage builds, layer caching, non-root user, healthchecks, pinned versions. Use when creating or changing a Dockerfile, compose file, or container image, or when an image is too big, slow to build, or flagged by a scanner.
---

# Dockerfile best practices

## Image
- ใช้ multi-stage: stage build มี compiler/JDK/dev deps ส่วน stage runtime มีแค่สิ่งที่ต้องรัน (JRE, distroless, slim, alpine ถ้า lib เข้ากันได้)
- pin base image ด้วย tag ที่ระบุเวอร์ชัน (หรือ digest) ห้ามใช้ `latest` และใช้ชื่อเต็ม `docker.io/library/...` (podman ไม่เดา registry ให้)
- รันเป็น non-root ด้วย `USER 10001` และกำหนด owner ของไฟล์ด้วย `COPY --chown`
- ห้ามใส่ secret ใน image หรือ build arg ให้ใช้ BuildKit `--mount=type=secret`

## Cache และขนาด
- copy ไฟล์ dependency (`pom.xml`, `pyproject.toml` + lock, `package*.json`) แล้วติดตั้งก่อน copy source เพื่อให้ cache ของ layer dependency ถูกใช้ซ้ำ
- รวม `apt-get update && apt-get install --no-install-recommends ... && rm -rf /var/lib/apt/lists/*` ไว้ใน `RUN` เดียว
- มี `.dockerignore` (`.git`, `node_modules`, `.venv`, `target`, `.env`)

## Runtime
- ใช้ exec form `ENTRYPOINT ["java","-jar","app.jar"]` เพื่อให้ process ได้รับ SIGTERM และ shutdown อย่างนุ่มนวล
- JVM ใน container ใช้ `-XX:MaxRAMPercentage=75` แทนการกำหนด `-Xmx` ตายตัว
- มี `HEALTHCHECK` หรือ healthcheck ใน compose ที่เรียก endpoint จริง และใช้ `depends_on: condition: service_healthy`
- ตั้ง memory/cpu limit และ `security_opt: no-new-privileges` (podman 3.x ไม่รับ `:true`)

## ตรวจ
- `trivy image <img>` หรือ `podman build` แล้วดูขนาดด้วย `podman images`
- `hadolint Dockerfile` ถ้ามี

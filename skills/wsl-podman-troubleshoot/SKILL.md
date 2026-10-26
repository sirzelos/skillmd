---
name: wsl-podman-troubleshoot
description: Troubleshoot local container dev on a locked-down corporate Windows machine — WSL2, podman / podman-compose (old 3.x in Ubuntu WSL or podman machine), disk-full read-only ext4, VHDX compaction, stale port DNAT, cgroup/permission errors. Use when local containers won't start, ports don't connect, WSL hangs, or the C: drive is full.
---

# WSL + Podman troubleshooting (เครื่อง Windows ของบริษัทที่ไม่มีสิทธิ์ admin)

## กฎเหล็ก
- **ห้าม kill process wsl/wslservice** เพราะ service จะค้างใน StopPending และต้อง restart Windows ให้ใช้ `wsl --shutdown` เท่านั้น
- ห้าม `podman system prune --volumes` เพราะข้อมูล DB ใน dev จะหายหมด ให้ใช้ `prune -af` แทน
- container ที่ไม่ใช่ของเรา: หยุดได้เฉพาะเมื่อมัน block งาน และต้อง start คืนให้ทุกครั้ง

## เช็กก่อน
`podman --version`, `wsl -l -v`, `podman info`, `df -h /` (ใน WSL), พื้นที่ว่างของ C:

## อาการ → วิธีแก้ (podman 3.4.x ใน Ubuntu WSL)
| อาการ | แก้ |
|---|---|
| ชื่อ image สั้น (`postgres`) หาไม่เจอ | `/etc/containers/registries.conf.d/x.conf`: `unqualified-search-registries = ["docker.io"]` |
| `plugin firewall does not support config version 1.0.0` | `sed -i 's/"1.0.0"/"0.4.0"/' /etc/cni/net.d/<net>.conflist` |
| `invalid --security-opt` | 3.4 รับเฉพาะ `no-new-privileges` (ไม่รับ `:true`) ให้ patch บนเครื่องตัวเอง ห้าม commit |
| `could not find cgroup mount` | ครอบคำสั่งด้วย `systemd-run --scope --quiet podman ...` |
| port 5432/6379 ชนกัน | `sudo systemctl disable --now postgresql redis-server` ใน WSL |
| volume `permission denied` (เช่น uid 10001) | `chown -R <uid>:<uid> /var/lib/containers/storage/volumes/<vol>/_data` |
| container หากันด้วยชื่อไม่เจอ (dnsname) | ให้ app บน host ใช้ `127.0.0.1:PORT` หรือ `podman network connect --alias` |
| ต่อ port ที่ publish แล้ว connection หลุด แต่ต่อ IP ของ container ตรงๆ ได้ | DNAT ค้างจาก container เก่า: `sudo iptables -t nat -S \| grep 'DNAT.*<port>'` ถ้ามีมากกว่า 1 บรรทัดให้ลบ chain `CNI-DN-*` ที่ค้าง หรือ `wsl --shutdown` |
| `read-only file system` หรือ panic ตอน build | ดิสก์ C: เต็ม ทำให้ VHDX ขยายไม่ได้: `wsl --shutdown` แล้วคืนพื้นที่ (ดูด้านล่าง) |
| image ไม่มีของใหม่หลัง pull branch | คำสั่ง up ไม่ได้ `--build` ให้ `podman build` image นั้นใหม่แล้ว recreate container |
| Go template ของ `podman inspect` คืนค่าว่าง | parse JSON ของ `podman inspect` ด้วย python แทน |

ถ้าใช้ podman 4 ขึ้นไป (podman machine) ได้ ปัญหาส่วนใหญ่ข้างบนจะหายไป

## คืนพื้นที่ C:
1. ใน WSL: `podman ps -a --external` แล้วลบ buildah container ที่ค้างด้วย `podman rm --storage <id>`, `podman image prune -af`, `sudo journalctl --vacuum-size=100M`, `uv cache clean`
2. `sudo fstrim -v /`
3. `wsl --shutdown` แล้ว **รัน `diskpart /s <script>` ทันที** (WSL จะ lock ไฟล์คืนภายในไม่กี่วินาที):
   ```
   select vdisk file="%LOCALAPPDATA%\Packages\<Ubuntu-package>\LocalState\ext4.vhdx"
   attach vdisk readonly
   compact vdisk
   detach vdisk
   ```
   ถ้าขึ้น "file in use" ให้ poll จนเปิดไฟล์แบบ exclusive ได้ แล้วค่อยรัน
4. ห้ามใช้ `wsl --manage --set-sparse` (เสี่ยงข้อมูลเสียหาย)
5. start container คืน

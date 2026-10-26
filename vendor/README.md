# Vendored skills

Skill ยอดนิยมจากภายนอกที่ license อนุญาตให้แจกต่อได้ คัดลอกมาโดยไม่ได้แก้ไขเนื้อหา อัปเดตจากต้นทางด้วย `./update-vendor.sh`

| โฟลเดอร์ | ต้นทาง | Commit | License |
|---|---|---|---|
| `superpowers/` | [obra/superpowers](https://github.com/obra/superpowers) | `2ce8aa1` | MIT (`superpowers/LICENSE`) |
| `anthropic/` | [anthropics/skills](https://github.com/anthropics/skills) | `dbd4588` | Apache-2.0 (`LICENSE.txt` ในแต่ละ skill) |
| `karpathy/` | [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) | `2c60614` | MIT (ตาม README ของต้นทาง) |
| `composio/` | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | `be2a406` | Apache-2.0 (ตาม README ของต้นทาง) |

## ที่ไม่ได้ใส่
- `docx`, `pdf`, `pptx`, `xlsx` ของ Anthropic: license เป็น "All rights reserved" แจกต่อไม่ได้ ชุดนี้ sync มาจากบัญชี claude.ai ให้เอง หรือติดตั้งด้วย `/plugin install document-skills@anthropic-agent-skills`
- `doc-coauthoring` ของ Anthropic: ไม่มีไฟล์ license
- skill ของ Composio ที่ต้องใช้บัญชี Composio (`connect-apps`) และตัวที่ไม่เกี่ยวกับงาน dev

## หมายเหตุ
- skill ของ Superpowers อ้างถึงกันเองในรูป `superpowers:<name>` เมื่อติดตั้งเป็น skill ธรรมดา ชื่อจะไม่มี prefix นี้ แต่ Claude ยังหาเจอจากชื่อ skill ถ้าอยากได้ hooks ครบตามต้นทาง ให้ติดตั้งเป็น plugin แทน: `/plugin install superpowers@claude-plugins-official`
- `systematic-debugging` และ `test-driven-development` ใช้ของ Superpowers ส่วนกฎเฉพาะของเราอยู่ใน `global/CLAUDE.md`

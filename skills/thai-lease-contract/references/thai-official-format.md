# Thai official-document format for Word (รูปแบบเอกสารแบบราชการ)

Based on ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526 (amended up to 2564), as applied in agency typing manuals (see sources.md). A contract is not a หนังสือราชการ, so there is no Garuda emblem and no "ที่ / เรื่อง / เรียน" layout. It uses the **same typographic standard**, which makes it look like a formal government-grade document. `scripts/build_docx.js` applies all of this automatically.

## Page & type

| Item | Standard | In build_docx.js |
|---|---|---|
| Paper | A4 (21 × 29.7 cm) | ✔ |
| Margins | **left 3 cm, right 2 cm, top 2.5 cm, bottom 2.5 cm** (some agencies use 2 cm bottom) | ✔ (`--margins` to override) |
| Font | **TH SarabunIT๙** (official; has Thai digits) or TH Sarabun New / TH SarabunPSK | default `TH Sarabun New`; `--font "TH SarabunIT๙"` |
| Body size | **16 pt** | ✔ |
| Document title | 20–24 pt bold, centred | `#` = 20 pt bold |
| Line spacing | single (1.0). Extra **6 pt before** between paragraphs/sections | ✔ |
| Paragraph indent | **2.5 cm first-line indent** from the left margin. Wrapped lines return to the margin. | ✔ |
| Sub-items | **Hanging indent**: the number (๑.๑ / (๑)) sits at 2.5 cm, aligned with the paragraph indent. The text and every wrapped line start at 3.75 cm. Level 2 is 1.25 cm deeper. Un-numbered lines at a level are block-indented to that text column. (The old "first line deeper, wrapped lines back to the margin" layout reads as a staircase. Don't use it.) | `-`, `--` |
| Alignment | Thai distributed (`thaiDistribute`) so both edges are even without stretching Latin spacing | ✔ |
| Numerals | Government documents prefer **Thai digits (๐–๙)**. Keep Arabic digits where people must copy them exactly (bank account, ID no.) if the user wants. | default Thai digits; `` `...` `` keeps Arabic; `--arabic` turns conversion off |
| Page number | From page 2: top centre `- ๒ -` (สารบรรณ style). For contracts also add a footer "หน้า ๑/๖" so missing pages are obvious. | both ✔ |
| Signature | Start the signature block **from the centre of the page** to the right. Name in brackets under the line; 3 blank lines between the closing text and the signature for real signing. | `::sign` |
| Continuation | If a page ends mid-thought, ระเบียบ style writes the next 2–3 syllables at the bottom right followed by `…` (`/ระหว่างบรรทัด...`). Optional for contracts. | not needed (footer pages) |

## Contract-specific conventions (เพิ่มสำหรับสัญญา)

- Title at the top centre: **สัญญาเช่าบ้าน** (optionally a contract number `สัญญาเลขที่ …/๒๕๖๙` at top right).
- "ทำที่ …" and "วันที่ … เดือน … พ.ศ. …" right-aligned, before the parties paragraph.
- A **stamp duty box** (กรอบติดอากรแสตมป์), about 3 × 3.5 cm, at the top right of page 1. Text: "ติดอากรแสตมป์ … บาท".
- Each clause is "**ข้อ ๑** …" (bold number) with a 2.5 cm indent. Sub-clauses "๑.๑", "๑.๒".
- **Penalty / default / forfeiture clauses: bold or underline** (required for OCPB-controlled contracts, good practice for all).
- Footer on every page: initials line `ลงชื่อ……………ผู้ให้เช่า   ลงชื่อ……………ผู้เช่า` plus `หน้า X/Y`.
- End with the clause "สัญญานี้ทำขึ้นเป็นสองฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความโดยละเอียดตลอดแล้ว จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน และต่างยึดถือไว้ฝ่ายละหนึ่งฉบับ".
- Signature blocks: ผู้ให้เช่า | ผู้เช่า on one row, then พยาน | พยาน on the next.
- Annexes (เอกสารแนบท้ายสัญญา) start on a new page. Each annex has a heading "เอกสารแนบท้ายสัญญาหมายเลข ๑" and the parties sign or initial it.
- Tables (inventory): 16 pt, header row shaded light grey, borders 0.5 pt. Columns: ลำดับ | รายการ | ยี่ห้อ/รุ่น | จำนวน | สภาพ | หมายเหตุ.

## Markup understood by `scripts/build_docx.js`

```
::stamp ๑๔๔                 stamp box top-right with "ติดอากรแสตมป์ ๑๔๔ บาท"
::right สัญญาเลขที่ ๐๑/๒๕๖๙   right-aligned line
# สัญญาเช่าบ้าน              centred bold 20 pt title
## เอกสารแนบท้ายสัญญา        centred bold 18 pt sub-title
### ข้อ ๑ ทรัพย์สินที่เช่า      bold clause heading (6 pt before, no indent)
plain text                   body paragraph, 2.5 cm first-line indent, thai-distributed
::noindent text              body paragraph with no indent
::center text                centred line
- ๑.๑ text                   sub-item level 1 (number 2.5 cm, text column 3.75 cm, hanging)
-- (๑) text                  sub-item level 2 (number 3.75 cm, text column 5 cm); un-numbered → block at 5 cm
| a | b | c |                 table (first row = header; separator row |---| optional)
::sign ผู้ให้เช่า=ชื่อ | ผู้เช่า=ชื่อ   signature row (1–2 columns); empty name → dotted brackets
::blank                      empty line
::pagebreak                  new page
**bold**  __underline__  `keep-arabic-digits`
<!-- comment -->             ignored
```

## Contract layout = กรมบัญชีกลาง standard contract form (default, `--layout official`)

Measured from the Comptroller General's Department Word form (แบบสัญญาจ้างทำของ, TH SarabunIT๙ 16, A4, left margin 3 cm). build_docx.js reproduces it:

| Element | Official form | build_docx.js |
|---|---|---|
| Title | bold **16 pt**, centred | `#` |
| Contract no. | "สัญญาเลขที่ ……" right-aligned, **below** the title | `::right` after `#` |
| Opening | one paragraph: "สัญญาฉบับนี้ทำขึ้น ณ … เมื่อวันที่ … ระหว่าง …", first line **2.0 cm**, wrapped lines to the margin | `::lead` |
| Clause heading | "**ข้อ ๑ …**" bold on its own line, indented **2.0 cm** (not at the margin), 6 pt before | `###` |
| Clause text and sub-items (๑.๑, (ก)) | first line **3.25 cm**, wrapped lines return to the left margin. Only two indent depths in the whole document. | plain lines inside a clause, `-`, `--` |
| Closing | "สัญญานี้ทำขึ้นเป็นสองฉบับ …" at 2.0 cm. We add the page count "มีจำนวน [[NUMPAGES]] หน้า" (a live Word field) so pages can't be added or removed. | `::lead`, `[[NUMPAGES]]` |
| Signatures | stacked, one signer per row, starting from the **centre** of the page: "(ลงชื่อ)…………ผู้ให้เช่า" then "( name )" left-aligned under it, a blank line between signers | one `::sign Role=name` per line |
| Page number | "- ๒ -" top centre from page 2; none on page 1 | default (`--no-gov-header` to drop) |
| Footer | none on the form. We keep the initials line (ลงชื่อ…ผู้ให้เช่า ลงชื่อ…ผู้เช่า …) for anti-page-swap protection. | `_initials` |
| Digits | the 2564 form uses Arabic digits. ระเบียบ/มติ ครม. prefer Thai digits. Both are acceptable. | Thai by default, `--arabic` |

`--layout hanging` (number at 2.0 cm, text column at 3.25 cm with a hanging indent) is available for non-official documents. It reads easily but is **not** the government form.

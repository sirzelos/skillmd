---
name: thai-lease-contract
description: Draft, review, or complete a formal Thai residential lease contract (สัญญาเช่าบ้าน / ทาวน์เฮาส์ / คอนโด / ห้องเช่า) that is enforceable and usable as evidence in Thai courts, produced as a Word file in Thai official-document format (ระเบียบงานสารบรรณ — TH Sarabun 16pt, margins 3/2/2.5/2.5 cm, 2.5 cm indent, Thai digits). Use whenever the user asks to make, write, check, translate, or fill in a rental/lease contract in Thailand, asks what to include, or what info is needed before signing. Covers ป.พ.พ. ม.537–571, the 2568 OCPB contract-control notice, stamp duty, registration, annexes, and a one-shot intake questionnaire.
---

# Thai Residential Lease Contract (สัญญาเช่าที่อยู่อาศัย)

Goal: a contract that (1) is valid and enforceable in a Thai court, (2) covers every foreseeable dispute, (3) is fair enough that a court won't cut its terms down (ม.383 / พ.ร.บ.ข้อสัญญาที่ไม่เป็นธรรม 2540), (4) looks like a formal Thai government-grade document in Word, and (5) is easy for laypeople to fill in and sign.

## Files

| File | Use |
|---|---|
| `references/legal-basis.md` | The law, with section numbers, plus red flags. **Read before drafting or reviewing.** |
| `references/contract-template.md` | Master contract in build markup: `{{placeholders}}`, `::if` optional blocks, auto-numbered clauses `ข้อ #{label}` / `- #.#`, cross-refs `{ref:label}`, 4 annexes |
| `references/data-example.json` | Every data key with sample values and recommended defaults |
| `references/intake-questionnaire.md` | One-shot questionnaire (build markup, makes a Word form) |
| `references/thai-official-format.md` | Typographic standard + the full markup syntax |
| `references/sources.md` | Where every rule came from |
| `scripts/build_docx.js` | Markup + JSON → .docx in official format (Thai word-break fix, Thai digits, stamp box, initials footer, signature blocks, tables) |
| `scripts/bahttext.js` | `node bahttext.js 15000` → `15,000 บาท (หนึ่งหมื่นห้าพันบาทถ้วน)`; `--date 2026-11-01` |
| `scripts/docx_to_pdf.ps1` | Word COM export to PDF (Windows), for visual QA |

Dependencies: Node ≥ 18 with `docx` installed in `scripts/node_modules` (run `npm install` in `scripts/` if it's missing). Fonts: TH Sarabun New (or TH SarabunIT๙). For previews: MS Word plus `pip install pymupdf`.

## Workflow

1. **Scope.** Find out: is the user the landlord or the tenant, what kind of property, how long the term is, and does the landlord rent out **3+ units** as a business. If so, the ประกาศคณะกรรมการว่าด้วยสัญญา พ.ศ. 2568 is mandatory (legal-basis §3). Even when it isn't, use its fairness standards as the default.
2. **Intake in one batch.** Build the questionnaire Word form and send it **once**. Never trickle questions out one by one. Users often pass it to a family member.
   `node scripts/build_docx.js references/intake-questionnaire.md "แบบสอบถามข้อมูลสัญญาเช่า.docx" --arabic --no-initials`
   Also offer a blank draft right away (step 4 with no data), so the user can see what the contract will look like.
3. **Validate answers** against legal-basis §8 red flags. Raise problems before drafting: term > 3 years, co-owned or marital property, a mortgage, a signer who isn't the owner, a foreign tenant (TM.30), a company tenant (withholding tax), deposit + advance > 3 months, or penalties that are too high.
4. **Fill data and build.** Put the answers into a `contract-data.json` in the user's folder (schema: data-example.json). `_with` lists the optional blocks to keep. Compute:
   - `stamp_duty` = ceil(rent × months / 1000)
   - `deposit` = rent × deposit_months
   - `late_fee_cap` ≈ 10% of rent
   - `holdover_per_day` ≈ 2 × rent / 30

   `node scripts/build_docx.js references/contract-template.md "สัญญาเช่าบ้าน.docx" --data contract-data.json`
   The builder lists every missing key. Each one renders as a dotted blank. Never invent ID, deed, or bank numbers. `null` means "intentionally empty".
   - For edits that the template can't express, copy the template next to the data file and edit the copy. Keep the markup conventions.
   - Reusable / hand-fill contracts: list per-tenant keys in `_fillable`. They always render as blanks even if a value exists, and are reported separately from real "missing" warnings. Typical set: contract_no, sign_date, term_text, start/end/handover dates, rent, deposit, deposit_months, late_fee_cap, early_forfeit, holdover_per_day, guarantor.limit, stamp_duty, cleaning_fee. Rent-derived numbers must be fillable together with rent. Give the user a "how to fill the numbers" table (rent × months, 10%, ×2÷30, ×3, ÷1000).
   - Blank widths are sized for handwriting by key type (`blankFor` in build_docx.js): names 50 dots, addresses 110, IDs 38, ages 8, money 14, Thai-word amounts 40, and dates as "วันที่ … เดือน … พ.ศ. …". Override per key with `_blank_len`. Paragraphs containing blanks are left-aligned so the letters are not spread out. Personal-name values never wrap mid-name.
   - The output .docx may be open in Word (EBUSY). Don't kill Word. Write to a new name, then tell the user.
   - When the user is the **landlord**, turn on `lessor_protect` (landlord-side hardening that a court will still enforce). For a tenant-side contract, leave it off.
   - After building, check every cross-reference. Extract the docx text, map each "ข้อ X.Y" to its target clause, and read the list. Refs to sub-items that optional blocks can shift must use a `{label}`, never `{ref:x}.N`.
   - Annex 2 inventory comes from `inventory_rows` (array of `| n | item | brand | qty | condition | note |` strings). List the house's real items, keys, CCTV, etc.
   - Optional blocks are listed in the template header comment (e.g. `cctv`, `parking`, `inspect_limit`, `lessor_contact`, `lessor_early_comp`). When an answer doesn't fit any block, add a new `::if` block to the **master** template so later contracts benefit too.
   - Amounts: `{{x}}` = digits with commas, `{{baht:x}}` = Thai words. Dates: `{{date:x}}` / `{{datelong:x}}` in Buddhist Era. Wrap ID, deed, and account numbers in backticks so they stay Arabic digits.
5. **Visual QA.** Run `powershell -File scripts/docx_to_pdf.ps1 out.docx out.pdf`, render a few pages with pymupdf (`page.get_pixmap(dpi=80).save(...)`), and look at them. Check for stretched lines, wrapped table headers, and orphaned signature blocks.
6. **Delivery note** to the user (short, plain language):
   - The still-missing list
   - The stamp duty amount and where to pay it
   - Signing steps: 2 originals, both parties initial every page, 2 witnesses, signed ID copies marked "ใช้ประกอบสัญญาเช่าบ้านเลขที่ … เท่านั้น", dated photos and video at handover, rent paid by bank transfer
   - Register at the Land Office if the term is over 3 years
   - This is a well-researched draft, not legal advice. Have a Thai lawyer review high-value or unusual deals.

## QA checklist (all must pass before calling it final)

- [ ] Parties: full name, ID/passport number, address per house registration, and signer capacity (owner / attorney-in-fact / director)
- [ ] Property: house number, deed number, land number, survey page, sub-district/district/province, area. Matches the deed copy.
- [ ] Exact start and end dates. ≤ 3 years, or registration is planned.
- [ ] Rent, due day, bank account in the lessor's name, late fee with a cap
- [ ] Deposit and advance: amounts, no offsetting the last month's rent, refund deadline, deductions only with evidence, normal wear excluded
- [ ] Utilities at the actual utility bill. Common fee payer stated.
- [ ] Repairs split: lessor does major repairs (ม.550), tenant does minor repairs (ม.553) under a baht threshold. Urgent-repair rule.
- [ ] No sublease or short-term letting (ม.544). Residential use only. Occupants listed.
- [ ] 15-day notice before termination for rent default (ม.560). No self-help (no lock, utility cut-off, or seizure).
- [ ] Move-out: condition, keys, meters, moving name out of house registration, holdover damages, no implied renewal (ม.570), abandoned belongings
- [ ] Notices clause with addresses and LINE/email. Death and sale (ม.569) clauses.
- [ ] Penalties proportionate (ม.383)
- [ ] Annexes listed in the annex clause and attached. Initials footer. 2 witnesses. 2 originals. Stamp box shows the amount.
- [ ] Every amount's words match its digits (`bahttext.js`). Builder shows no warnings, or the user has accepted the blanks.

## Language

- The contract uses formal Thai legal style ("ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงเช่า…").
- For a foreign tenant, offer a bilingual version (`foreigner` block makes Thai prevail).
- Explain things to the user in plain language, in whatever language they use with you.

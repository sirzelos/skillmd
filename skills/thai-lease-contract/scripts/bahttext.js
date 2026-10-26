#!/usr/bin/env node
// Thai baht text + Thai date helpers.  CLI: node bahttext.js 15000.50  →  หนึ่งหมื่นห้าพันบาทห้าสิบสตางค์

const DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const PLACES = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

// Words for an integer below one million.
function belowMillion(n) {
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const d = Number(s[i]);
    const place = s.length - 1 - i;
    if (d === 0) continue;
    if (place === 1 && d === 1) out += 'สิบ';
    else if (place === 1 && d === 2) out += 'ยี่สิบ';
    else if (place === 0 && d === 1 && s.length > 1) out += 'เอ็ด';
    else out += DIGITS[d] + PLACES[place];
  }
  return out;
}

function intWords(n) {
  if (n === 0) return DIGITS[0];
  if (n < 1e6) return belowMillion(n);
  const high = Math.floor(n / 1e6);
  const low = n % 1e6;
  const lowWords = low === 1 ? 'เอ็ด' : low ? belowMillion(low) : '';
  return intWords(high) + 'ล้าน' + lowWords;
}

function bahtText(amount) {
  const value = Number(String(amount).replace(/,/g, ''));
  if (!Number.isFinite(value) || value < 0) throw new Error(`invalid amount: ${amount}`);
  const satangTotal = Math.round(value * 100);
  const baht = Math.floor(satangTotal / 100);
  const satang = satangTotal % 100;
  if (satang === 0) return `${intWords(baht)}บาทถ้วน`;
  return `${baht ? intWords(baht) + 'บาท' : ''}${intWords(satang)}สตางค์`;
}

function formatNumber(amount) {
  const value = Number(String(amount).replace(/,/g, ''));
  const fixed = Number.isInteger(value) ? String(value) : value.toFixed(2);
  const [i, f] = fixed.split('.');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (f ? '.' + f : '');
}

// "2026-11-01" → "วันที่ 1 เดือนพฤศจิกายน พ.ศ. 2569"
function thaiDate(iso, { long = true } = {}) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
  if (!m) throw new Error(`date must be YYYY-MM-DD: ${iso}`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const be = y < 2400 ? y + 543 : y;
  return long ? `วันที่ ${d} เดือน${MONTHS[mo - 1]} พ.ศ. ${be}` : `${d} ${MONTHS[mo - 1]} ${be}`;
}

module.exports = { bahtText, formatNumber, thaiDate };

if (require.main === module) {
  const arg = process.argv[2];
  if (!arg) {
    console.error('usage: node bahttext.js <amount> | node bahttext.js --date YYYY-MM-DD');
    process.exit(1);
  }
  if (arg === '--date') console.log(thaiDate(process.argv[3]));
  else console.log(`${formatNumber(arg)} บาท (${bahtText(arg)})`);
}

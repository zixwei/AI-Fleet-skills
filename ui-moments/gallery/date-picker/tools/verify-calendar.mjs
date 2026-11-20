import assert from "node:assert/strict";
import { dateKey, monthCells, moveDays, moveMonth } from "../src/lib/calendar.ts";

const date = (year, month, day) => ({ year, month: month - 1, day });
// 跨年、月底与世纪闰年，防止日期归一化悄悄跳错月份。
assert.deepEqual(moveMonth(date(2026, 12, 31), 1), date(2027, 1, 31));
assert.deepEqual(moveMonth(date(2027, 1, 31), 1), date(2027, 2, 28));
assert.deepEqual(moveMonth(date(2028, 1, 31), 1), date(2028, 2, 29));
assert.deepEqual(moveMonth(date(1900, 1, 31), 1), date(1900, 2, 28));
assert.deepEqual(moveMonth(date(2000, 1, 31), 1), date(2000, 2, 29));
assert.deepEqual(moveDays(date(2027, 1, 1), -1), date(2026, 12, 31));
// 六行月份也不能漏掉最后一天；相邻日期完整连续。
const cells = monthCells(date(2026, 8, 1));
assert.equal(cells.length, 42);
assert.equal(dateKey(cells[0]), "2026-07-27");
assert.equal(dateKey(cells[41]), "2026-09-06");
assert.equal(cells.filter(d => d.month === 7).length, 31);
console.log("日期检查通过：跨年、月底、闰年与六行月份。");

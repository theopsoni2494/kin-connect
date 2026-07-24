import * as XLSX from "xlsx";

const HEADER_VARIANTS = ["emp code", "employee code", "code", "emp id", "employee id", "employee code (id)"];

// Reads the first sheet of an uploaded .xlsx/.xls/.csv file and pulls out a
// flat list of employee codes. Looks for a header cell matching a known
// variant (case-insensitive) and reads everything below it in that column;
// falls back to "column A, skip row 1" if no recognizable header is found.
export function extractEmployeeCodes(buffer: Buffer): string[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
  if (rows.length === 0) return [];

  let headerRow = -1;
  let col = -1;
  for (let r = 0; r < Math.min(rows.length, 10) && col === -1; r++) {
    const row = rows[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] ?? "").trim().toLowerCase();
      if (HEADER_VARIANTS.includes(cell)) {
        headerRow = r;
        col = c;
        break;
      }
    }
  }

  if (col === -1) {
    // No recognizable header — assume row 0 is a header row and column 0 holds the codes.
    headerRow = 0;
    col = 0;
  }

  const codes: string[] = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const value = rows[r]?.[col];
    const str = String(value ?? "").trim();
    if (str) codes.push(str);
  }
  return codes;
}

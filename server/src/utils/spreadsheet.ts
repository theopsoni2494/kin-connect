import * as XLSX from "xlsx";

const CODE_HEADER_VARIANTS = ["emp code", "employee code", "code", "emp id", "employee id", "employee code (id)"];

export interface ParsedEmployeeRow {
  code: string;
  name?: string;
  sector?: string;
}

function normalize(cell: unknown): string {
  return String(cell ?? "").trim().toLowerCase();
}

function findExactColumn(
  rows: unknown[][],
  variants: string[],
): { headerRow: number; col: number } | null {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      if (variants.includes(normalize(row[c]))) return { headerRow: r, col: c };
    }
  }
  return null;
}

// Substring match — deliberately more lenient than the code column's
// exact-list match, since real spreadsheets use all sorts of phrasing for
// these two ("Dept.", "Dept Name", "Sector", "Emp Name", "Full Name", ...).
// `exclude` keeps a header containing multiple keywords from being claimed
// twice — sector/department is resolved before name, so name's search skips
// whatever column that already took.
function findFuzzyColumn(
  rows: unknown[][],
  mustIncludeAny: string[],
  exclude: Set<number>,
): { headerRow: number; col: number } | null {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r] ?? [];
    for (let c = 0; c < row.length; c++) {
      if (exclude.has(c)) continue;
      const cell = normalize(row[c]);
      if (mustIncludeAny.some((needle) => cell.includes(needle))) return { headerRow: r, col: c };
    }
  }
  return null;
}

// Reads the first sheet of an uploaded .xlsx/.xls/.csv file and pulls out
// employee code (required), name, and sector (both optional). Column order
// and extra columns (e.g. "Sr. No.") don't matter. Falls back to "column A,
// skip row 1" for the code if no recognizable header is found; name/sector
// are left undefined in that fallback case.
export function extractEmployeeRows(buffer: Buffer): ParsedEmployeeRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
  if (rows.length === 0) return [];

  const codeMatch = findExactColumn(rows, CODE_HEADER_VARIANTS);
  const claimed = new Set<number>();
  if (codeMatch) claimed.add(codeMatch.col);

  const sectorMatch = findFuzzyColumn(rows, ["sector", "dept"], claimed);
  if (sectorMatch) claimed.add(sectorMatch.col);

  const nameMatch = findFuzzyColumn(rows, ["name"], claimed);

  const headerRow = codeMatch?.headerRow ?? 0;
  const codeCol = codeMatch?.col ?? 0;

  const result: ParsedEmployeeRow[] = [];
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const code = String(row[codeCol] ?? "").trim();
    if (!code) continue;
    const name = nameMatch ? String(row[nameMatch.col] ?? "").trim() : "";
    const sector = sectorMatch ? String(row[sectorMatch.col] ?? "").trim() : "";
    result.push({ code, name: name || undefined, sector: sector || undefined });
  }
  return result;
}

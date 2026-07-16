export function genTicketId(): string {
  const n = Math.floor(Math.random() * 90000) + 10000;
  const d = new Date();
  return `TKT-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}-${n}`;
}

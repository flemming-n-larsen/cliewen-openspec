function encodeField(value) {
  return /[,"\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function exportCsv(records, columns) {
  const rows = [columns, ...records.map(record => columns.map(column => record[column]))];
  return rows.map(row => row.map(encodeField).join(',')).join('\r\n') + '\r\n';
}

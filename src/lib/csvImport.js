import Papa from 'papaparse';

/**
 * Parse a CSV file using PapaParse with auto-detect delimiter (; or ,).
 * Returns { data, errors } where data is an array of objects keyed by headers.
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimitersToGuess: [';', ',', '\t'],
      complete: (results) => resolve({ data: results.data, errors: results.errors }),
      error: (err) => reject(err),
    });
  });
}

/**
 * Generate and trigger download of a CSV template with the given column headers.
 */
export function downloadTemplate(columns, fileName) {
  const header = columns.join(';');
  const blob = new Blob([header + '\n'], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

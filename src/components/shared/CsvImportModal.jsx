import { useState, useRef } from 'react';
import { parseCSV, downloadTemplate } from '../../lib/csvImport';

/**
 * Reusable CSV import modal.
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - columns: string[] — expected CSV column headers
 *  - validate: (row, index) => string|null — returns error message or null
 *  - onImport: (validRows) => Promise<void>
 *  - templateFileName: string
 */
export function CsvImportModal({ open, onClose, columns, validate, onImport, templateFileName }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({}); // { rowIndex: errorMsg }
  const [importing, setImporting] = useState(false);
  const [parseError, setParseError] = useState(null);
  const fileRef = useRef(null);

  if (!open) return null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);

    try {
      const { data } = await parseCSV(file);
      setRows(data);

      const newErrors = {};
      data.forEach((row, i) => {
        const err = validate(row, i);
        if (err) newErrors[i] = err;
      });
      setErrors(newErrors);
    } catch (err) {
      setParseError(err.message || 'Erreur de lecture du fichier');
      setRows([]);
      setErrors({});
    }
  };

  const validRows = rows.filter((_, i) => !errors[i]);
  const hasErrors = Object.keys(errors).length > 0;

  const handleImport = async () => {
    if (!validRows.length) return;
    setImporting(true);
    try {
      await onImport(validRows);
      handleClose();
    } catch (err) {
      setParseError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setRows([]);
    setErrors({});
    setParseError(null);
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  };

  const previewCols = columns.length > 0 ? columns : (rows.length > 0 ? Object.keys(rows[0]) : []);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-4">Importer depuis CSV</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="file-input file-input-sm file-input-bordered"
            onChange={handleFile}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => downloadTemplate(columns, templateFileName)}
          >
            Télécharger le modèle
          </button>
        </div>

        {parseError && (
          <div className="alert alert-error mb-4 text-sm">{parseError}</div>
        )}

        {rows.length > 0 && (
          <>
            <div className="text-sm mb-2">
              {rows.length} ligne(s) lue(s) — <span className="text-success">{validRows.length} valide(s)</span>
              {hasErrors && <span className="text-error ml-2">{Object.keys(errors).length} en erreur</span>}
            </div>

            <div className="overflow-x-auto max-h-64 overflow-y-auto mb-4">
              <table className="table table-xs table-zebra">
                <thead>
                  <tr>
                    <th>#</th>
                    {previewCols.map((col) => <th key={col}>{col}</th>)}
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={errors[i] ? 'text-error' : ''}>
                      <td>{i + 1}</td>
                      {previewCols.map((col) => <td key={col}>{row[col] ?? ''}</td>)}
                      <td className="text-xs">
                        {errors[i] ? errors[i] : <span className="text-success">OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose}>Annuler</button>
          <button
            className="btn btn-primary"
            disabled={!validRows.length || importing}
            onClick={handleImport}
          >
            {importing && <span className="loading loading-spinner loading-xs" />}
            Importer {validRows.length} ligne(s)
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose} />
    </dialog>
  );
}

import { useState, useRef } from 'react';
import { usePdfImportStore } from '../../stores/usePdfImportStore';
import { useSupplierStore } from '../../stores/useSupplierStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { extractTextFromPdf } from '../../lib/pdfExtract';
import { useToast } from '../../hooks/useToast';

export function PdfUploadStep() {
  const {
    supplierId,
    setSupplierId,
    setPdfData,
    callParsePdf,
    loading,
    error,
    pdfText,
  } = usePdfImportStore();

  const { suppliers } = useSupplierStore();
  const taxonomyStore = useTaxonomyStore();
  const toast = useToast();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [extracting, setExtracting] = useState(false);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setExtractedText('');

    setExtracting(true);
    try {
      const text = await extractTextFromPdf(selected);
      setExtractedText(text);
      setPdfData(text, selected.name);
    } catch (err) {
      toast.error(`Erreur extraction PDF : ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText) {
      toast.warning('Veuillez d\u2019abord charger un PDF');
      return;
    }

    // Build taxonomy values for the prompt
    const taxonomies = {
      purchase_unit: taxonomyStore.getValues('purchase_unit'),
      serving_unit: taxonomyStore.getValues('serving_unit'),
      ingredient_category: taxonomyStore.getValues('ingredient_category'),
      recipe_type: taxonomyStore.getValues('recipe_type'),
    };

    const supplierName =
      suppliers.find((s) => s.id === supplierId)?.name || '';

    try {
      await callParsePdf(extractedText, taxonomies, supplierName);
      toast.success('Analyse terminée');
    } catch (err) {
      toast.error(`Erreur analyse : ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Supplier select */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Fournisseur</span>
        <select
          className="select w-full max-w-md"
          value={supplierId || ''}
          onChange={(e) => setSupplierId(e.target.value || null)}
        >
          <option value="">-- Sélectionner un fournisseur --</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-base-content/60">
          Optionnel. Les ingrédients importés seront liés à ce fournisseur.
        </p>
      </div>

      {/* File input */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Fichier PDF</span>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="file-input w-full max-w-md"
          onChange={handleFileChange}
        />
      </div>

      {/* Extraction status */}
      {extracting && (
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <span className="loading loading-spinner loading-sm" />
          Extraction du texte en cours...
        </div>
      )}

      {extractedText && (
        <div className="flex items-center gap-2 text-sm text-success">
          Texte extrait ({extractedText.length} caractères)
        </div>
      )}

      {/* Analyze button */}
      <button
        className="btn btn-primary"
        disabled={!extractedText || loading}
        onClick={handleAnalyze}
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        Analyser avec IA
      </button>

      {error && (
        <div className="alert alert-error text-sm">
          {error}
        </div>
      )}

      {/* Debug: raw text */}
      {extractedText && (
        <details className="collapse collapse-arrow bg-base-200">
          <summary className="collapse-title text-sm font-medium">
            Texte brut extrait (debug)
          </summary>
          <div className="collapse-content">
            <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
              {extractedText}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}

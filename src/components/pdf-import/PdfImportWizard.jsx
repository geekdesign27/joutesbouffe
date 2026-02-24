import { useEffect } from 'react';
import { usePdfImportStore } from '../../stores/usePdfImportStore';
import { useSupplierStore } from '../../stores/useSupplierStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { PdfUploadStep } from './PdfUploadStep';
import { PdfReviewStep } from './PdfReviewStep';
import { PdfImportHistory } from './PdfImportHistory';

const STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'parsing', label: 'Analyse' },
  { key: 'review', label: 'Vérification' },
  { key: 'importing', label: 'Import' },
  { key: 'done', label: 'Terminé' },
];

function getStepIndex(step) {
  const idx = STEPS.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : 0;
}

export function PdfImportWizard() {
  const { step, resetWizard } = usePdfImportStore();
  const { fetchAll: fetchSuppliers } = useSupplierStore();
  const { fetchAll: fetchTaxonomies } = useTaxonomyStore();

  useEffect(() => {
    fetchSuppliers();
    fetchTaxonomies();
  }, [fetchSuppliers, fetchTaxonomies]);

  const currentIdx = getStepIndex(step);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Import PDF fournisseur</h2>
        {step !== 'upload' && (
          <button className="btn btn-ghost btn-sm" onClick={resetWizard}>
            Nouvel import
          </button>
        )}
      </div>

      {/* Stepper */}
      <ul className="steps w-full">
        {STEPS.map((s, idx) => (
          <li
            key={s.key}
            className={`step ${idx <= currentIdx ? 'step-primary' : ''}`}
          >
            {s.label}
          </li>
        ))}
      </ul>

      {/* Step content */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          {(step === 'upload' || step === 'parsing') && <PdfUploadStep />}
          {step === 'review' && <PdfReviewStep />}
          {step === 'importing' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-sm text-base-content/60">
                Import en cours...
              </p>
            </div>
          )}
          {step === 'done' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="text-4xl">&#10003;</div>
              <p className="text-lg font-semibold text-success">
                Import terminé avec succès
              </p>
              <p className="text-sm text-base-content/60">
                Les éléments sont maintenant visibles dans Ingrédients, Recettes
                et Coûts fixes.
              </p>
              <button className="btn btn-primary" onClick={resetWizard}>
                Nouvel import
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import history */}
      <PdfImportHistory />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useIngredientStore } from '../../stores/useIngredientStore';
import { useSupplierStore } from '../../stores/useSupplierStore';
import { useTaxonomyStore } from '../../stores/useTaxonomyStore';
import { useToast } from '../../hooks/useToast';
import { IngredientForm } from './IngredientForm';
import { IngredientBadge } from './IngredientBadge';
import { ConfirmModal } from '../shared/ConfirmModal';
import { FormModal } from '../shared/FormModal';
import { CsvImportModal } from '../shared/CsvImportModal';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { DataTable } from '../shared/DataTable';
import { calcServingUnitPrice } from '../../lib/calculations';

const INGREDIENT_CSV_COLUMNS = [
  'nom', 'fournisseur', 'categorie', 'unite_achat', 'quantite_achat',
  'prix_achat', 'nb_unites_par_cond', 'contenance_unite', 'mesure_contenance',
  'contenance', 'unite_contenance', 'taux_perte',
  'retournable', 'perissable', 'notes',
];

const COLUMNS = [
  { key: 'name', header: 'Nom', sortable: true, searchable: true },
  { key: 'supplier', header: 'Fournisseur', sortable: true, searchable: true },
  { key: 'purchase', header: 'Achat' },
  { key: 'purchase_price', header: 'Prix achat', sortable: true, className: 'text-right' },
  { key: 'content', header: 'Contenu' },
  { key: 'serving', header: 'Service' },
  { key: 'serving_price', header: 'Prix/service', sortable: true, className: 'text-right' },
  { key: 'status', header: 'Statut' },
  { key: 'actions', header: 'Actions', className: 'w-32' },
];

export function IngredientList() {
  const { ingredients, loading, fetchAll, remove, bulkCreate } = useIngredientStore();
  const { suppliers, fetchAll: fetchSuppliers } = useSupplierStore();
  const { getOptions, getValues, fetchAll: fetchTaxonomies } = useTaxonomyStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => { fetchAll(); fetchSuppliers(); fetchTaxonomies(); }, [fetchAll, fetchSuppliers, fetchTaxonomies]);

  const categoryOptions = [{ value: '', label: 'Toutes' }, ...getOptions('ingredient_category')];
  const validCategories = getValues('ingredient_category');
  const validUnits = getValues('purchase_unit');
  const validServingUnits = getValues('serving_unit');

  const suppliersByName = Object.fromEntries(
    suppliers.map((s) => [s.name.toLowerCase().trim(), s.id])
  );

  const filtered = filterCategory
    ? ingredients.filter((i) => i.category === filterCategory)
    : ingredients;

  const getSearchValue = useCallback((item, key) => {
    if (key === 'supplier') return item.supplier?.name || '';
    if (key === 'name') return item.name || '';
    if (key === 'purchase_price') return String(item.purchase_price || 0);
    if (key === 'serving_price') return String(calcServingUnitPrice(item));
    return item[key] == null ? '' : String(item[key]);
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast.success('Ingrédient supprimé');
    } catch (err) {
      toast.error(err.message);
    }
    setDeleting(null);
  };

  const validateIngredientRow = (row) => {
    if (!row.nom?.trim()) return 'Nom obligatoire';
    if (row.categorie && !validCategories.includes(row.categorie.trim()))
      return `Catégorie invalide: ${row.categorie}`;
    if (row.unite_achat && !validUnits.includes(row.unite_achat.trim()))
      return `Unité d'achat invalide: ${row.unite_achat}`;
    if (row.unite_contenance && !validServingUnits.includes(row.unite_contenance.trim()))
      return `Unité de contenance invalide: ${row.unite_contenance}`;
    if (row.fournisseur?.trim() && !suppliersByName[row.fournisseur.trim().toLowerCase()])
      return `Fournisseur inconnu: ${row.fournisseur}`;
    if (row.prix_achat && (isNaN(Number(row.prix_achat)) || Number(row.prix_achat) < 0))
      return 'Prix invalide';
    if (row.quantite_achat && (isNaN(Number(row.quantite_achat)) || Number(row.quantite_achat) <= 0))
      return 'Quantité invalide';
    if (row.nb_unites_par_cond && (isNaN(Number(row.nb_unites_par_cond)) || Number(row.nb_unites_par_cond) < 1))
      return 'Nb unités par conditionnement invalide (>= 1)';
    if (row.contenance_unite && (isNaN(Number(row.contenance_unite)) || Number(row.contenance_unite) <= 0))
      return 'Contenance par unité invalide';
    if (row.mesure_contenance?.trim() && !validServingUnits.includes(row.mesure_contenance.trim()))
      return `Mesure contenance invalide: ${row.mesure_contenance}`;
    if (row.taux_perte && (isNaN(Number(row.taux_perte)) || Number(row.taux_perte) < 0 || Number(row.taux_perte) > 100))
      return 'Taux de perte invalide (0-100)';
    return null;
  };

  const handleCsvImport = async (validRows) => {
    const items = validRows.map((row) => {
      const item = {
        name: row.nom.trim(),
        category: row.categorie?.trim() || 'alimentaire',
        purchase_unit: row.unite_achat?.trim() || 'piece',
        purchase_quantity: row.quantite_achat ? Number(row.quantite_achat) : 1,
        purchase_price: row.prix_achat ? Number(row.prix_achat) : 0,
        waste_rate: row.taux_perte ? Number(row.taux_perte) : 0,
        returnable: ['oui', '1', 'true'].includes(row.retournable?.trim().toLowerCase()),
        perishable: ['oui', '1', 'true'].includes(row.perissable?.trim().toLowerCase()),
        notes: row.notes?.trim() || null,
      };
      if (row.fournisseur?.trim()) {
        item.supplier_id = suppliersByName[row.fournisseur.trim().toLowerCase()] || null;
      }
      if (row.nb_unites_par_cond && Number(row.nb_unites_par_cond) >= 1) {
        item.items_per_purchase = Number(row.nb_unites_par_cond);
      }
      if (row.contenance_unite && Number(row.contenance_unite) > 0) {
        item.item_volume = Number(row.contenance_unite);
      }
      if (row.mesure_contenance?.trim()) {
        item.item_volume_unit = row.mesure_contenance.trim();
      }
      if (row.contenance && Number(row.contenance) > 0) {
        item.serving_quantity = Number(row.contenance);
      }
      if (row.unite_contenance?.trim()) {
        item.serving_unit = row.unite_contenance.trim();
      }
      return item;
    });
    await bulkCreate(items);
    toast.success(`${items.length} ingrédient(s) importé(s)`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Ingrédients</h2>
        <div className="flex gap-2">
          <select
            className="select select-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button className="btn btn-outline btn-sm" onClick={() => setShowImport(true)}>
            Importer CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
            + Ajouter
          </button>
        </div>
      </div>

      <FormModal
        open={editing !== null}
        title={editing === 'new' ? 'Nouvel ingrédient' : "Modifier l'ingrédient"}
        onClose={() => setEditing(null)}
        wide
      >
        <IngredientForm
          ingredient={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      </FormModal>

      <DataTable
        data={filtered}
        columns={COLUMNS}
        tableSizeClass="table-sm"
        getSearchValue={getSearchValue}
        emptyState={
          <EmptyState
            title="Aucun ingrédient"
            description="Ajoutez vos ingrédients pour composer les recettes."
            actionLabel="Ajouter un ingrédient"
            onAction={() => setEditing('new')}
          />
        }
        renderCell={(ing) => {
          const sPrice = calcServingUnitPrice(ing);
          const sUnit = ing.serving_unit || ing.purchase_unit;
          const itemsPer = ing.items_per_purchase || 1;
          return (
            <tr key={ing.id}>
              <td className="font-medium">{ing.name}</td>
              <td>{ing.supplier?.name || '—'}</td>
              <td className="text-sm">{ing.purchase_quantity} {ing.purchase_unit}</td>
              <td className="text-right font-mono">{Number(ing.purchase_price).toFixed(2)} CHF</td>
              <td className="text-sm">{itemsPer > 1 ? `${itemsPer} u.` : '—'}{ing.item_volume ? ` × ${ing.item_volume} ${ing.item_volume_unit}` : ''}</td>
              <td className="text-sm">{ing.serving_unit ? `${ing.serving_quantity} ${ing.serving_unit}/u.` : '—'}</td>
              <td className="text-right font-mono font-semibold">{sPrice.toFixed(4)} CHF/{sUnit}</td>
              <td><IngredientBadge ingredient={ing} /></td>
              <td>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-xs" onClick={() => setEditing(ing)}>Modifier</button>
                  <button className="btn btn-ghost btn-xs text-error" onClick={() => setDeleting(ing)}>Supprimer</button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      <ConfirmModal
        open={!!deleting}
        title="Supprimer l'ingrédient"
        message={`Voulez-vous vraiment supprimer « ${deleting?.name} » ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <CsvImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        columns={INGREDIENT_CSV_COLUMNS}
        validate={validateIngredientRow}
        onImport={handleCsvImport}
        templateFileName="ingredients_template.csv"
      />
    </div>
  );
}

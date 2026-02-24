import { useRecipeStore } from '../../stores/useRecipeStore';
import { useIngredientStore } from '../../stores/useIngredientStore';
import { useToast } from '../../hooks/useToast';
import { CsvImportModal } from '../shared/CsvImportModal';

const CSV_COLUMNS = ['recette', 'ingredient', 'quantite'];

export function RecipeCompositionImport({ open, onClose }) {
  const { recipes, bulkAddIngredients } = useRecipeStore();
  const { ingredients } = useIngredientStore();
  const toast = useToast();

  const recipesByName = {};
  recipes.forEach((r) => { recipesByName[r.name.trim().toLowerCase()] = r; });

  const ingredientsByName = {};
  ingredients.forEach((i) => { ingredientsByName[i.name.trim().toLowerCase()] = i; });

  const validate = (row) => {
    if (!row.recette?.trim()) return 'Nom de recette obligatoire';
    if (!row.ingredient?.trim()) return "Nom d'ingrédient obligatoire";
    if (!row.quantite || isNaN(Number(row.quantite)) || Number(row.quantite) <= 0)
      return 'Quantité invalide (doit être > 0)';

    const recipeName = row.recette.trim().toLowerCase();
    if (!recipesByName[recipeName]) return `Recette inconnue : ${row.recette}`;

    const ingName = row.ingredient.trim().toLowerCase();
    if (!ingredientsByName[ingName]) return `Ingrédient inconnu : ${row.ingredient}`;

    return null;
  };

  const handleImport = async (validRows) => {
    const rows = validRows.map((row) => {
      const recipe = recipesByName[row.recette.trim().toLowerCase()];
      const ing = ingredientsByName[row.ingredient.trim().toLowerCase()];
      const unit = ing.serving_unit || ing.purchase_unit || 'pce';
      return {
        recipe_id: recipe.id,
        ingredient_id: ing.id,
        quantity_used: Number(row.quantite),
        unit,
      };
    });

    await bulkAddIngredients(rows);
    toast.success(`${rows.length} composition(s) importée(s)`);
  };

  return (
    <CsvImportModal
      open={open}
      onClose={onClose}
      columns={CSV_COLUMNS}
      validate={validate}
      onImport={handleImport}
      templateFileName="compositions_recettes"
    />
  );
}

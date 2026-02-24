import { create } from 'zustand';
import { supabase } from '../lib/supabase';

let tempIdCounter = 0;
const nextTempId = () => `_tmp_${++tempIdCounter}`;

const usePdfImportStore = create((set, get) => ({
  // Wizard state
  step: 'upload', // upload | parsing | review | importing | done
  pdfText: '',
  fileName: '',
  supplierId: null,

  // Parsed data from Claude
  parsedIngredients: [],
  parsedRecipes: [],
  parsedFixedCosts: [],

  // Import history
  batches: [],

  loading: false,
  error: null,

  // --- Wizard navigation ---

  setStep: (step) => set({ step }),

  setPdfData: (pdfText, fileName) => set({ pdfText, fileName }),

  setSupplierId: (supplierId) => set({ supplierId }),

  // --- Parse result handling ---

  setParsedData: (data) => {
    const ingredients = (data.ingredients || []).map((item) => ({
      ...item,
      _tempId: nextTempId(),
    }));
    const recipes = (data.recipes || []).map((item) => ({
      ...item,
      _tempId: nextTempId(),
    }));
    const fixedCosts = (data.fixed_costs || []).map((item) => ({
      ...item,
      _tempId: nextTempId(),
    }));
    set({
      parsedIngredients: ingredients,
      parsedRecipes: recipes,
      parsedFixedCosts: fixedCosts,
      step: 'review',
    });
  },

  // --- Inline editing ---

  updateParsedIngredient: (tempId, data) => {
    set((state) => ({
      parsedIngredients: state.parsedIngredients.map((item) =>
        item._tempId === tempId ? { ...item, ...data } : item,
      ),
    }));
  },

  removeParsedIngredient: (tempId) => {
    set((state) => ({
      parsedIngredients: state.parsedIngredients.filter(
        (item) => item._tempId !== tempId,
      ),
    }));
  },

  updateParsedRecipe: (tempId, data) => {
    set((state) => ({
      parsedRecipes: state.parsedRecipes.map((item) =>
        item._tempId === tempId ? { ...item, ...data } : item,
      ),
    }));
  },

  removeParsedRecipe: (tempId) => {
    set((state) => ({
      parsedRecipes: state.parsedRecipes.filter(
        (item) => item._tempId !== tempId,
      ),
    }));
  },

  updateParsedFixedCost: (tempId, data) => {
    set((state) => ({
      parsedFixedCosts: state.parsedFixedCosts.map((item) =>
        item._tempId === tempId ? { ...item, ...data } : item,
      ),
    }));
  },

  removeParsedFixedCost: (tempId) => {
    set((state) => ({
      parsedFixedCosts: state.parsedFixedCosts.filter(
        (item) => item._tempId !== tempId,
      ),
    }));
  },

  // --- Call Edge Function ---

  callParsePdf: async (pdfText, taxonomies, supplierName) => {
    set({ step: 'parsing', loading: true, error: null });
    try {
      const { data, error } = await supabase.functions.invoke(
        'parse-supplier-pdf',
        {
          body: { pdfText, taxonomies, supplierName },
        },
      );

      if (error) throw error;

      get().setParsedData(data);
      set({ loading: false });
    } catch (err) {
      set({ error: err.message, loading: false, step: 'upload' });
      throw err;
    }
  },

  // --- Batch import ---

  executeBatchImport: async (label) => {
    const {
      parsedIngredients,
      parsedRecipes,
      parsedFixedCosts,
      supplierId,
      fileName,
    } = get();

    set({ step: 'importing', loading: true, error: null });

    try {
      const totalItems =
        parsedIngredients.length +
        parsedRecipes.length +
        parsedFixedCosts.length;

      // 1. Create the batch record
      const { data: batch, error: batchErr } = await supabase
        .from('import_batches')
        .insert({
          label,
          supplier_id: supplierId || null,
          source_file: fileName,
          item_count: totalItems,
        })
        .select('id')
        .single();

      if (batchErr) throw batchErr;
      const batchId = batch.id;

      // 2. Insert ingredients and map names → IDs
      const ingredientNameToId = {};

      if (parsedIngredients.length > 0) {
        const ingredientRows = parsedIngredients.map(
          ({ _tempId, ...item }) => ({
            name: item.name,
            supplier_id: supplierId || null,
            purchase_unit: item.purchase_unit || 'piece',
            purchase_quantity: item.purchase_quantity || 1,
            purchase_price: item.purchase_price || 0,
            items_per_purchase: item.items_per_purchase || 1,
            item_volume: item.item_volume || null,
            item_volume_unit: item.item_volume_unit || null,
            serving_unit: item.serving_unit || null,
            serving_quantity: item.serving_quantity || 1,
            waste_rate: item.waste_rate || 0,
            returnable: item.returnable || false,
            returnable_condition: item.returnable_condition || null,
            perishable: item.perishable || false,
            category: item.category || null,
            batch_id: batchId,
          }),
        );

        const { data: insertedIngredients, error: ingErr } = await supabase
          .from('ingredients')
          .insert(ingredientRows)
          .select('id, name');

        if (ingErr) throw ingErr;

        insertedIngredients.forEach((ing) => {
          ingredientNameToId[ing.name] = ing.id;
        });
      }

      // 3. Insert recipes and their recipe_ingredients
      if (parsedRecipes.length > 0) {
        for (const recipe of parsedRecipes) {
          const { data: insertedRecipe, error: recErr } = await supabase
            .from('recipes')
            .insert({
              name: recipe.name,
              type: recipe.type || null,
              selling_price: recipe.selling_price || 0,
              batch_id: batchId,
            })
            .select('id')
            .single();

          if (recErr) throw recErr;

          // Insert recipe_ingredients
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            const riRows = recipe.ingredients
              .map((ri) => {
                const ingredientId = ingredientNameToId[ri.ingredient_name];
                if (!ingredientId) return null;
                return {
                  recipe_id: insertedRecipe.id,
                  ingredient_id: ingredientId,
                  quantity_used: ri.quantity_used || 1,
                  unit: ri.unit || 'pce',
                };
              })
              .filter(Boolean);

            if (riRows.length > 0) {
              const { error: riErr } = await supabase
                .from('recipe_ingredients')
                .insert(riRows);

              if (riErr) throw riErr;
            }
          }
        }
      }

      // 4. Insert fixed costs
      if (parsedFixedCosts.length > 0) {
        const fcRows = parsedFixedCosts.map(({ _tempId, ...item }) => ({
          name: item.name,
          supplier_id: supplierId || null,
          amount: item.amount || 0,
          category: item.category || 'autre',
          batch_id: batchId,
        }));

        const { error: fcErr } = await supabase
          .from('fixed_costs')
          .insert(fcRows);

        if (fcErr) throw fcErr;
      }

      set({ step: 'done', loading: false });
      await get().fetchBatches();
    } catch (err) {
      set({ error: err.message, loading: false, step: 'review' });
      throw err;
    }
  },

  // --- Rollback ---

  rollbackBatch: async (batchId) => {
    set({ loading: true, error: null });
    try {
      // 1. Delete recipe_ingredients for recipes in this batch
      //    (CASCADE handles this when we delete recipes, but be explicit)
      const { data: batchRecipes } = await supabase
        .from('recipes')
        .select('id')
        .eq('batch_id', batchId);

      if (batchRecipes && batchRecipes.length > 0) {
        const recipeIds = batchRecipes.map((r) => r.id);
        const { error: riErr } = await supabase
          .from('recipe_ingredients')
          .delete()
          .in('recipe_id', recipeIds);
        if (riErr) throw riErr;
      }

      // 2. Delete recipes
      const { error: recErr } = await supabase
        .from('recipes')
        .delete()
        .eq('batch_id', batchId);
      if (recErr) throw recErr;

      // 3. Delete ingredients
      const { error: ingErr } = await supabase
        .from('ingredients')
        .delete()
        .eq('batch_id', batchId);
      if (ingErr) throw ingErr;

      // 4. Delete fixed costs
      const { error: fcErr } = await supabase
        .from('fixed_costs')
        .delete()
        .eq('batch_id', batchId);
      if (fcErr) throw fcErr;

      // 5. Delete the batch record
      const { error: batchErr } = await supabase
        .from('import_batches')
        .delete()
        .eq('id', batchId);
      if (batchErr) throw batchErr;

      set({ loading: false });
      await get().fetchBatches();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // --- History ---

  fetchBatches: async () => {
    try {
      const { data, error } = await supabase
        .from('import_batches')
        .select('*, supplier:suppliers(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ batches: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // --- Reset ---

  resetWizard: () => {
    set({
      step: 'upload',
      pdfText: '',
      fileName: '',
      supplierId: null,
      parsedIngredients: [],
      parsedRecipes: [],
      parsedFixedCosts: [],
      loading: false,
      error: null,
    });
  },
}));

export { usePdfImportStore };

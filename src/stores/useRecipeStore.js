import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useRecipeStore = create((set, get) => ({
  recipes: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_ingredients(*, ingredient:ingredients(*))')
        .order('name');

      if (error) throw error;

      set({ recipes: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: created, error } = await supabase
        .from('recipes')
        .insert(data)
        .select('id')
        .single();

      if (error) throw error;

      await get().fetchAll();
      return created.id;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('recipes')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addIngredient: async (recipeId, ingredientId, quantity, unit) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: recipeId,
          ingredient_id: ingredientId,
          quantity_used: quantity,
          unit,
        });

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateIngredient: async (riId, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .update(data)
        .eq('id', riId);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeIngredient: async (riId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('id', riId);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  bulkAddIngredients: async (rows) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .upsert(rows, { onConflict: 'recipe_id,ingredient_id' });

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export { useRecipeStore };

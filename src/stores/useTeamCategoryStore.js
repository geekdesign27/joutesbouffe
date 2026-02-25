import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useTeamCategoryStore = create((set, get) => ({
  teamCategories: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('team_categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      set({ teamCategories: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('team_categories')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export { useTeamCategoryStore };

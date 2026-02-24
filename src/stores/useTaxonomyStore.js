import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useTaxonomyStore = create((set, get) => ({
  items: {},
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('taxonomies')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      const grouped = {};
      data.forEach((item) => {
        if (!grouped[item.type]) grouped[item.type] = [];
        grouped[item.type].push(item);
      });

      set({ items: grouped, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchByType: async (type) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('taxonomies')
        .select('*')
        .eq('type', type)
        .order('sort_order');

      if (error) throw error;

      set((state) => ({
        items: { ...state.items, [type]: data },
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('taxonomies')
        .insert(data);

      if (error) throw error;

      await get().fetchByType(data.type);
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('taxonomies')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await get().fetchByType(data.type);
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  remove: async (id, type) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('taxonomies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchByType(type);
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  getOptions: (type) => {
    const items = get().items[type] || [];
    return items.map((item) => ({ value: item.value, label: item.label }));
  },

  getValues: (type) => {
    const items = get().items[type] || [];
    return items.map((item) => item.value);
  },

  getLabelMap: (type) => {
    const items = get().items[type] || [];
    const map = {};
    items.forEach((item) => { map[item.value] = item.label; });
    return map;
  },
}));

export { useTaxonomyStore };

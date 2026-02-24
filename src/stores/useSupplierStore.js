import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useSupplierStore = create((set, get) => ({
  suppliers: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;

      set({ suppliers: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert(data);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  bulkCreate: async (items) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert(items);

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
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export { useSupplierStore };

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useProfileStore = create((set, get) => ({
  profiles: [],
  rights: [],
  payingConsumption: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [profilesRes, rightsRes, payingRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('sort_order'),
        supabase
          .from('profile_rights')
          .select('*'),
        supabase
          .from('profile_paying_consumption')
          .select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (rightsRes.error) throw rightsRes.error;
      if (payingRes.error) throw payingRes.error;

      set({
        profiles: profilesRes.data,
        rights: rightsRes.data,
        payingConsumption: payingRes.data,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
        .delete()
        .eq('id', id)
        .eq('is_system', false);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addRight: async (data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profile_rights')
        .insert(data);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateRight: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profile_rights')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  removeRight: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profile_rights')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  upsertPayingConsumption: async (data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profile_paying_consumption')
        .upsert(data);

      if (error) throw error;

      await get().fetchAll();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export { useProfileStore };

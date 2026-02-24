import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useConfigStore = create((set, get) => ({
  config: null,
  loading: false,
  error: null,

  fetchConfig: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;

      set({ config: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateConfig: async (data) => {
    set({ loading: true, error: null });
    try {
      const config = get().config;
      if (!config) throw new Error('No config loaded');

      const { error } = await supabase
        .from('event_config')
        .update(data)
        .eq('id', config.id);

      if (error) throw error;

      await get().fetchConfig();
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export { useConfigStore };

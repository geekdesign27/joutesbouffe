import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useProjectionStore = create((set, get) => ({
  headcounts: [],
  volunteerShifts: [],
  consumptionRates: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [headcountsRes, shiftsRes, ratesRes] = await Promise.all([
        supabase
          .from('headcount_estimates')
          .select('*, profile:profiles(name, color)'),
        supabase
          .from('volunteer_shifts')
          .select('*'),
        supabase
          .from('consumption_rates')
          .select('*'),
      ]);

      if (headcountsRes.error) throw headcountsRes.error;
      if (shiftsRes.error) throw shiftsRes.error;
      if (ratesRes.error) throw ratesRes.error;

      set({
        headcounts: headcountsRes.data,
        volunteerShifts: shiftsRes.data,
        consumptionRates: ratesRes.data,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateHeadcount: async (id, data) => {
    // Optimistic local update
    set((state) => ({
      headcounts: state.headcounts.map((h) =>
        h.id === id ? { ...h, ...data } : h
      ),
    }));
    try {
      const { error } = await supabase
        .from('headcount_estimates')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      // Rollback on error: refetch
      await get().fetchAll();
      throw err;
    }
  },

  updateVolunteerShift: async (id, data) => {
    set((state) => ({
      volunteerShifts: state.volunteerShifts.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    }));
    try {
      const { error } = await supabase
        .from('volunteer_shifts')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      await get().fetchAll();
      throw err;
    }
  },

  upsertConsumptionRate: async (data) => {
    // Optimistic local update
    set((state) => {
      const idx = state.consumptionRates.findIndex(
        (cr) =>
          cr.profile_id === data.profile_id &&
          cr.recipe_category === data.recipe_category &&
          cr.scenario === data.scenario
      );
      if (idx >= 0) {
        const updated = [...state.consumptionRates];
        updated[idx] = { ...updated[idx], ...data };
        return { consumptionRates: updated };
      }
      // New entry — add with temp id
      return {
        consumptionRates: [...state.consumptionRates, { ...data, id: `temp-${Date.now()}` }],
      };
    });
    try {
      const { error } = await supabase
        .from('consumption_rates')
        .upsert(data, {
          onConflict: 'profile_id, recipe_category, scenario',
        });

      if (error) throw error;
    } catch (err) {
      await get().fetchAll();
      throw err;
    }
  },
}));

export { useProjectionStore };

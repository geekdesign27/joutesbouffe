import { useEffect, useState } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

export function EventConfig() {
  const { config, loading, fetchConfig, updateConfig } = useConfigStore();
  const toast = useToast();
  const [form, setForm] = useState(null);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);
  useEffect(() => { if (config) setForm({ ...config }); }, [config]);

  const debouncedForm = useDebounce(form, 500);

  useEffect(() => {
    if (!debouncedForm || !config) return;
    if (JSON.stringify(debouncedForm) === JSON.stringify(config)) return;
    updateConfig(debouncedForm)
      .then(() => toast.success('Configuration sauvegardée'))
      .catch((err) => toast.error(err.message));
  }, [debouncedForm]);

  if (loading || !form) return <LoadingSpinner />;

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const totalPlayers = (form.total_teams || 0) * (form.players_per_team || 0);

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">Paramètres de la manifestation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField label="Nom de l'événement">
            <Input type="text" value={form.event_name || ''} onChange={handleChange('event_name')} />
          </FormField>
          <FormField label="Date">
            <Input type="date" value={form.event_date || ''} onChange={handleChange('event_date')} />
          </FormField>
          <FormField label="Heure de début">
            <Input type="text" value={form.start_time || ''} onChange={handleChange('start_time')} placeholder="12:30" />
          </FormField>
          <FormField label="Heure de fin">
            <Input type="text" value={form.end_time || ''} onChange={handleChange('end_time')} placeholder="02:00" />
          </FormField>
          <FormField label="Durée d'un shift (heures)">
            <Input type="number" value={form.shift_duration_hours || ''} onChange={handleChange('shift_duration_hours')} min="1" />
          </FormField>
          <FormField label="Intervalle service boissons (heures)">
            <Input type="number" value={form.service_interval_hours || ''} onChange={handleChange('service_interval_hours')} min="1" />
          </FormField>
          <FormField label="Nombre d'équipes">
            <Input type="number" value={form.total_teams || ''} onChange={handleChange('total_teams')} min="0" />
          </FormField>
          <FormField label="Joueurs par équipe">
            <Input type="number" value={form.players_per_team || ''} onChange={handleChange('players_per_team')} min="0" />
          </FormField>
          <FormField label="Nombre d'arbitres">
            <Input type="number" value={form.total_referees || ''} onChange={handleChange('total_referees')} min="0" />
          </FormField>
          <FormField label="Boissons offertes par arbitre">
            <Input type="number" value={form.beverages_per_referee || ''} onChange={handleChange('beverages_per_referee')} min="0" />
          </FormField>
        </div>
        <div className="alert alert-info mt-4">
          <span>Total joueurs (pompiers) : <strong>{totalPlayers}</strong> ({form.total_teams} équipes × {form.players_per_team} joueurs)</span>
        </div>
      </div>
    </div>
  );
}

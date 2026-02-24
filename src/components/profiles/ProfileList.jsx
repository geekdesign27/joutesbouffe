import { useEffect, useState } from 'react';
import { useProfileStore } from '../../stores/useProfileStore';
import { useToast } from '../../hooks/useToast';
import { ProfileRights } from './ProfileRights';
import { MixedConsumption } from './MixedConsumption';
import { VolunteerShifts } from './VolunteerShifts';
import { LoadingSpinner } from '../shared/LoadingSpinner';

export function ProfileList() {
  const { profiles, loading, fetchAll } = useProfileStore();
  const toast = useToast();
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profils de consommateurs</h2>
      <div className="space-y-3">
        {profiles.map((profile) => (
          <div key={profile.id} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: profile.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{profile.name}</h3>
                    <span className="text-xs text-base-content/60">
                      {profile.type === 'paying' && 'Public payant'}
                      {profile.type === 'mixed' && 'Mixte (offert + payant)'}
                      {profile.type === 'shift_based' && 'Bénévole (par shift)'}
                      {profile.type === 'offered' && 'Offert'}
                    </span>
                  </div>
                  {profile.is_system && (
                    <span className="badge badge-ghost badge-xs">Système</span>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setExpanded(expanded === profile.id ? null : profile.id)}
                >
                  {expanded === profile.id ? 'Fermer' : 'Détails'}
                </button>
              </div>

              {expanded === profile.id && (
                <div className="mt-4 space-y-4">
                  {(profile.type === 'mixed' || profile.type === 'offered' || profile.type === 'shift_based') && (
                    <ProfileRights profileId={profile.id} />
                  )}
                  {profile.has_paying_consumption && (
                    <MixedConsumption profileId={profile.id} />
                  )}
                  {profile.type === 'shift_based' && (
                    <VolunteerShifts />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

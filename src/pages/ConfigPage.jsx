import { EventConfig } from '../components/config/EventConfig';
import { TeamCotisations } from '../components/config/TeamCotisations';

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <EventConfig />
      <TeamCotisations />
    </div>
  );
}

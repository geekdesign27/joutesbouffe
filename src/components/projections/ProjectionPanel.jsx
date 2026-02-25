import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function ProjectionPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/profils', { replace: true });
  }, [navigate]);

  return null;
}

import { useState } from 'react';

export default function AccessGate({ onGranted }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === import.meta.env.VITE_ACCESS_CODE) {
      localStorage.setItem('access_granted', 'true');
      onGranted();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-2xl">CateringCalc</h1>
          <p className="text-base-content/60">Joutes Inter-Pompiers — CP Moncor</p>
          <form onSubmit={handleSubmit} className="w-full mt-4 space-y-4">
            <input
              type="password"
              className="input w-full"
              placeholder="Code d'accès"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              autoFocus
            />
            {error && (
              <p className="text-error text-sm">Code incorrect</p>
            )}
            <button type="submit" className="btn btn-primary w-full">
              Entrer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

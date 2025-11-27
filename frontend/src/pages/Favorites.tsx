
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Favorites() {
  const [user, setUser] = useState(null);

  useEffect(()=>{ api.get('/users/me').then(r=>setUser(r.data)); }, []);

  if (!user) return <div className="loading loading-spinner"></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Favorites</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {user.favorites?.map(l=> (
          <a key={l._id} href={`/listing/${l._id}`} className="card bg-base-100 shadow p-4">
            <h3 className="font-semibold">{l.title}</h3>
            <p className="text-sm opacity-70">{l.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

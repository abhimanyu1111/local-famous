import { useState, useEffect } from 'react';

export interface User {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return { user, setUser };
}

import { useState } from 'react';
import { api } from '../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // ✅ Validation
    if (!name || !email || !password) {
      return setError('⚠️ All fields are required');
    }

    if (!validateEmail(email)) {
      return setError('⚠️ Please enter a valid email address');
    }

    if (password.length < 6) {
      return setError('⚠️ Password must be at least 6 characters long');
    }

    try {
      setLoading(true);
      await api.post('/auth/register', { name, email, password });
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      className="card bg-base-100 shadow p-6 max-w-md mx-auto space-y-3 mt-10"
      onSubmit={submit}
    >
      <h1 className="text-xl font-bold text-center">Create Account</h1>

      {error && (
        <div className="alert alert-error text-sm py-2">{error}</div>
      )}

      <input
        className="input input-bordered w-full"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input input-bordered w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />

      <input
        type="password"
        className="input input-bordered w-full"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button 
        className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`} 
        type="submit"
      >
        {loading ? (
          <>
            <span className="loading loading-spinner"></span>
            Creating...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}

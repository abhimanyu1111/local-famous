import { useState } from 'react';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('⚠️ Email and password cannot be empty');
    }

    if (!validateEmail(email)) {
      return setError('⚠️ Please enter a valid email address');
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      className="card bg-base-100 shadow p-6 max-w-md mx-auto space-y-3 mt-10"
      onSubmit={submit}
    >
      <h1 className="text-xl font-bold text-center">Login</h1>

      {error && (
        <div className="alert alert-error text-sm py-2">
          {error}
        </div>
      )}

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
        placeholder="Password"
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
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
}

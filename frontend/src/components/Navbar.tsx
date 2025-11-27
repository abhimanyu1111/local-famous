import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load user from localStorage
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleLinkClick = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      {/* Left: Logo */}
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Local&Famous
        </Link>
      </div>

      {/* Right: Desktop menu */}
      <nav className="hidden md:flex">
        <ul className="menu menu-horizontal px-1 items-center gap-1">
          <li><Link to="/about">About</Link></li>{/* ✅ NEW */}
          <li><Link to="/favorites">Favorites</Link></li>
          <li><Link to="/vendor">Vendor</Link></li>
          {user?.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
          {user ? (
            <>
              <li><Link to="/profile">Profile</Link></li>
              <li>
                <button className="btn btn-sm btn-outline" onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>

      {/* Mobile menu */}
      <div className="md:hidden" ref={dropdownRef}>
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-ghost p-2"
            onClick={() => setMenuOpen((s) => !s)}
          >
            {/* Hamburger Icon */}
            {!menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </label>

          {menuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-56 animate-fadeIn"
            >
              <li>
                <button onClick={() => handleLinkClick('/about')}>About</button> {/* ✅ NEW */}
              </li>
              <li>
                <button onClick={() => handleLinkClick('/favorites')}>Favorites</button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/vendor')}>Vendor</button>
              </li>

              {user?.role === 'admin' && (
                <li>
                  <button onClick={() => handleLinkClick('/admin')}>Admin</button>
                </li>
              )}

              {user ? (
                <>
                  <li>
                    <button onClick={() => handleLinkClick('/profile')}>Profile</button>
                  </li>
                  <li>
                    <button onClick={logout} className="text-error">Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button onClick={() => handleLinkClick('/login')}>Login</button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick('/register')}>Register</button>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}

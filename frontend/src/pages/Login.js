import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back! 🏏');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'absolute', top: '-200px', left: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', right: '-200px',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(233,69,96,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '12px' }}>🏏</div>
          <h1 style={{
            fontFamily: 'Bebas Neue', fontSize: '48px',
            letterSpacing: '4px', color: '#ffd700',
            textShadow: '0 0 30px rgba(255,215,0,0.4)',
          }}>
            SPL AUCTION
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>
            Admin Console
          </p>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>
            MAdE WITH ❤️ BY JAGANNATH
          </p>
        </div>

        {/* Form */}
        <div className="card-glass" style={{ padding: '32px' }}>
          <h2 style={{ fontFamily: 'Rajdhani', fontSize: '20px', marginBottom: '24px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Sign In
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@ipla.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In 🏏'}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,215,0,0.05)', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.1)' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textAlign: 'center' }}>
              Default: <span style={{ color: 'var(--accent-gold)' }}>admin@ipla.com</span> / <span style={{ color: 'var(--accent-gold)' }}>admin123</span>
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textAlign: 'center', marginTop: '4px' }}>
              (POST /api/auth/admin/seed to create admin)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

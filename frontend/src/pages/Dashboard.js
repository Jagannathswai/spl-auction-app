import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi, useAuthStore } from '../store';
import { MdPeople, MdGroups, MdMeetingRoom, MdTrendingUp, MdArrowForward } from 'react-icons/md';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = getApi();
    Promise.all([
      api.get('/players/stats/summary'),
      api.get('/rooms'),
      api.get('/teams'),
    ]).then(([pRes, rRes, tRes]) => {
      setStats({ players: pRes.data.stats, teamsCount: tRes.data.teams?.length || 0 });
      setRooms(rRes.data.rooms || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Players', value: stats.players.total, icon: '🏏', color: '#ffd700', sub: `${stats.players.sold} sold` },
    { label: 'Teams', value: stats.teamsCount, icon: '🏆', color: '#00d4ff', sub: 'Registered teams' },
    { label: 'Sold Players', value: stats.players.sold, icon: '✅', color: '#00ff88', sub: `₹${stats.players.totalSoldAmount}L spent` },
    { label: 'Unsold Players', value: stats.players.unsold, icon: '❌', color: '#e94560', sub: `${stats.players.available} available` },
  ] : [];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px', color: 'var(--accent-gold)', letterSpacing: '4px' }}>
        LOADING...
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>
          DASHBOARD
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>
          Welcome back, <strong style={{ color: '#fff' }}>{user?.name}</strong> • {new Date().toDateString()}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '28px' }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Active Rooms */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🏟️ Auction Rooms
          </h2>
          <button className="btn btn-ghost" onClick={() => navigate('/rooms')} style={{ fontSize: '12px' }}>
            View All <MdArrowForward />
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏟️</div>
            <p style={{ fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>No rooms created yet</p>
            {user?.role === 'admin' && (
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/rooms')}>
                Create Room
              </button>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {rooms.slice(0, 6).map(room => (
              <div key={room._id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/auction/${room._id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: '700' }}>{room.name}</h3>
                  <span className={`badge ${room.status === 'active' ? 'badge-green' : room.status === 'completed' ? 'badge-blue' : 'badge-gray'}`}>
                    {room.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: '12px' }}>
                  Code: <strong style={{ color: 'var(--accent-gold)' }}>{room.code}</strong> • {room.teams?.length || 0} teams
                </div>
                <button className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
                  Enter Room <MdArrowForward />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions for admin */}
      {user?.role === 'admin' && (
        <div>
          <h2 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            ⚡ Quick Actions
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Add Player', icon: '🏏', action: () => navigate('/players'), style: 'btn-primary' },
              { label: 'Add Team', icon: '🏆', action: () => navigate('/teams'), style: 'btn-blue' },
              { label: 'Create Room', icon: '🏟️', action: () => navigate('/rooms'), style: 'btn-success' },
              { label: 'View Analytics', icon: '📊', action: () => navigate('/analytics'), style: 'btn-ghost' },
            ].map(({ label, icon, action, style }) => (
              <button key={label} className={`btn ${style}`} onClick={action}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

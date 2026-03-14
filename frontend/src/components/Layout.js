import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { 
  MdDashboard, MdPeople, MdGroups, MdSportsCricket, 
  MdBarChart, MdLogout, MdMenu, MdClose, MdMeetingRoom,
  MdDarkMode, MdLightMode
} from 'react-icons/md';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: MdDashboard, label: 'Dashboard', exact: true },
  { to: '/players', icon: MdPeople, label: 'Players' },
  { to: '/teams', icon: MdGroups, label: 'Teams' },
  { to: '/rooms', icon: MdMeetingRoom, label: 'Auction Rooms' },
  { to: '/analytics', icon: MdBarChart, label: 'Analytics' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}>🏏</div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '2px', color: '#ffd700' }}>
                SPL AUCTION
              </div>
              <div style={{ fontSize: '10px', color: '#a0a0c0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Admin Console  (made By Jagannath)
              </div>
              
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                marginBottom: '4px',
                transition: 'all 0.2s',
                background: isActive ? 'rgba(255,215,0,0.1)' : 'transparent',
                color: isActive ? '#ffd700' : '#a0a0c0',
                fontFamily: 'Rajdhani',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                borderLeft: isActive ? '3px solid #ffd700' : '3px solid transparent',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', marginBottom: '8px'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e94560, #6c63ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Bebas Neue', fontSize: '16px'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'Rajdhani', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '10px', color: '#a0a0c0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {user?.role === 'admin' ? '⭐ Admin' : '🏆 Team Owner'}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
            <MdLogout size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Top bar */}
        <div style={{
          height: 64, padding: '0 24px', display: 'flex', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(18,18,42,0.9)', backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginRight: '16px' }}
            className="mobile-menu-btn"
          >
            {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-gold" style={{ fontSize: '12px' }}>
              🏏 SPL 2026
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '24px' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { getApi } from '../store';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const chartDefaults = {
  responsive: true,
  plugins: { legend: { labels: { color: '#a0a0c0', font: { family: 'Rajdhani', size: 12 } } } },
  scales: {
    x: { ticks: { color: '#a0a0c0', font: { family: 'Rajdhani' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#a0a0c0', font: { family: 'Rajdhani' } }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

export default function Analytics() {
  const [teams, setTeams] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = getApi();
    Promise.all([
      api.get('/teams').then(r => setTeams(r.data.teams || [])),
      api.get('/players/stats/summary').then(r => setPlayerStats(r.data.stats)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent-gold)', letterSpacing: '3px' }}>LOADING ANALYTICS...</div>;

  const teamsWithData = teams.filter(t => t.purse);

  const purseData = {
    labels: teamsWithData.map(t => t.shortName),
    datasets: [
      {
        label: 'Spent (L)',
        data: teamsWithData.map(t => t.purse - t.purseRemaining),
        backgroundColor: teamsWithData.map(t => t.primaryColor + 'cc'),
        borderColor: teamsWithData.map(t => t.primaryColor),
        borderWidth: 2,
      },
      {
        label: 'Remaining (L)',
        data: teamsWithData.map(t => t.purseRemaining),
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
      }
    ]
  };

  const playersData = {
    labels: teamsWithData.map(t => t.shortName),
    datasets: [{
      label: 'Players',
      data: teamsWithData.map(t => t.players?.length || 0),
      backgroundColor: teamsWithData.map(t => t.primaryColor + 'cc'),
      borderColor: teamsWithData.map(t => t.primaryColor),
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const playerStatusData = playerStats ? {
    labels: ['Available', 'Sold', 'Unsold', 'In Auction'],
    datasets: [{
      data: [playerStats.available, playerStats.sold, playerStats.unsold, playerStats.inAuction],
      backgroundColor: ['#ffd700cc', '#00ff88cc', '#e94560cc', '#00d4ffcc'],
      borderColor: ['#ffd700', '#00ff88', '#e94560', '#00d4ff'],
      borderWidth: 2,
    }]
  } : null;

  const roleData = {
    labels: ['Batsmen', 'Bowlers', 'All-Rounders', 'Wicket-Keepers'],
    datasets: [{
      data: [
        teams.reduce((a, t) => a + (t.stats?.batsmen || 0), 0),
        teams.reduce((a, t) => a + (t.stats?.bowlers || 0), 0),
        teams.reduce((a, t) => a + (t.stats?.allRounders || 0), 0),
        teams.reduce((a, t) => a + (t.stats?.wicketKeepers || 0), 0),
      ],
      backgroundColor: ['#ffd700cc', '#e94560cc', '#00d4ffcc', '#00ff88cc'],
      borderColor: ['#ffd700', '#e94560', '#00d4ff', '#00ff88'],
      borderWidth: 2,
    }]
  };

  const pieOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#a0a0c0', font: { family: 'Rajdhani', size: 12 } } } }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>ANALYTICS</h1>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>Auction statistics and insights</p>
      </div>

      {/* Key metrics */}
      {playerStats && (
        <div className="grid-4" style={{ marginBottom: '28px' }}>
          {[
            { label: 'Total Players', value: playerStats.total, color: 'var(--accent-gold)' },
            { label: 'Sold', value: playerStats.sold, color: 'var(--accent-green)' },
            { label: 'Total Spent', value: `₹${playerStats.totalSoldAmount}L`, color: 'var(--accent-blue)' },
            { label: 'Highest Sale', value: playerStats.highestSold ? `₹${playerStats.highestSold.soldPrice}L` : '-', color: 'var(--accent-red)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div className="stat-value" style={{ color: s.color, fontSize: '28px' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            💰 Team Purse Usage
          </h3>
          {teamsWithData.length > 0 ? <Bar data={purseData} options={chartDefaults} /> : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No team data</p>}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            🏏 Players per Team
          </h3>
          {teamsWithData.length > 0 ? <Bar data={playersData} options={chartDefaults} /> : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No data</p>}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            📊 Player Status
          </h3>
          {playerStatusData ? <Doughnut data={playerStatusData} options={pieOptions} /> : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No data</p>}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            🎯 Sold Players by Role
          </h3>
          <Pie data={roleData} options={pieOptions} />
        </div>
      </div>

      {/* Teams breakdown table */}
      {teamsWithData.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            Team Breakdown
          </h3>
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Team</th><th>Players</th><th>Batsmen</th><th>Bowlers</th><th>AR</th><th>WK</th><th>Overseas</th><th>Spent</th><th>Remaining</th>
              </tr></thead>
              <tbody>
                {teamsWithData.map(team => (
                  <tr key={team._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: team.primaryColor, flexShrink: 0 }} />
                        <span style={{ fontWeight: '600' }}>{team.name}</span>
                        <span className="badge badge-gray">{team.shortName}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Rajdhani', fontWeight: '700' }}>{team.players?.length || 0} / {team.maxPlayers}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{team.stats?.batsmen || 0}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{team.stats?.bowlers || 0}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{team.stats?.allRounders || 0}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{team.stats?.wicketKeepers || 0}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{team.stats?.overseas || 0}</td>
                    <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-red)' }}>₹{team.purse - team.purseRemaining}L</td>
                    <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-green)' }}>₹{team.purseRemaining}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

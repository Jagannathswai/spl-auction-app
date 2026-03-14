// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getApi, useAuthStore } from '../store';
// import toast from 'react-hot-toast';
// import { MdAdd, MdEdit, MdDelete, MdClose, MdArrowForward, MdContentCopy, MdSettings, MdPeople, MdGroups } from 'react-icons/md';

// const defaultForm = { name: '', description: '', settings: { timerDuration: 30, bidIncrement: 5, autoNextPlayer: false, allowUnsold: true, maxOverseaPlayers: 8 } };

// export default function Rooms() {
//   const { user } = useAuthStore();
//   const isAdmin = user?.role === 'admin';
//   const navigate = useNavigate();
//   const [rooms, setRooms] = useState([]);
//   const [allPlayers, setAllPlayers] = useState([]);
//   const [allTeams, setAllTeams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [showManageModal, setShowManageModal] = useState(false);
//   const [managingRoom, setManagingRoom] = useState(null);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(defaultForm);
//   const [saving, setSaving] = useState(false);
//   const [manageTab, setManageTab] = useState('players');

//   const fetchRooms = async () => {
//     try {
//       const api = getApi();
//       const [roomsRes, playersRes, teamsRes] = await Promise.all([
//         api.get('/rooms'),
//         api.get('/players'),
//         api.get('/teams'),
//       ]);
//       setRooms(roomsRes.data.rooms || []);
//       setAllPlayers(playersRes.data.players || []);
//       setAllTeams(teamsRes.data.teams || []);
//     } catch { toast.error('Failed to load rooms'); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchRooms(); }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const api = getApi();
//       if (editing) { await api.put('/rooms/' + editing, form); toast.success('Room updated!'); }
//       else { await api.post('/rooms', form); toast.success('Room created!'); }
//       setShowModal(false);
//       fetchRooms();
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm('Delete room "' + name + '"?')) return;
//     try { await getApi().delete('/rooms/' + id); toast.success('Room deleted'); fetchRooms(); }
//     catch { toast.error('Failed'); }
//   };

//   const copyCode = (code) => {
//     navigator.clipboard.writeText(code);
//     toast.success('Room code copied!');
//   };

//   const openManage = (room) => {
//     setManagingRoom(room);
//     setManageTab('players');
//     setShowManageModal(true);
//   };

//   const addPlayerToRoom = async (playerId) => {
//     try {
//       await getApi().put('/rooms/' + managingRoom._id + '/add-player', { playerId });
//       toast.success('Player added!');
//       setManagingRoom(prev => ({ ...prev, players: [...(prev.players || []), playerId] }));
//       fetchRooms();
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//   };

//   const addTeamToRoom = async (teamId) => {
//     try {
//       await getApi().put('/rooms/' + managingRoom._id + '/add-team', { teamId });
//       toast.success('Team added!');
//       setManagingRoom(prev => ({ ...prev, teams: [...(prev.teams || []), teamId] }));
//       fetchRooms();
//     } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
//   };

//   const isPlayerInRoom = (playerId) => managingRoom?.players?.some(p => (p._id || p) === playerId);
//   const isTeamInRoom = (teamId) => managingRoom?.teams?.some(t => (t._id || t) === teamId);

//   const addAllPlayers = async () => {
//     const api = getApi();
//     const toAdd = allPlayers.filter(p => !isPlayerInRoom(p._id));
//     for (const player of toAdd) {
//       await api.put('/rooms/' + managingRoom._id + '/add-player', { playerId: player._id });
//     }
//     toast.success(toAdd.length + ' players added!');
//     setManagingRoom(prev => ({ ...prev, players: allPlayers.map(p => p._id) }));
//     fetchRooms();
//   };

//   const addAllTeams = async () => {
//     const api = getApi();
//     const toAdd = allTeams.filter(t => !isTeamInRoom(t._id));
//     for (const team of toAdd) {
//       await api.put('/rooms/' + managingRoom._id + '/add-team', { teamId: team._id });
//     }
//     toast.success(toAdd.length + ' teams added!');
//     setManagingRoom(prev => ({ ...prev, teams: allTeams.map(t => t._id) }));
//     fetchRooms();
//   };

//   const statusColor = { waiting: '#ffd700', active: '#00ff88', paused: '#ff8c00', completed: '#a0a0c0' };

//   if (loading) return <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent-gold)', letterSpacing: '3px' }}>LOADING...</div>;

//   return (
//     <div className="fade-in">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
//         <div>
//           <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>AUCTION ROOMS</h1>
//           <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>{rooms.length} rooms total</p>
//         </div>
//         {isAdmin && <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}><MdAdd size={18} /> Create Room</button>}
//       </div>

//       {rooms.length === 0 ? (
//         <div className="card" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
//           <div style={{ fontSize: '60px' }}>🏟️</div>
//           <h3 style={{ fontFamily: 'Rajdhani', textTransform: 'uppercase', fontSize: '20px', marginTop: '12px' }}>No Auction Rooms</h3>
//           {isAdmin && <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}>Create First Room</button>}
//         </div>
//       ) : (
//         <div className="grid-3">
//           {rooms.map(room => (
//             <div key={room._id} className="card">
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
//                 <div>
//                   <h3 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{room.name}</h3>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                     <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[room.status] || '#888' }} />
//                     <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>{room.status}</span>
//                   </div>
//                 </div>
//                 {isAdmin && (
//                   <div style={{ display: 'flex', gap: '4px' }}>
//                     <button className="btn btn-ghost" style={{ padding: '5px 8px' }} title="Manage" onClick={() => openManage(room)}><MdSettings size={13} /></button>
//                     <button className="btn btn-ghost" style={{ padding: '5px 8px' }} onClick={() => { setEditing(room._id); setForm({ name: room.name, description: room.description || '', settings: room.settings }); setShowModal(true); }}><MdEdit size={13} /></button>
//                     <button className="btn btn-danger" style={{ padding: '5px 8px' }} onClick={() => handleDelete(room._id, room.name)}><MdDelete size={13} /></button>
//                   </div>
//                 )}
//               </div>

//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
//                 <span style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '4px', color: 'var(--accent-gold)' }}>{room.code}</span>
//                 <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => copyCode(room.code)}><MdContentCopy size={12} /> Copy</button>
//               </div>

//               <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani' }}>
//                 <span style={{ color: room.teams?.length > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>🏆 {room.teams?.length || 0} teams</span>
//                 <span style={{ color: room.players?.length > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>🏏 {room.players?.length || 0} players</span>
//                 <span style={{ color: 'var(--text-secondary)' }}>⏱️ {room.settings?.timerDuration || 30}s</span>
//               </div>

//               {isAdmin && (room.players?.length === 0 || room.teams?.length === 0) && (
//                 <div style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#ff8c00', fontFamily: 'Rajdhani', cursor: 'pointer' }} onClick={() => openManage(room)}>
//                   ⚠️ {room.players?.length === 0 ? 'Players' : ''}{room.players?.length === 0 && room.teams?.length === 0 ? ' & ' : ''}{room.teams?.length === 0 ? 'Teams' : ''} not added yet — Click to manage →
//                 </div>
//               )}

//               <div style={{ display: 'flex', gap: '8px' }}>
//                 {isAdmin && (
//                   <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '8px 12px' }} onClick={() => openManage(room)}>
//                     <MdSettings size={14} /> Manage
//                   </button>
//                 )}
//                 <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/auction/' + room._id)}>
//                   Enter Room <MdArrowForward />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Create/Edit Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
//           <div className="modal">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//               <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>{editing ? 'EDIT ROOM' : 'CREATE ROOM'}</h2>
//               <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowModal(false)}><MdClose /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="form-group">
//                 <label className="form-label">Room Name *</label>
//                 <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. IPL 2024 Mega Auction" required />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Description</label>
//                 <textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{ resize: 'vertical' }} />
//               </div>
//               <h3 style={{ fontFamily: 'Rajdhani', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Settings</h3>
//               <div className="grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Timer (seconds)</label>
//                   <input className="input" type="number" value={form.settings.timerDuration} onChange={e => setForm({...form, settings: {...form.settings, timerDuration: +e.target.value}})} />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Bid Increment (Lakhs)</label>
//                   <input className="input" type="number" value={form.settings.bidIncrement} onChange={e => setForm({...form, settings: {...form.settings, bidIncrement: +e.target.value}})} />
//                 </div>
//               </div>
//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//                 <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create Room'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Manage Players & Teams Modal */}
//       {showManageModal && managingRoom && (
//         <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowManageModal(false)}>
//           <div className="modal" style={{ maxWidth: '680px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//               <div>
//                 <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>MANAGE ROOM</h2>
//                 <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>{managingRoom.name}</p>
//               </div>
//               <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowManageModal(false)}><MdClose /></button>
//             </div>

//             <div className="tabs" style={{ marginBottom: '16px' }}>
//               <button className={'tab ' + (manageTab === 'players' ? 'active' : '')} onClick={() => setManageTab('players')}>
//                 🏏 Players ({managingRoom.players?.length || 0})
//               </button>
//               <button className={'tab ' + (manageTab === 'teams' ? 'active' : '')} onClick={() => setManageTab('teams')}>
//                 🏆 Teams ({managingRoom.teams?.length || 0})
//               </button>
//             </div>

//             {manageTab === 'players' && (
//               <div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
//                   <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Add players to this room</p>
//                   <button className="btn btn-success" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={addAllPlayers}>+ Add All</button>
//                 </div>
//                 <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                   {allPlayers.length === 0 ? (
//                     <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontFamily: 'Rajdhani' }}>No players found. Add from Players page first.</p>
//                   ) : allPlayers.map(player => {
//                     const inRoom = isPlayerInRoom(player._id);
//                     return (
//                       <div key={player._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: inRoom ? 'rgba(0,255,136,0.07)' : 'var(--bg-secondary)', border: '1px solid ' + (inRoom ? 'rgba(0,255,136,0.3)' : 'var(--border)') }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                           <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', overflow: 'hidden', flexShrink: 0 }}>
//                             {player.photo ? <img src={'http://localhost:5000' + player.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏏'}
//                           </div>
//                           <div>
//                             <div style={{ fontWeight: '600', fontSize: '14px' }}>{player.name}</div>
//                             <div style={{ display: 'flex', gap: '6px' }}>
//                               <span className="badge badge-gray" style={{ fontSize: '10px' }}>{player.role}</span>
//                               <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontFamily: 'Rajdhani' }}>₹{player.basePrice}L</span>
//                             </div>
//                           </div>
//                         </div>
//                         {inRoom ? <span className="badge badge-green">✓ Added</span> : <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => addPlayerToRoom(player._id)}>+ Add</button>}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {manageTab === 'teams' && (
//               <div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
//                   <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Add teams to this room</p>
//                   <button className="btn btn-success" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={addAllTeams}>+ Add All</button>
//                 </div>
//                 <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                   {allTeams.length === 0 ? (
//                     <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontFamily: 'Rajdhani' }}>No teams found. Add from Teams page first.</p>
//                   ) : allTeams.map(team => {
//                     const inRoom = isTeamInRoom(team._id);
//                     return (
//                       <div key={team._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: inRoom ? 'rgba(0,255,136,0.07)' : 'var(--bg-secondary)', border: '1px solid ' + (inRoom ? 'rgba(0,255,136,0.3)' : 'var(--border)') }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                           <div style={{ width: 36, height: 36, borderRadius: '8px', background: team.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '13px', overflow: 'hidden', flexShrink: 0 }}>
//                             {team.logo ? <img src={'http://localhost:5000' + team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : team.shortName}
//                           </div>
//                           <div>
//                             <div style={{ fontWeight: '600', fontSize: '14px' }}>{team.name}</div>
//                             <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontFamily: 'Rajdhani' }}>₹{team.purseRemaining}L remaining</div>
//                           </div>
//                         </div>
//                         {inRoom ? <span className="badge badge-green">✓ Added</span> : <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => addTeamToRoom(team._id)}>+ Add</button>}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
//                 ✅ {managingRoom.players?.length || 0} players • {managingRoom.teams?.length || 0} teams
//               </p>
//               <button className="btn btn-primary" onClick={() => { setShowManageModal(false); navigate('/auction/' + managingRoom._id); }}>
//                 Enter Room <MdArrowForward />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdClose, MdArrowForward, MdContentCopy, MdSettings, MdPeople, MdGroups } from 'react-icons/md';

const defaultForm = { name: '', description: '', settings: { timerDuration: 30, bidIncrement: 5, autoNextPlayer: false, allowUnsold: true, maxOverseaPlayers: 8 } };

export default function Rooms() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [managingRoom, setManagingRoom] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [manageTab, setManageTab] = useState('players');

  const fetchRooms = async () => {
    try {
      const api = getApi();
      const [roomsRes, playersRes, teamsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/players'),
        api.get('/teams'),
      ]);
      setRooms(roomsRes.data.rooms || []);
      setAllPlayers(playersRes.data.players || []);
      setAllTeams(teamsRes.data.teams || []);
    } catch { toast.error('Failed to load rooms'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const api = getApi();
      if (editing) { await api.put('/rooms/' + editing, form); toast.success('Room updated!'); }
      else { await api.post('/rooms', form); toast.success('Room created!'); }
      setShowModal(false);
      fetchRooms();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm('Delete room "' + name + '"?')) return;
    try { await getApi().delete('/rooms/' + id); toast.success('Room deleted'); fetchRooms(); }
    catch { toast.error('Failed'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied!');
  };

  const openManage = (room) => {
    setManagingRoom(room);
    setManageTab('players');
    setShowManageModal(true);
  };

  const addPlayerToRoom = async (playerId) => {
    try {
      await getApi().put('/rooms/' + managingRoom._id + '/add-player', { playerId });
      toast.success('Player added!');
      setManagingRoom(prev => ({ ...prev, players: [...(prev.players || []), playerId] }));
      fetchRooms();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addTeamToRoom = async (teamId) => {
    try {
      await getApi().put('/rooms/' + managingRoom._id + '/add-team', { teamId });
      toast.success('Team added!');
      setManagingRoom(prev => ({ ...prev, teams: [...(prev.teams || []), teamId] }));
      fetchRooms();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const isPlayerInRoom = (playerId) => managingRoom?.players?.some(p => (p._id || p) === playerId);
  const isTeamInRoom = (teamId) => managingRoom?.teams?.some(t => (t._id || t) === teamId);

  const addAllPlayers = async () => {
    const api = getApi();
    const toAdd = allPlayers.filter(p => !isPlayerInRoom(p._id));
    for (const player of toAdd) {
      await api.put('/rooms/' + managingRoom._id + '/add-player', { playerId: player._id });
    }
    toast.success(toAdd.length + ' players added!');
    setManagingRoom(prev => ({ ...prev, players: allPlayers.map(p => p._id) }));
    fetchRooms();
  };

  const addAllTeams = async () => {
    const api = getApi();
    const toAdd = allTeams.filter(t => !isTeamInRoom(t._id));
    for (const team of toAdd) {
      await api.put('/rooms/' + managingRoom._id + '/add-team', { teamId: team._id });
    }
    toast.success(toAdd.length + ' teams added!');
    setManagingRoom(prev => ({ ...prev, teams: allTeams.map(t => t._id) }));
    fetchRooms();
  };

  const statusColor = { waiting: '#ffd700', active: '#00ff88', paused: '#ff8c00', completed: '#a0a0c0' };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent-gold)', letterSpacing: '3px' }}>LOADING...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>AUCTION ROOMS</h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>{rooms.length} rooms total</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}><MdAdd size={18} /> Create Room</button>}
      </div>

      {rooms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '60px' }}>🏟️</div>
          <h3 style={{ fontFamily: 'Rajdhani', textTransform: 'uppercase', fontSize: '20px', marginTop: '12px' }}>No Auction Rooms</h3>
          {isAdmin && <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}>Create First Room</button>}
        </div>
      ) : (
        <div className="grid-3">
          {rooms.map(room => (
            <div key={room._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{room.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor[room.status] || '#888' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>{room.status}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost" style={{ padding: '5px 8px' }} title="Manage" onClick={() => openManage(room)}><MdSettings size={13} /></button>
                    <button className="btn btn-ghost" style={{ padding: '5px 8px' }} onClick={() => { setEditing(room._id); setForm({ name: room.name, description: room.description || '', settings: room.settings }); setShowModal(true); }}><MdEdit size={13} /></button>
                    <button className="btn btn-danger" style={{ padding: '5px 8px' }} onClick={() => handleDelete(room._id, room.name)}><MdDelete size={13} /></button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '4px', color: 'var(--accent-gold)' }}>{room.code}</span>
                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => copyCode(room.code)}><MdContentCopy size={12} /> Copy</button>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '13px', fontFamily: 'Rajdhani' }}>
                <span style={{ color: room.teams?.length > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>🏆 {room.teams?.length || 0} teams</span>
                <span style={{ color: room.players?.length > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>🏏 {room.players?.length || 0} players</span>
                <span style={{ color: 'var(--text-secondary)' }}>⏱️ {room.settings?.timerDuration || 30}s</span>
              </div>

              {isAdmin && (room.players?.length === 0 || room.teams?.length === 0) && (
                <div style={{ background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px', fontSize: '12px', color: '#ff8c00', fontFamily: 'Rajdhani', cursor: 'pointer' }} onClick={() => openManage(room)}>
                  ⚠️ {room.players?.length === 0 ? 'Players' : ''}{room.players?.length === 0 && room.teams?.length === 0 ? ' & ' : ''}{room.teams?.length === 0 ? 'Teams' : ''} not added yet — Click to manage →
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                {isAdmin && (
                  <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '8px 12px' }} onClick={() => openManage(room)}>
                    <MdSettings size={14} /> Manage
                  </button>
                )}
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/auction/' + room._id)}>
                  Enter Room <MdArrowForward />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>{editing ? 'EDIT ROOM' : 'CREATE ROOM'}</h2>
              <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Room Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. IPL 2024 Mega Auction" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{ resize: 'vertical' }} />
              </div>
              <h3 style={{ fontFamily: 'Rajdhani', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Settings</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Timer (seconds)</label>
                  <input className="input" type="number" value={form.settings.timerDuration} onChange={e => setForm({...form, settings: {...form.settings, timerDuration: +e.target.value}})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bid Increment (Lakhs)</label>
                  <input className="input" type="number" value={form.settings.bidIncrement} onChange={e => setForm({...form, settings: {...form.settings, bidIncrement: +e.target.value}})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create Room'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Players & Teams Modal */}
      {showManageModal && managingRoom && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowManageModal(false)}>
          <div className="modal" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>MANAGE ROOM</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>{managingRoom.name}</p>
              </div>
              <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowManageModal(false)}><MdClose /></button>
            </div>

            <div className="tabs" style={{ marginBottom: '16px' }}>
              <button className={'tab ' + (manageTab === 'players' ? 'active' : '')} onClick={() => setManageTab('players')}>
                🏏 Players ({managingRoom.players?.length || 0})
              </button>
              <button className={'tab ' + (manageTab === 'teams' ? 'active' : '')} onClick={() => setManageTab('teams')}>
                🏆 Teams ({managingRoom.teams?.length || 0})
              </button>
            </div>

            {manageTab === 'players' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Add players to this room</p>
                  <button className="btn btn-success" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={addAllPlayers}>+ Add All</button>
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allPlayers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontFamily: 'Rajdhani' }}>No players found. Add from Players page first.</p>
                  ) : allPlayers.map(player => {
                    const inRoom = isPlayerInRoom(player._id);
                    return (
                      <div key={player._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: inRoom ? 'rgba(0,255,136,0.07)' : 'var(--bg-secondary)', border: '1px solid ' + (inRoom ? 'rgba(0,255,136,0.3)' : 'var(--border)') }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', overflow: 'hidden', flexShrink: 0 }}>
                            {player.photo ? <img src={'http://localhost:5000' + player.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏏'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{player.name}</div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <span className="badge badge-gray" style={{ fontSize: '10px' }}>{player.role}</span>
                              <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontFamily: 'Rajdhani' }}>₹{player.basePrice}L</span>
                            </div>
                          </div>
                        </div>
                        {inRoom ? <span className="badge badge-green">✓ Added</span> : <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => addPlayerToRoom(player._id)}>+ Add</button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {manageTab === 'teams' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Add teams to this room</p>
                  <button className="btn btn-success" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={addAllTeams}>+ Add All</button>
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allTeams.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px', fontFamily: 'Rajdhani' }}>No teams found. Add from Teams page first.</p>
                  ) : allTeams.map(team => {
                    const inRoom = isTeamInRoom(team._id);
                    return (
                      <div key={team._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: inRoom ? 'rgba(0,255,136,0.07)' : 'var(--bg-secondary)', border: '1px solid ' + (inRoom ? 'rgba(0,255,136,0.3)' : 'var(--border)') }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '8px', background: team.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '13px', overflow: 'hidden', flexShrink: 0 }}>
                            {team.logo ? <img src={'http://localhost:5000' + team.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : team.shortName}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{team.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontFamily: 'Rajdhani' }}>₹{team.purseRemaining}L remaining</div>
                          </div>
                        </div>
                        {inRoom ? <span className="badge badge-green">✓ Added</span> : <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => addTeamToRoom(team._id)}>+ Add</button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
                ✅ {managingRoom.players?.length || 0} players • {managingRoom.teams?.length || 0} teams
              </p>
              <button className="btn btn-primary" onClick={() => { setShowManageModal(false); navigate('/auction/' + managingRoom._id); }}>
                Enter Room <MdArrowForward />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

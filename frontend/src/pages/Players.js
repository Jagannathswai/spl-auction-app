// import React, { useEffect, useState } from 'react';
// import { getApi, useAuthStore } from '../store';
// import toast from 'react-hot-toast';
// import { MdAdd, MdSearch, MdEdit, MdDelete, MdClose, MdUploadFile } from 'react-icons/md';

// const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
// const GRADES = ['A+', 'A', 'B', 'C'];
// const STATUS_OPTIONS = ['available', 'sold', 'unsold', 'in_auction'];

// const defaultForm = {
//   name: '', role: 'Batsman', nationality: 'Indian', age: '',
//   battingStyle: 'Right-Hand', bowlingStyle: '', grade: 'B',
//   basePrice: '', isCapped: false,
//   stats: { matches: 0, runs: 0, wickets: 0, average: 0, strikeRate: 0, economy: 0, centuries: 0, halfCenturies: 0, highestScore: 0, bestBowling: '0/0' }
// };

// export default function Players() {
//   const { user } = useAuthStore();
//   const isAdmin = user?.role === 'admin';
//   const [players, setPlayers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(defaultForm);
//   const [photoFile, setPhotoFile] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [search, setSearch] = useState('');
//   const [filterRole, setFilterRole] = useState('');
//   const [filterStatus, setFilterStatus] = useState('');
//   const [saving, setSaving] = useState(false);

//   const fetchPlayers = async () => {
//     try {
//       const api = getApi();
//       const params = {};
//       if (search) params.search = search;
//       if (filterRole) params.role = filterRole;
//       if (filterStatus) params.status = filterStatus;
//       const { data } = await api.get('/players', { params });
//       setPlayers(data.players || []);
//     } catch (err) {
//       toast.error('Failed to load players');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchPlayers(); }, [search, filterRole, filterStatus]);

//   const openAdd = () => {
//     setEditing(null); setForm(defaultForm); setPhotoFile(null); setPhotoPreview(null); setShowModal(true);
//   };

//   const openEdit = (player) => {
//     setEditing(player._id);
//     setForm({
//       name: player.name, role: player.role, nationality: player.nationality,
//       age: player.age || '', battingStyle: player.battingStyle || 'Right-Hand',
//       bowlingStyle: player.bowlingStyle || '', grade: player.grade,
//       basePrice: player.basePrice, isCapped: player.isCapped,
//       stats: player.stats || defaultForm.stats
//     });
//     setPhotoPreview(player.photo ? `http://localhost:5000${player.photo}` : null);
//     setPhotoFile(null);
//     setShowModal(true);
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setPhotoFile(file);
//     const reader = new FileReader();
//     reader.onload = (ev) => setPhotoPreview(ev.target.result);
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const api = getApi();
//       const formData = new FormData();
      
//       Object.entries(form).forEach(([k, v]) => {
//         if (k === 'stats') formData.append('stats', JSON.stringify(v));
//         else formData.append(k, v);
//       });
//       if (photoFile) formData.append('photo', photoFile);

//       if (editing) {
//         await api.put(`/players/${editing}`, formData);
//         toast.success('Player updated! ✅');
//       } else {
//         await api.post('/players', formData);
//         toast.success('Player added! 🏏');
//       }

//       setShowModal(false);
//       fetchPlayers();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save player');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Delete ${name}?`)) return;
//     try {
//       await getApi().delete(`/players/${id}`);
//       toast.success('Player deleted');
//       fetchPlayers();
//     } catch (err) {
//       toast.error('Failed to delete');
//     }
//   };

//   const statusBadge = (status) => {
//     const map = { sold: 'badge-green', unsold: 'badge-red', available: 'badge-gold', in_auction: 'badge-blue' };
//     return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
//   };

//   return (
//     <div className="fade-in">
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
//         <div>
//           <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>PLAYERS</h1>
//           <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>{players.length} players total</p>
//         </div>
//         {isAdmin && (
//           <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Player</button>
//         )}
//       </div>

//       {/* Filters */}
//       <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
//         <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
//           <MdSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
//           <input className="input" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
//         </div>
//         <select className="input" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: '160px' }}>
//           <option value="">All Roles</option>
//           {ROLES.map(r => <option key={r}>{r}</option>)}
//         </select>
//         <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '160px' }}>
//           <option value="">All Status</option>
//           {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
//         </select>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '3px' }}>LOADING...</div>
//       ) : (
//         <div className="table-wrapper">
//           <table>
//             <thead>
//               <tr>
//                 <th>Player</th>
//                 <th>Role</th>
//                 <th>Nationality</th>
//                 <th>Grade</th>
//                 <th>Base Price</th>
//                 <th>Status</th>
//                 <th>Sold To</th>
//                 <th>Sold Price</th>
//                 {isAdmin && <th>Actions</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {players.length === 0 ? (
//                 <tr><td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No players found</td></tr>
//               ) : players.map(player => (
//                 <tr key={player._id}>
//                   <td>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                       <div style={{
//                         width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
//                         background: 'var(--bg-secondary)', flexShrink: 0,
//                         display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
//                       }}>
//                         {player.photo
//                           ? <img src={`http://localhost:5000${player.photo}`} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                           : '🏏'}
//                       </div>
//                       <div>
//                         <div style={{ fontWeight: '600', fontSize: '14px' }}>{player.name}</div>
//                         {player.isCapped && <span style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>⭐ CAPPED</span>}
//                       </div>
//                     </div>
//                   </td>
//                   <td><span className="badge badge-gray">{player.role}</span></td>
//                   <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{player.nationality}</td>
//                   <td><span className={`badge ${player.grade === 'A+' ? 'badge-gold' : player.grade === 'A' ? 'badge-blue' : 'badge-gray'}`}>{player.grade}</span></td>
//                   <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>₹{player.basePrice}L</td>
//                   <td>{statusBadge(player.status)}</td>
//                   <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{player.soldTo?.name || '-'}</td>
//                   <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-green)' }}>{player.soldPrice ? `₹${player.soldPrice}L` : '-'}</td>
//                   {isAdmin && (
//                     <td>
//                       <div style={{ display: 'flex', gap: '6px' }}>
//                         <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => openEdit(player)}><MdEdit size={14} /></button>
//                         <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(player._id, player.name)}><MdDelete size={14} /></button>
//                       </div>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
//           <div 
//   className="modal"
//   style={{
//     maxWidth: "640px",
//     width: "100%",
//     background: "var(--bg-primary)",
//     borderRadius: "12px",
//     padding: "24px"
//   }}
// >
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//               <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
//                 {editing ? 'EDIT PLAYER' : 'ADD PLAYER'}
//               </h2>
//               <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowModal(false)}><MdClose /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               {/* Photo upload */}
//               <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
//                 <div style={{
//                   width: 100, height: 100, borderRadius: '12px',
//                   background: 'var(--bg-secondary)', border: '2px dashed var(--border)',
//                   overflow: 'hidden', flexShrink: 0,
//                   display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
//                 }}>
//                   {photoPreview ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏏'}
//                 </div>
//                 <div>
//                   <label className="form-label">Player Photo</label>
//                   <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '6px' }}>
//                     <MdUploadFile /> Upload Photo
//                     <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
//                   </label>
//                   <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Max 5MB, JPG/PNG</p>
//                 </div>
//               </div>

//               <div className="grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Name *</label>
//                   <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Role *</label>
//                   <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
//                     {ROLES.map(r => <option key={r}>{r}</option>)}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Nationality</label>
//                   <input className="input" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Age</label>
//                   <input className="input" type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Grade</label>
//                   <select className="input" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
//                     {GRADES.map(g => <option key={g}>{g}</option>)}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Base Price (Lakhs) *</label>
//                   <input className="input" type="number" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} required />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Batting Style</label>
//                   <select className="input" value={form.battingStyle} onChange={e => setForm({...form, battingStyle: e.target.value})}>
//                     <option value="">-</option>
//                     <option>Right-Hand</option>
//                     <option>Left-Hand</option>
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Bowling Style</label>
//                   <input className="input" placeholder="e.g. Right Arm Fast" value={form.bowlingStyle} onChange={e => setForm({...form, bowlingStyle: e.target.value})} />
//                 </div>
//               </div>

//               {/* Stats */}
//               <h3 style={{ fontFamily: 'Rajdhani', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', marginTop: '8px' }}>
//                 Career Stats
//               </h3>
//               <div className="grid-3" style={{ gap: '10px' }}>
//                 {[['matches','Matches'],['runs','Runs'],['wickets','Wickets'],['average','Average'],['strikeRate','Strike Rate'],['economy','Economy']].map(([key, label]) => (
//                   <div key={key} className="form-group" style={{ marginBottom: '10px' }}>
//                     <label className="form-label" style={{ fontSize: '11px' }}>{label}</label>
//                     <input className="input" type="number" step="0.01" value={form.stats[key]} onChange={e => setForm({...form, stats: {...form.stats, [key]: e.target.value}})} />
//                   </div>
//                 ))}
//               </div>

//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
//                 <input type="checkbox" id="capped" checked={form.isCapped} onChange={e => setForm({...form, isCapped: e.target.checked})} />
//                 <label htmlFor="capped" style={{ fontFamily: 'Rajdhani', fontSize: '14px', cursor: 'pointer' }}>⭐ Capped Player (International)</label>
//               </div>

//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
//                 <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={saving}>
//                   {saving ? 'Saving...' : editing ? 'Update Player' : 'Add Player'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { getApi, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdClose, MdUploadFile, MdLink } from 'react-icons/md';

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
const GRADES = ['A+', 'A', 'B', 'C'];
const STATUS_OPTIONS = ['available', 'sold', 'unsold', 'in_auction'];

const defaultForm = {
  name: '', role: 'Batsman', nationality: 'Indian', age: '',
  battingStyle: 'Right-Hand', bowlingStyle: '', grade: 'B',
  basePrice: '', isCapped: false, photoUrl: '',
  stats: { matches: 0, runs: 0, wickets: 0, average: 0, strikeRate: 0, economy: 0, centuries: 0, halfCenturies: 0, highestScore: 0, bestBowling: '0/0' }
};

export default function Players() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' or 'url'
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPlayers = async () => {
    try {
      const api = getApi();
      const params = {};
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get('/players', { params });
      setPlayers(data.players || []);
    } catch (err) {
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlayers(); }, [search, filterRole, filterStatus]);

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoMode('upload');
    setShowModal(true);
  };

  const openEdit = (player) => {
    setEditing(player._id);
    setForm({
      name: player.name, role: player.role, nationality: player.nationality,
      age: player.age || '', battingStyle: player.battingStyle || 'Right-Hand',
      bowlingStyle: player.bowlingStyle || '', grade: player.grade,
      basePrice: player.basePrice, isCapped: player.isCapped, photoUrl: player.photoUrl || '',
      stats: player.stats || defaultForm.stats
    });
    setPhotoPreview(player.photo
      ? (player.photo.startsWith('http') ? player.photo : 'http://localhost:5000' + player.photo)
      : null);
    setPhotoFile(null);
    setPhotoMode(player.photoUrl ? 'url' : 'upload');
    setShowModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUrlChange = (e) => {
    const url = e.target.value;
    setForm({ ...form, photoUrl: url });
    if (url) setPhotoPreview(url);
    else setPhotoPreview(null);
  };

  const getPhotoSrc = (player) => {
    if (!player.photo) return null;
    if (player.photo.startsWith('http')) return player.photo;
    return 'http://localhost:5000' + player.photo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const api = getApi();
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (k === 'stats') formData.append('stats', JSON.stringify(v));
        else formData.append(k, v);
      });

      // Photo: file takes priority over URL
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      if (editing) {
        await api.put('/players/' + editing, formData);
        toast.success('Player updated! ✅');
      } else {
        await api.post('/players', formData);
        toast.success('Player added! 🏏');
      }

      setShowModal(false);
      fetchPlayers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save player');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm('Delete ' + name + '?')) return;
    try {
      await getApi().delete('/players/' + id);
      toast.success('Player deleted');
      fetchPlayers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const statusBadge = (status) => {
    const map = { sold: 'badge-green', unsold: 'badge-red', available: 'badge-gold', in_auction: 'badge-blue' };
    return <span className={'badge ' + (map[status] || 'badge-gray')}>{status}</span>;
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>PLAYERS</h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>{players.length} players total</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}><MdAdd size={18} /> Add Player</button>}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <MdSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
        </div>
        <select className="input" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: '160px' }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '160px' }}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '3px' }}>LOADING...</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Player</th><th>Role</th><th>Nationality</th><th>Grade</th>
                <th>Base Price</th><th>Status</th><th>Sold To</th><th>Sold Price</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr><td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No players found</td></tr>
              ) : players.map(player => (
                <tr key={player._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {getPhotoSrc(player)
                          ? <img src={getPhotoSrc(player)} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          : '🏏'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{player.name}</div>
                        {player.isCapped && <span style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>⭐ CAPPED</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray">{player.role}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{player.nationality}</td>
                  <td><span className={'badge ' + (player.grade === 'A+' ? 'badge-gold' : player.grade === 'A' ? 'badge-blue' : 'badge-gray')}>{player.grade}</span></td>
                  <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>₹{player.basePrice}L</td>
                  <td>{statusBadge(player.status)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{player.soldTo?.name || '-'}</td>
                  <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-green)' }}>{player.soldPrice ? '₹' + player.soldPrice + 'L' : '-'}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => openEdit(player)}><MdEdit size={14} /></button>
                        <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(player._id, player.name)}><MdDelete size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
                {editing ? 'EDIT PLAYER' : 'ADD PLAYER'}
              </h2>
              <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowModal(false)}><MdClose /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Photo Section */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Player Photo</label>

                {/* Photo Preview */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '12px', background: 'var(--bg-secondary)', border: '2px dashed var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setPhotoPreview(null)} />
                      : '🏏'}
                  </div>

                  {/* Mode toggle */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <button type="button" className={'btn ' + (photoMode === 'upload' ? 'btn-primary' : 'btn-ghost')} style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setPhotoMode('upload')}>
                        <MdUploadFile size={14} /> Upload File
                      </button>
                      <button type="button" className={'btn ' + (photoMode === 'url' ? 'btn-primary' : 'btn-ghost')} style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setPhotoMode('url')}>
                        <MdLink size={14} /> Photo URL
                      </button>
                    </div>

                    {photoMode === 'upload' ? (
                      <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex', fontSize: '13px' }}>
                        Choose Image
                        <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                      </label>
                    ) : (
                      <input
                        className="input"
                        placeholder="https://example.com/player.jpg"
                        value={form.photoUrl}
                        onChange={handlePhotoUrlChange}
                        style={{ fontSize: '13px' }}
                      />
                    )}
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {photoMode === 'upload' ? 'Max 5MB, JPG/PNG' : 'Paste any image URL'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input className="input" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="input" type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select className="input" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Base Price (Lakhs) *</label>
                  <input className="input" type="number" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Batting Style</label>
                  <select className="input" value={form.battingStyle} onChange={e => setForm({...form, battingStyle: e.target.value})}>
                    <option value="">-</option>
                    <option>Right-Hand</option>
                    <option>Left-Hand</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bowling Style</label>
                  <input className="input" placeholder="e.g. Right Arm Fast" value={form.bowlingStyle} onChange={e => setForm({...form, bowlingStyle: e.target.value})} />
                </div>
              </div>

              <h3 style={{ fontFamily: 'Rajdhani', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Career Stats</h3>
              <div className="grid-3" style={{ gap: '10px' }}>
                {[['matches','Matches'],['runs','Runs'],['wickets','Wickets'],['average','Average'],['strikeRate','Strike Rate'],['economy','Economy']].map(([key, label]) => (
                  <div key={key} className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>{label}</label>
                    <input className="input" type="number" step="0.01" value={form.stats[key]} onChange={e => setForm({...form, stats: {...form.stats, [key]: e.target.value}})} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="capped" checked={form.isCapped} onChange={e => setForm({...form, isCapped: e.target.checked})} />
                <label htmlFor="capped" style={{ fontFamily: 'Rajdhani', fontSize: '14px', cursor: 'pointer' }}>⭐ Capped Player</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

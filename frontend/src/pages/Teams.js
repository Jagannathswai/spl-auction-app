// import React, { useEffect, useState } from 'react';
// import { getApi, useAuthStore } from '../store';
// import toast from 'react-hot-toast';
// import { MdAdd, MdEdit, MdDelete, MdClose, MdPeople, MdPersonAdd, MdVisibility, MdVisibilityOff, MdLock } from 'react-icons/md';

// const defaultForm = { name: '', shortName: '', primaryColor: '#1a1a2e', secondaryColor: '#e94560', purse: 1000, maxPlayers: 25 };
// const defaultOwnerForm = { name: '', email: '', password: '', phone: '' };

// export default function Teams() {
//   const { user } = useAuthStore();
//   const isAdmin = user?.role === 'admin';
//   const [teams, setTeams] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [showOwnerModal, setShowOwnerModal] = useState(false);
//   const [showCredentials, setShowCredentials] = useState(null); // show created credentials
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(defaultForm);
//   const [ownerForm, setOwnerForm] = useState(defaultOwnerForm);
//   const [logoFile, setLogoFile] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [showPass, setShowPass] = useState(false);

//   const fetchData = async () => {
//     try {
//       const api = getApi();
//       const [teamsRes, usersRes] = await Promise.all([
//         api.get('/teams'),
//         isAdmin ? api.get('/auth/users') : Promise.resolve({ data: { users: [] } })
//       ]);
//       setTeams(teamsRes.data.teams || []);
//       setUsers(usersRes.data.users?.filter(u => u.role === 'team_owner') || []);
//     } catch (err) {
//       toast.error('Failed to load teams');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   const openAdd = () => { setEditing(null); setForm(defaultForm); setLogoFile(null); setLogoPreview(null); setShowModal(true); };
//   const openEdit = (team) => {
//     setEditing(team._id);
//     setForm({ name: team.name, shortName: team.shortName, primaryColor: team.primaryColor, secondaryColor: team.secondaryColor, purse: team.purse, maxPlayers: team.maxPlayers });
//     setLogoPreview(team.logo ? ('http://localhost:5000' + team.logo) : null);
//     setLogoFile(null);
//     setShowModal(true);
//   };

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setLogoFile(file);
//     const reader = new FileReader();
//     reader.onload = (ev) => setLogoPreview(ev.target.result);
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const api = getApi();
//       const formData = new FormData();
//       Object.entries(form).forEach(([k, v]) => formData.append(k, v));
//       if (logoFile) formData.append('logo', logoFile);

//       if (editing) { await api.put('/teams/' + editing, formData); toast.success('Team updated! ✅'); }
//       else { await api.post('/teams', formData); toast.success('Team created! 🏆'); }

//       setShowModal(false);
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm('Delete team ' + name + '?')) return;
//     try { await getApi().delete('/teams/' + id); toast.success('Team deleted'); fetchData(); }
//     catch { toast.error('Failed to delete'); }
//   };

//   const assignOwner = async (teamId, ownerId) => {
//     try {
//       await getApi().put('/teams/' + teamId + '/assign-owner', { ownerId });
//       toast.success('Owner assigned!');
//       fetchData();
//     } catch { toast.error('Failed to assign owner'); }
//   };

//   const handleCreateOwner = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const { data } = await getApi().post('/auth/create-team-owner', ownerForm);
//       toast.success('Team owner created! 🎉');
//       setShowOwnerModal(false);
//       setOwnerForm(defaultOwnerForm);
//       setShowCredentials({ email: ownerForm.email, password: ownerForm.password, name: ownerForm.name });
//       fetchData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to create owner');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const resetPassword = async (userId, userName) => {
//     const newPass = prompt('Enter new password for ' + userName + ':');
//     if (!newPass) return;
//     try {
//       await getApi().put('/auth/users/' + userId + '/reset-password', { newPassword: newPass });
//       toast.success('Password reset!');
//     } catch { toast.error('Failed'); }
//   };

//   if (loading) return <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent-gold)', letterSpacing: '3px' }}>LOADING...</div>;

//   return (
//     <div className="fade-in">
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
//         <div>
//           <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>TEAMS</h1>
//           <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>{teams.length} teams registered</p>
//         </div>
//         {isAdmin && (
//           <div style={{ display: 'flex', gap: '10px' }}>
//             <button className="btn btn-ghost" onClick={() => { setOwnerForm(defaultOwnerForm); setShowOwnerModal(true); }}>
//               <MdPersonAdd size={18} /> Create Team Owner
//             </button>
//             <button className="btn btn-primary" onClick={openAdd}>
//               <MdAdd size={18} /> Create Team
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Team Owners list */}
//       {isAdmin && users.length > 0 && (
//         <div style={{ marginBottom: '24px' }}>
//           <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
//             👤 Team Owners ({users.length})
//           </h3>
//           <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//             {users.map(u => (
//               <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }}>
//                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #e94560, #6c63ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '14px' }}>
//                   {u.name.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <div style={{ fontSize: '13px', fontWeight: '600' }}>{u.name}</div>
//                   <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
//                 </div>
//                 <span className={'badge ' + (u.isActive ? 'badge-green' : 'badge-red')} style={{ fontSize: '10px' }}>
//                   {u.isActive ? 'Active' : 'Disabled'}
//                 </span>
//                 <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => resetPassword(u._id, u.name)} title="Reset Password">
//                   <MdLock size={12} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Teams Grid */}
//       <div className="grid-3">
//         {teams.length === 0 ? (
//           <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
//             <div style={{ fontSize: '48px' }}>🏆</div>
//             <p style={{ fontFamily: 'Rajdhani', textTransform: 'uppercase', marginTop: '8px' }}>No teams yet</p>
//           </div>
//         ) : teams.map(team => {
//           const spent = team.purse - team.purseRemaining;
//           const pct = Math.round((spent / team.purse) * 100);
//           return (
//             <div key={team._id} className="card" style={{ borderTop: '4px solid ' + team.primaryColor }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                   <div style={{ width: 48, height: 48, borderRadius: '10px', background: team.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '16px', overflow: 'hidden' }}>
//                     {team.logo ? <img src={'http://localhost:5000' + team.logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : team.shortName}
//                   </div>
//                   <div>
//                     <h3 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: '700' }}>{team.name}</h3>
//                     <span className="badge badge-gray">{team.shortName}</span>
//                   </div>
//                 </div>
//                 {isAdmin && (
//                   <div style={{ display: 'flex', gap: '4px' }}>
//                     <button className="btn btn-ghost" style={{ padding: '5px 8px' }} onClick={() => openEdit(team)}><MdEdit size={13} /></button>
//                     <button className="btn btn-danger" style={{ padding: '5px 8px' }} onClick={() => handleDelete(team._id, team.name)}><MdDelete size={13} /></button>
//                   </div>
//                 )}
//               </div>

//               {/* Owner assignment */}
//               <div style={{ marginBottom: '12px' }}>
//                 {isAdmin ? (
//                   <div>
//                     <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Assign Owner</label>
//                     <select className="input" style={{ fontSize: '12px', padding: '6px 10px' }}
//                       value={team.owner?._id || ''}
//                       onChange={e => assignOwner(team._id, e.target.value)}>
//                       <option value="">-- Unassigned --</option>
//                       {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
//                     </select>
//                   </div>
//                 ) : (
//                   <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
//                     Owner: <strong>{team.owner?.name || 'Unassigned'}</strong>
//                   </p>
//                 )}
//               </div>

//               {/* Purse */}
//               <div style={{ marginBottom: '8px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
//                   <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>PURSE USED</span>
//                   <span style={{ fontSize: '12px', fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>₹{team.purseRemaining}L / ₹{team.purse}L</span>
//                 </div>
//                 <div style={{ background: 'var(--bg-secondary)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
//                   <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, ' + team.primaryColor + ', ' + team.secondaryColor + ')', borderRadius: '4px', transition: 'width 0.5s' }} />
//                 </div>
//                 <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>{pct}% used</div>
//               </div>

//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
//                   <MdPeople size={14} /> {team.players?.length || 0} / {team.maxPlayers}
//                 </div>
//                 <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
//                   <span>BAT: {team.stats?.batsmen || 0}</span>
//                   <span>BWL: {team.stats?.bowlers || 0}</span>
//                   <span>AR: {team.stats?.allRounders || 0}</span>
//                   <span>WK: {team.stats?.wicketKeepers || 0}</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Create/Edit Team Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
//           <div className="modal">
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//               <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
//                 {editing ? 'EDIT TEAM' : 'CREATE TEAM'}
//               </h2>
//               <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowModal(false)}><MdClose /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
//                 <div style={{ width: 80, height: 80, borderRadius: '12px', background: form.primaryColor, border: '2px dashed var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '18px' }}>
//                   {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (form.shortName || '?')}
//                 </div>
//                 <div>
//                   <label className="form-label">Team Logo</label>
//                   <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '6px', fontSize: '12px' }}>
//                     Upload Logo
//                     <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
//                   </label>
//                 </div>
//               </div>
//               <div className="grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Team Name *</label>
//                   <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Short Name * (max 4)</label>
//                   <input className="input" value={form.shortName} maxLength={4} onChange={e => setForm({...form, shortName: e.target.value.toUpperCase()})} required />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Primary Color</label>
//                   <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                     <input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} style={{ width: '40px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }} />
//                     <input className="input" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Secondary Color</label>
//                   <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                     <input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} style={{ width: '40px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }} />
//                     <input className="input" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} />
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Total Purse (Lakhs) *</label>
//                   <input className="input" type="number" value={form.purse} onChange={e => setForm({...form, purse: e.target.value})} required />
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Max Players</label>
//                   <input className="input" type="number" value={form.maxPlayers} onChange={e => setForm({...form, maxPlayers: e.target.value})} />
//                 </div>
//               </div>
//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
//                 <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Team' : 'Create Team'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Create Team Owner Modal */}
//       {showOwnerModal && (
//         <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowOwnerModal(false)}>
//           <div className="modal" style={{ maxWidth: '460px' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//               <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>CREATE TEAM OWNER</h2>
//               <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowOwnerModal(false)}><MdClose /></button>
//             </div>
//             <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: '20px' }}>
//               Create login credentials for a team owner. They can use these to login and participate in bidding.
//             </p>
//             <form onSubmit={handleCreateOwner}>
//               <div className="form-group">
//                 <label className="form-label">Full Name *</label>
//                 <input className="input" placeholder="e.g. Mukesh Ambani" value={ownerForm.name} onChange={e => setOwnerForm({...ownerForm, name: e.target.value})} required />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Email (Login ID) *</label>
//                 <input className="input" type="email" placeholder="owner@team.com" value={ownerForm.email} onChange={e => setOwnerForm({...ownerForm, email: e.target.value})} required />
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Password *</label>
//                 <div style={{ position: 'relative' }}>
//                   <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={ownerForm.password} onChange={e => setOwnerForm({...ownerForm, password: e.target.value})} required minLength={6} style={{ paddingRight: '40px' }} />
//                   <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
//                     {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
//                   </button>
//                 </div>
//               </div>
//               <div className="form-group">
//                 <label className="form-label">Phone (optional)</label>
//                 <input className="input" type="tel" placeholder="+91 9876543210" value={ownerForm.phone} onChange={e => setOwnerForm({...ownerForm, phone: e.target.value})} />
//               </div>
//               <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
//                 <button type="button" className="btn btn-ghost" onClick={() => setShowOwnerModal(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Owner'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Credentials popup after creation */}
//       {showCredentials && (
//         <div className="modal-overlay">
//           <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
//             <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
//             <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-green)', marginBottom: '8px' }}>OWNER CREATED!</h2>
//             <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: '20px' }}>Share these credentials with <strong>{showCredentials.name}</strong></p>

//             <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '20px' }}>
//               <div style={{ marginBottom: '12px' }}>
//                 <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: '4px' }}>Login URL</div>
//                 <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-blue)' }}>http://localhost:3000/login</div>
//               </div>
//               <div style={{ marginBottom: '12px' }}>
//                 <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
//                 <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', fontSize: '16px', color: 'var(--accent-gold)' }}>{showCredentials.email}</div>
//               </div>
//               <div>
//                 <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: '4px' }}>Password</div>
//                 <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', fontSize: '16px', color: 'var(--accent-gold)' }}>{showCredentials.password}</div>
//               </div>
//             </div>

//             <div style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '8px', padding: '10px', marginBottom: '20px' }}>
//               <p style={{ fontSize: '12px', color: '#e94560', fontFamily: 'Rajdhani' }}>⚠️ Save these credentials now! Password won't be shown again.</p>
//             </div>

//             <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//               <button className="btn btn-ghost" onClick={() => {
//                 navigator.clipboard.writeText('Email: ' + showCredentials.email + '\nPassword: ' + showCredentials.password);
//                 toast.success('Credentials copied!');
//               }}>Copy Credentials</button>
//               <button className="btn btn-primary" onClick={() => setShowCredentials(null)}>Done ✓</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { getApi, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdClose, MdPeople, MdPersonAdd, MdVisibility, MdVisibilityOff, MdLock } from 'react-icons/md';

const defaultForm = { name: '', shortName: '', primaryColor: '#1a1a2e', secondaryColor: '#e94560', purse: 1000, maxPlayers: 25 };
const defaultOwnerForm = { name: '', email: '', password: '', phone: '' };

export default function Teams() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null); // show created credentials
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [ownerForm, setOwnerForm] = useState(defaultOwnerForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const fetchData = async () => {
    try {
      const api = getApi();
      const [teamsRes, usersRes] = await Promise.all([
        api.get('/teams'),
        isAdmin ? api.get('/auth/users') : Promise.resolve({ data: { users: [] } })
      ]);
      setTeams(teamsRes.data.teams || []);
      setUsers(usersRes.data.users?.filter(u => u.role === 'team_owner') || []);
    } catch (err) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setLogoFile(null); setLogoPreview(null); setShowModal(true); };
  const openEdit = (team) => {
    setEditing(team._id);
    setForm({ name: team.name, shortName: team.shortName, primaryColor: team.primaryColor, secondaryColor: team.secondaryColor, purse: team.purse, maxPlayers: team.maxPlayers });
    setLogoPreview(team.logo ? ('http://localhost:5000' + team.logo) : null);
    setLogoFile(null);
    setShowModal(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const api = getApi();
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (logoFile) formData.append('logo', logoFile);

      if (editing) { await api.put('/teams/' + editing, formData); toast.success('Team updated! ✅'); }
      else { await api.post('/teams', formData); toast.success('Team created! 🏆'); }

      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm('Delete team ' + name + '?')) return;
    try { await getApi().delete('/teams/' + id); toast.success('Team deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const assignOwner = async (teamId, ownerId) => {
    try {
      await getApi().put('/teams/' + teamId + '/assign-owner', { ownerId });
      toast.success('Owner assigned!');
      fetchData();
    } catch { toast.error('Failed to assign owner'); }
  };

  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await getApi().post('/auth/create-team-owner', ownerForm);
      toast.success('Team owner created! 🎉');
      setShowOwnerModal(false);
      setOwnerForm(defaultOwnerForm);
      setShowCredentials({ email: ownerForm.email, password: ownerForm.password, name: ownerForm.name });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create owner');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async (userId, userName) => {
    const newPass = prompt('Enter new password for ' + userName + ':');
    if (!newPass) return;
    try {
      await getApi().put('/auth/users/' + userId + '/reset-password', { newPassword: newPass });
      toast.success('Password reset!');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent-gold)', letterSpacing: '3px' }}>LOADING...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '40px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>TEAMS</h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: '14px' }}>{teams.length} teams registered</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={() => { setOwnerForm(defaultOwnerForm); setShowOwnerModal(true); }}>
              <MdPersonAdd size={18} /> Create Team Owner
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <MdAdd size={18} /> Create Team
            </button>
          </div>
        )}
      </div>

      {/* Team Owners list */}
      {isAdmin && users.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            👤 Team Owners ({users.length})
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {users.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #e94560, #6c63ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '14px' }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{u.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <span className={'badge ' + (u.isActive ? 'badge-green' : 'badge-red')} style={{ fontSize: '10px' }}>
                  {u.isActive ? 'Active' : 'Disabled'}
                </span>
                <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => resetPassword(u._id, u.name)} title="Reset Password">
                  <MdLock size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid-3">
        {teams.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px' }}>🏆</div>
            <p style={{ fontFamily: 'Rajdhani', textTransform: 'uppercase', marginTop: '8px' }}>No teams yet</p>
          </div>
        ) : teams.map(team => {
          const spent = team.purse - team.purseRemaining;
          const pct = Math.round((spent / team.purse) * 100);
          return (
            <div key={team._id} className="card" style={{ borderTop: '4px solid ' + team.primaryColor }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '10px', background: team.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '16px', overflow: 'hidden' }}>
                    {team.logo ? <img src={'http://localhost:5000' + team.logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : team.shortName}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: '700' }}>{team.name}</h3>
                    <span className="badge badge-gray">{team.shortName}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost" style={{ padding: '5px 8px' }} onClick={() => openEdit(team)}><MdEdit size={13} /></button>
                    <button className="btn btn-danger" style={{ padding: '5px 8px' }} onClick={() => handleDelete(team._id, team.name)}><MdDelete size={13} /></button>
                  </div>
                )}
              </div>

              {/* Owner assignment */}
              <div style={{ marginBottom: '12px' }}>
                {isAdmin ? (
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Assign Owner</label>
                    <select className="input" style={{ fontSize: '12px', padding: '6px 10px' }}
                      value={team.owner?._id || ''}
                      onChange={e => assignOwner(team._id, e.target.value)}>
                      <option value="">-- Unassigned --</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Owner: <strong>{team.owner?.name || 'Unassigned'}</strong>
                  </p>
                )}
              </div>

              {/* Purse */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>PURSE USED</span>
                  <span style={{ fontSize: '12px', fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>₹{team.purseRemaining}L / ₹{team.purse}L</span>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: 'linear-gradient(90deg, ' + team.primaryColor + ', ' + team.secondaryColor + ')', borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>{pct}% used</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <MdPeople size={14} /> {team.players?.length || 0} / {team.maxPlayers}
                </div>
                <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
                  <span>BAT: {team.stats?.batsmen || 0}</span>
                  <span>BWL: {team.stats?.bowlers || 0}</span>
                  <span>AR: {team.stats?.allRounders || 0}</span>
                  <span>WK: {team.stats?.wicketKeepers || 0}</span>
                </div>
              </div>

              {/* Purchased Players */}
              {team.players?.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                    🏏 Purchased Players
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {team.players.map((player, i) => {
                      const photoSrc = player.photo ? (player.photo.startsWith('http') ? player.photo : 'http://localhost:5000' + player.photo) : null;
                      return (
                        <div key={player._id || i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {photoSrc ? <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} /> : '🏏'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{player.role}</div>
                          </div>
                          <div style={{ fontSize: '11px', fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-green)', flexShrink: 0 }}>
                            ₹{player.soldPrice}L
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create/Edit Team Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
                {editing ? 'EDIT TEAM' : 'CREATE TEAM'}
              </h2>
              <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
                <div style={{ width: 80, height: 80, borderRadius: '12px', background: form.primaryColor, border: '2px dashed var(--border)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: '18px' }}>
                  {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (form.shortName || '?')}
                </div>
                <div>
                  <label className="form-label">Team Logo</label>
                  <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex', marginTop: '6px', fontSize: '12px' }}>
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Team Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Name * (max 4)</label>
                  <input className="input" value={form.shortName} maxLength={4} onChange={e => setForm({...form, shortName: e.target.value.toUpperCase()})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} style={{ width: '40px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }} />
                    <input className="input" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} style={{ width: '40px', height: '36px', border: 'none', background: 'none', cursor: 'pointer' }} />
                    <input className="input" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Purse (Lakhs) *</label>
                  <input className="input" type="number" value={form.purse} onChange={e => setForm({...form, purse: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Players</label>
                  <input className="input" type="number" value={form.maxPlayers} onChange={e => setForm({...form, maxPlayers: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Team' : 'Create Team'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Owner Modal */}
      {showOwnerModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowOwnerModal(false)}>
          <div className="modal" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-gold)' }}>CREATE TEAM OWNER</h2>
              <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => setShowOwnerModal(false)}><MdClose /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: '20px' }}>
              Create login credentials for a team owner. They can use these to login and participate in bidding.
            </p>
            <form onSubmit={handleCreateOwner}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="input" placeholder="e.g. Mukesh Ambani" value={ownerForm.name} onChange={e => setOwnerForm({...ownerForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Login ID) *</label>
                <input className="input" type="email" placeholder="owner@team.com" value={ownerForm.email} onChange={e => setOwnerForm({...ownerForm, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={ownerForm.password} onChange={e => setOwnerForm({...ownerForm, password: e.target.value})} required minLength={6} style={{ paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input className="input" type="tel" placeholder="+91 9876543210" value={ownerForm.phone} onChange={e => setOwnerForm({...ownerForm, phone: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowOwnerModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Owner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials popup after creation */}
      {showCredentials && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', letterSpacing: '2px', color: 'var(--accent-green)', marginBottom: '8px' }}>OWNER CREATED!</h2>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: '20px' }}>Share these credentials with <strong>{showCredentials.name}</strong></p>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: '4px' }}>Login URL</div>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-blue)' }}>http://localhost:3000/login</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', fontSize: '16px', color: 'var(--accent-gold)' }}>{showCredentials.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: '4px' }}>Password</div>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', fontSize: '16px', color: 'var(--accent-gold)' }}>{showCredentials.password}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: '8px', padding: '10px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#e94560', fontFamily: 'Rajdhani' }}>⚠️ Save these credentials now! Password won't be shown again.</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => {
                navigator.clipboard.writeText('Email: ' + showCredentials.email + '\nPassword: ' + showCredentials.password);
                toast.success('Credentials copied!');
              }}>Copy Credentials</button>
              <button className="btn btn-primary" onClick={() => setShowCredentials(null)}>Done ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
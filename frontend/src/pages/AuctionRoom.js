// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import { getApi, useAuthStore } from '../store';
// import toast from 'react-hot-toast';
// import { MdSend, MdArrowBack, MdDownload, MdPlayArrow, MdStop, MdCheck, MdClose } from 'react-icons/md';

// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// export default function AuctionRoom() {
//   const { roomId } = useParams();
//   const { user } = useAuthStore();
//   const navigate = useNavigate();
//   const isAdmin = user?.role === 'admin';

//   const [room, setRoom] = useState(null);
//   const [players, setPlayers] = useState([]);
//   const [teams, setTeams] = useState([]);
//   const [myTeam, setMyTeam] = useState(null);
//   const [currentAuction, setCurrentAuction] = useState(null);
//   const [timer, setTimer] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [chatInput, setChatInput] = useState('');
//   const [activeTab, setActiveTab] = useState('auction');
//   const [log, setLog] = useState([]);
//   const [selectedPlayer, setSelectedPlayer] = useState(null);

//   const socketRef = useRef(null);
//   const chatEndRef = useRef(null);

//   // Initialize socket
//   useEffect(() => {
//     socketRef.current = io(SOCKET_URL, { transports: ['websocket'], withCredentials: true });
//     const socket = socketRef.current;

//     socket.on('connect', () => {
//       socket.emit('room:join', { roomId, userId: user._id, role: user.role });
//     });

//     socket.on('auction:state', (data) => setCurrentAuction(data));
//     socket.on('auction:started', (data) => {
//       setCurrentAuction(data);
//       toast.success(`Auction started for ${data.player?.name}! 🏏`);
//     });
//     socket.on('auction:bid', (data) => {
//       setCurrentAuction(prev => prev ? { ...prev, currentBid: data.amount, currentBidderName: data.teamName, currentBidder: data.teamId } : null);
//       toast(`💰 ₹${data.amount}L - ${data.teamName}`, { icon: '🏏' });
//       // Reset timer on new bid
//       socket.emit('auction:reset_timer', { roomId, duration: 30 });
//     });
//     socket.on('auction:sold', ({ player, team, soldPrice }) => {
//       toast.success(`🎉 ${player.name} SOLD to ${team.name} for ₹${soldPrice}L!`, { duration: 5000 });
//       setCurrentAuction(null);
//       fetchData();
//     });
//     socket.on('auction:unsold', ({ player }) => {
//       toast(`😔 ${player.name} went unsold`, { icon: '❌', duration: 3000 });
//       setCurrentAuction(null);
//       fetchData();
//     });
//     socket.on('timer:update', ({ timeLeft }) => setTimer(timeLeft));
//     socket.on('timer:expired', () => { setTimer(0); toast('⏰ Timer expired!', { icon: '⏱️' }); });
//     socket.on('timer:stopped', () => setTimer(null));
//     socket.on('room:status', ({ status }) => setRoom(prev => prev ? { ...prev, status } : null));
//     socket.on('chat:message', (msg) => setChatMessages(prev => [...prev, msg]));
//     socket.on('admin:announce', ({ message }) => toast(message, { icon: '📢', duration: 6000 }));

//     return () => { socket.emit('room:leave', { roomId }); socket.disconnect(); };
//   }, [roomId, user._id, user.role]);

//   useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

//   const fetchData = useCallback(async () => {
//     try {
//       const api = getApi();
//       const [roomRes, playersRes, teamsRes, logRes] = await Promise.all([
//         api.get(`/rooms/${roomId}`),
//         api.get('/players', { params: { room: roomId } }),
//         api.get('/teams', { params: { room: roomId } }),
//         api.get(`/auction/${roomId}/log`),
//       ]);
//       setRoom(roomRes.data.room);
//       setPlayers(playersRes.data.players || []);
//       setTeams(teamsRes.data.teams || []);
//       setLog(logRes.data.log || []);
//       setCurrentAuction(roomRes.data.room?.currentAuction?.isActive ? roomRes.data.room.currentAuction : null);

//       if (!isAdmin) {
//         const teamRes = await api.get('/teams/my/team').catch(() => null);
//         if (teamRes) setMyTeam(teamRes.data.team);
//       }
//     } catch (err) {
//       toast.error('Failed to load auction room');
//     } finally {
//       setLoading(false);
//     }
//   }, [roomId, isAdmin]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const startAuction = async (playerId) => {
//     try {
//       await getApi().put(`/auction/${roomId}/start/${playerId}`);
//       socketRef.current.emit('auction:start_timer', { roomId, duration: room?.settings?.timerDuration || 30 });
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to start auction');
//     }
//   };

//   const placeBid = async (teamId, amount) => {
//     try {
//       await getApi().put(`/auction/${roomId}/bid`, { teamId, amount });
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Bid failed');
//     }
//   };

//   const markSold = async () => {
//     try {
//       socketRef.current.emit('auction:stop_timer', { roomId });
//       await getApi().put(`/auction/${roomId}/sold`);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed');
//     }
//   };

//   const markUnsold = async () => {
//     try {
//       socketRef.current.emit('auction:stop_timer', { roomId });
//       await getApi().put(`/auction/${roomId}/unsold`);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed');
//     }
//   };

//   const exportExcel = async () => {
//     try {
//       const api = getApi();
//       const response = await api.get(`/export/auction/${roomId}/excel`, {
//         responseType: 'blob'
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `auction_report_${Date.now()}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       toast.error('Export failed!');
//     }
// };

// const sendChat = () => {
//     if (!chatInput.trim()) return;
//     socketRef.current.emit('chat:message', { roomId, message: chatInput, userName: user.name, role: user.role });
//     setChatInput('');
// };

//   const availablePlayers = players.filter(p => p.status === 'available');
//   const soldPlayers = players.filter(p => p.status === 'sold');
//   const unsoldPlayers = players.filter(p => p.status === 'unsold');

//   const incrementValues = [5, 10, 20, 50, 100];

//   // Fix photo URL - handle both uploaded files and external URLs
//  const getPhotoSrc = (photo) => {
//     if (!photo) return null;
//     if (photo.startsWith("http")) return photo;
//     return `${process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}` + photo;
// };
//   if (loading) return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
//       <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px', color: 'var(--accent-gold)', letterSpacing: '4px' }}>LOADING AUCTION...</div>
//     </div>
//   );

//   return (
//     <div className="fade-in">
//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//           <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={() => navigate('/rooms')}><MdArrowBack /></button>
//           <div>
//             <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>{room?.name}</h1>
//             <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//               <span className="badge badge-gold">{room?.code}</span>
//               <span className={`badge ${room?.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{room?.status}</span>
//             </div>
//           </div>
//         </div>
//         <div style={{ display: 'flex', gap: '8px' }}>
//           <button className="btn btn-ghost" onClick={exportExcel}><MdDownload size={16} /> Export Excel</button>
//           {isAdmin && (
//             <>
//               <button className="btn btn-success" onClick={() => getApi().put(`/auction/${roomId}/status`, { status: 'active' })}>Start</button>
//               <button className="btn btn-ghost" onClick={() => getApi().put(`/auction/${roomId}/status`, { status: 'paused' })}>Pause</button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Main grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: currentAuction ? '1fr 360px' : '1fr', gap: '20px' }}>
//         <div>
//           {/* Tabs */}
//           <div className="tabs" style={{ marginBottom: '16px' }}>
//             {[['auction', '🏏 Auction'], ['players', `📋 Players (${availablePlayers.length})`], ['teams', '🏆 Teams'], ['log', `📜 Log (${log.length})`]].map(([id, label]) => (
//               <button key={id} className={`tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
//             ))}
//           </div>

//           {/* Auction tab */}
//           {activeTab === 'auction' && (
//             <div>
//               {/* Current player being auctioned */}
//               {currentAuction?.player ? (
//                 <div className="auction-card" style={{ padding: '24px', marginBottom: '20px' }}>
//                   <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
//                     <div style={{
//                       width: 120, height: 120, borderRadius: '16px',
//                       background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0,
//                       display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px'
//                     }}>
//                       {currentAuction.player.photo
//                         ? <img src={getPhotoSrc(currentAuction.player.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                         : '🏏'}
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', letterSpacing: '3px', color: '#fff' }}>
//                         {currentAuction.player.name}
//                       </div>
//                       <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
//                         <span className="badge badge-gold">{currentAuction.player.role}</span>
//                         <span className="badge badge-blue">{currentAuction.player.nationality}</span>
//                         <span className="badge badge-gray">Grade {currentAuction.player.grade}</span>
//                       </div>
//                       <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
//                         <div>
//                           <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>Base Price</div>
//                           <div style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--text-secondary)' }}>₹{currentAuction.player.basePrice}L</div>
//                         </div>
//                         <div>
//                           <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>Current Bid</div>
//                           <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'var(--accent-green)', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>₹{currentAuction.currentBid}L</div>
//                         </div>
//                         {currentAuction.currentBidderName && (
//                           <div>
//                             <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>Leading</div>
//                             <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: '700', color: 'var(--accent-blue)' }}>{currentAuction.currentBidderName}</div>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Timer */}
//                     <div style={{ textAlign: 'center', minWidth: '80px' }}>
//                       <div className={`${timer !== null && timer <= 10 ? 'timer-urgent' : ''}`} style={{
//                         fontFamily: 'Bebas Neue', fontSize: '56px',
//                         color: timer !== null && timer <= 10 ? 'var(--accent-red)' : 'var(--accent-gold)',
//                         lineHeight: 1
//                       }}>
//                         {timer !== null ? timer : '--'}
//                       </div>
//                       <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>seconds</div>
//                     </div>
//                   </div>

//                   {/* Admin controls */}
//                   {isAdmin && (
//                     <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
//                       <button className="btn btn-success" onClick={markSold} disabled={!currentAuction.currentBidder}>
//                         <MdCheck /> SOLD ₹{currentAuction.currentBid}L
//                       </button>
//                       <button className="btn btn-danger" onClick={markUnsold}><MdClose /> UNSOLD</button>
//                     </div>
//                   )}

//                   {/* Team Owner bid buttons */}
//                   {!isAdmin && myTeam && (
//                     <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
//                       <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: '10px' }}>
//                         {myTeam.name} • Purse remaining: <strong style={{ color: 'var(--accent-gold)' }}>₹{myTeam.purseRemaining}L</strong>
//                       </div>
//                       <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
//                         {incrementValues.map(inc => {
//                           const bidAmount = currentAuction.currentBid + inc;
//                           const canBid = bidAmount <= myTeam.purseRemaining;
//                           return (
//                             <button key={inc} className="btn btn-blue" disabled={!canBid} style={{ fontSize: '12px', padding: '8px 14px' }}
//                               onClick={() => placeBid(myTeam._id, bidAmount)}>
//                               +{inc}L = ₹{bidAmount}L
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="card" style={{ textAlign: 'center', padding: '60px', marginBottom: '20px' }}>
//                   <div style={{ fontSize: '60px' }}>🏟️</div>
//                   <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--text-muted)', letterSpacing: '3px', marginTop: '12px' }}>NO ACTIVE AUCTION</h3>
//                   <p style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginTop: '8px' }}>
//                     {isAdmin ? 'Select a player below to start bidding' : 'Waiting for admin to start auction...'}
//                   </p>
//                 </div>
//               )}

//               {/* Player selection for admin */}
//               {isAdmin && (
//                 <div>
//                   <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
//                     Available Players ({availablePlayers.length})
//                   </h3>
//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
//                     {availablePlayers.map(player => (
//                       <div key={player._id} className="card" style={{ cursor: 'pointer', padding: '12px' }} onClick={() => startAuction(player._id)}>
//                         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//                           <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden', flexShrink: 0 }}>
//                             {player.photo ? <img src={getPhotoSrc(player.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏏'}
//                           </div>
//                           <div>
//                             <div style={{ fontWeight: '600', fontSize: '13px' }}>{player.name}</div>
//                             <div style={{ display: 'flex', gap: '4px' }}>
//                               <span className="badge badge-gray" style={{ padding: '1px 6px', fontSize: '10px' }}>{player.role}</span>
//                               <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontFamily: 'Rajdhani' }}>₹{player.basePrice}L</span>
//                             </div>
//                           </div>
//                         </div>
//                         <button className="btn btn-primary" style={{ width: '100%', fontSize: '11px', padding: '6px', marginTop: '8px', justifyContent: 'center' }}>
//                           <MdPlayArrow size={14} /> Start Auction
//                         </button>
//                       </div>
//                     ))}
//                     {availablePlayers.length === 0 && <p style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani', gridColumn: '1/-1' }}>All players have been auctioned</p>}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Players tab */}
//           {activeTab === 'players' && (
//             <div>
//               {/* Stats summary */}
//               <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
//                 {[
//                   { label: 'Available', value: availablePlayers.length, color: 'var(--accent-gold)' },
//                   { label: 'Sold', value: soldPlayers.length, color: 'var(--accent-green)' },
//                   { label: 'Unsold', value: unsoldPlayers.length, color: 'var(--accent-red)' },
//                 ].map(s => (
//                   <div key={s.label} className="card" style={{ flex: 1, minWidth: '100px', textAlign: 'center', padding: '12px' }}>
//                     <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: s.color }}>{s.value}</div>
//                     <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>{s.label}</div>
//                   </div>
//                 ))}
//               </div>

//               <div className="table-wrapper">
//                 <table>
//                   <thead><tr>
//                     <th>Player</th><th>Role</th><th>Base</th><th>Status</th><th>Sold To</th><th>Sold Price</th>
//                   </tr></thead>
//                   <tbody>
//                     {players.map(p => (
//                       <tr key={p._id}>
//                         <td>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '14px', flexShrink: 0 }}>
//                               {p.photo ? <img src={getPhotoSrc(p.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏏'}
//                             </div>
//                             <span style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</span>
//                           </div>
//                         </td>
//                         <td><span className="badge badge-gray">{p.role}</span></td>
//                         <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>₹{p.basePrice}L</td>
//                         <td><span className={`badge ${p.status === 'sold' ? 'badge-green' : p.status === 'unsold' ? 'badge-red' : p.status === 'in_auction' ? 'badge-blue' : 'badge-gold'}`}>{p.status}</span></td>
//                         <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.soldTo?.name || '-'}</td>
//                         <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-green)' }}>{p.soldPrice ? `₹${p.soldPrice}L` : '-'}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Teams tab */}
//           {activeTab === 'teams' && (
//             <div className="grid-2">
//               {teams.map(team => {
//                 const spent = team.purse - team.purseRemaining;
//                 return (
//                   <div key={team._id} className="card" style={{ borderLeft: `4px solid ${team.primaryColor}` }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
//                       <div style={{ width: 40, height: 40, borderRadius: '8px', background: team.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', overflow: 'hidden' }}>
//                         {team.logo ? <img src={getPhotoSrc(team.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : team.shortName}
//                       </div>
//                       <div>
//                         <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', fontSize: '16px' }}>{team.name}</div>
//                         <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{team.players?.length || 0} players</div>
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'Rajdhani', marginBottom: '6px' }}>
//                       <span style={{ color: 'var(--text-secondary)' }}>Purse Left</span>
//                       <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>₹{team.purseRemaining}L</span>
//                     </div>
//                     <div style={{ background: 'var(--bg-secondary)', borderRadius: '4px', height: '5px' }}>
//                       <div style={{ width: `${Math.min((spent / team.purse) * 100, 100)}%`, height: '100%', background: team.primaryColor, borderRadius: '4px' }} />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Log tab */}
//           {activeTab === 'log' && (
//             <div className="table-wrapper">
//               <table>
//                 <thead><tr><th>Action</th><th>Player</th><th>Team</th><th>Amount</th><th>Time</th></tr></thead>
//                 <tbody>
//                   {log.length === 0 ? (
//                     <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No auction activity yet</td></tr>
//                   ) : [...log].reverse().map((entry, i) => (
//                     <tr key={i}>
//                       <td><span className={`badge ${entry.action === 'sold' ? 'badge-green' : 'badge-red'}`}>{entry.action.toUpperCase()}</span></td>
//                       <td style={{ fontSize: '13px' }}>{entry.playerName}</td>
//                       <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{entry.teamName || '-'}</td>
//                       <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>{entry.amount ? `₹${entry.amount}L` : '-'}</td>
//                       <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleTimeString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Chat sidebar */}
//         {currentAuction && (
//           <div style={{ position: 'sticky', top: '84px', height: 'calc(100vh - 120px)' }}>
//             <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
//               <h3 style={{ fontFamily: 'Rajdhani', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
//                 💬 Live Chat
//               </h3>
//               <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
//                 {chatMessages.length === 0 && (
//                   <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Rajdhani', marginTop: '20px' }}>
//                     No messages yet. Say something!
//                   </p>
//                 )}
//                 {chatMessages.map((msg, i) => (
//                   <div key={i} style={{
//                     padding: '8px 10px', borderRadius: '8px',
//                     background: msg.role === 'admin' ? 'rgba(255,215,0,0.08)' : 'var(--bg-secondary)',
//                     borderLeft: msg.role === 'admin' ? '3px solid var(--accent-gold)' : '3px solid transparent',
//                   }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
//                       <span style={{ fontSize: '11px', fontFamily: 'Rajdhani', fontWeight: '700', color: msg.role === 'admin' ? 'var(--accent-gold)' : 'var(--accent-blue)' }}>
//                         {msg.role === 'admin' ? '⭐ ' : ''}{msg.userName}
//                       </span>
//                       <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
//                     </div>
//                     <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{msg.message}</p>
//                   </div>
//                 ))}
//                 <div ref={chatEndRef} />
//               </div>
//               <div style={{ display: 'flex', gap: '8px' }}>
//                 <input className="input" style={{ fontSize: '13px', padding: '8px 12px' }} placeholder="Type a message..."
//                   value={chatInput} onChange={e => setChatInput(e.target.value)}
//                   onKeyDown={e => e.key === 'Enter' && sendChat()} />
//                 <button className="btn btn-primary" style={{ padding: '8px 12px', flexShrink: 0 }} onClick={sendChat}><MdSend size={16} /></button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getApi, useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { MdSend, MdArrowBack, MdDownload, MdPlayArrow, MdStop, MdCheck, MdClose } from 'react-icons/md';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export default function AuctionRoom() {
  const { roomId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState('auction');
  const [log, setLog] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'], withCredentials: true });
    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('room:join', { roomId, userId: user._id, role: user.role });
    });

    socket.on('auction:state', (data) => setCurrentAuction(data));
    socket.on('auction:started', (data) => {
      setCurrentAuction(data);
      toast.success(`Auction started for ${data.player?.name}! 🏏`);
    });
    socket.on('auction:bid', (data) => {
      setCurrentAuction(prev => prev ? { ...prev, currentBid: data.amount, currentBidderName: data.teamName, currentBidder: data.teamId } : null);
      toast(`💰 ₹${data.amount}L - ${data.teamName}`, { icon: '🏏' });
      // Reset timer on new bid
      socket.emit('auction:reset_timer', { roomId, duration: 30 });
    });
    socket.on('auction:sold', ({ player, team, soldPrice }) => {
      toast.success(`🎉 ${player.name} SOLD to ${team.name} for ₹${soldPrice}L!`, { duration: 5000 });
      setCurrentAuction(null);
      fetchData();
    });
    socket.on('auction:unsold', ({ player }) => {
      toast(`😔 ${player.name} went unsold`, { icon: '❌', duration: 3000 });
      setCurrentAuction(null);
      fetchData();
    });
    socket.on('timer:update', ({ timeLeft }) => setTimer(timeLeft));
    socket.on('timer:expired', () => { setTimer(0); toast('⏰ Timer expired!', { icon: '⏱️' }); });
    socket.on('timer:stopped', () => setTimer(null));
    socket.on('room:status', ({ status }) => setRoom(prev => prev ? { ...prev, status } : null));
    socket.on('chat:message', (msg) => setChatMessages(prev => [...prev, msg]));
    socket.on('admin:announce', ({ message }) => toast(message, { icon: '📢', duration: 6000 }));

    return () => { socket.emit('room:leave', { roomId }); socket.disconnect(); };
  }, [roomId, user._id, user.role]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fetchData = useCallback(async () => {
    try {
      const api = getApi();
      const [roomRes, playersRes, teamsRes, logRes] = await Promise.all([
        api.get(`/rooms/${roomId}`),
        api.get('/players', { params: { room: roomId } }),
        api.get('/teams', { params: { room: roomId } }),
        api.get(`/auction/${roomId}/log`),
      ]);
      setRoom(roomRes.data.room);
      setPlayers(playersRes.data.players || []);
      setTeams(teamsRes.data.teams || []);
      setLog(logRes.data.log || []);
      setCurrentAuction(roomRes.data.room?.currentAuction?.isActive ? roomRes.data.room.currentAuction : null);

      if (!isAdmin) {
        const teamRes = await api.get('/teams/my/team').catch(() => null);
        if (teamRes) setMyTeam(teamRes.data.team);
      }
    } catch (err) {
      toast.error('Failed to load auction room');
    } finally {
      setLoading(false);
    }
  }, [roomId, isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startAuction = async (playerId) => {
    try {
      await getApi().put(`/auction/${roomId}/start/${playerId}`);
      socketRef.current.emit('auction:start_timer', { roomId, duration: room?.settings?.timerDuration || 30 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start auction');
    }
  };

  const placeBid = async (teamId, amount) => {
    try {
      await getApi().put(`/auction/${roomId}/bid`, { teamId, amount });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bid failed');
    }
  };

  const markSold = async () => {
    try {
      socketRef.current.emit('auction:stop_timer', { roomId });
      await getApi().put(`/auction/${roomId}/sold`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const markUnsold = async () => {
    try {
      socketRef.current.emit('auction:stop_timer', { roomId });
      await getApi().put(`/auction/${roomId}/unsold`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    socketRef.current.emit('chat:message', { roomId, message: chatInput, userName: user.name, role: user.role });
    setChatInput('');
  };

  const exportExcel = () => {
    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/export/auction/${roomId}/excel`;
    window.open(url, '_blank');
  };

  const availablePlayers = players.filter(p => p.status === 'available');
  const soldPlayers = players.filter(p => p.status === 'sold');
  const unsoldPlayers = players.filter(p => p.status === 'unsold');

  const incrementValues = [5, 10, 20, 50, 100];

  // Fix photo URL - handle both uploaded files and external URLs
  const getPhotoSrc = (photo) => {
    if (!photo) return null;
    if (photo.startsWith("http")) return photo;
    return "http://localhost:5000" + photo;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px', color: 'var(--accent-gold)', letterSpacing: '4px' }}>LOADING AUCTION...</div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost" style={{ padding: '8px' }} onClick={() => navigate('/rooms')}><MdArrowBack /></button>
          <div>
            <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '32px', letterSpacing: '3px', color: 'var(--accent-gold)' }}>{room?.name}</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="badge badge-gold">{room?.code}</span>
              <span className={`badge ${room?.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{room?.status}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost" onClick={exportExcel}><MdDownload size={16} /> Export Excel</button>
          {isAdmin && (
            <>
              <button className="btn btn-success" onClick={() => getApi().put(`/auction/${roomId}/status`, { status: 'active' })}>Start</button>
              <button className="btn btn-ghost" onClick={() => getApi().put(`/auction/${roomId}/status`, { status: 'paused' })}>Pause</button>
              {unsoldPlayers.length > 0 && (
                <button className="btn btn-ghost" style={{ color: '#ff8c00', border: '1px solid #ff8c00', fontSize: '13px' }}
                  onClick={async () => {
                    if (!window.confirm(unsoldPlayers.length + ' unsold players ko dobara available karein?')) return;
                    try {
                      await getApi().put('/auction/' + roomId + '/re-auction-unsold');
                      toast.success('Unsold players reset! 🔄');
                      fetchData();
                    } catch { toast.error('Failed'); }
                  }}>
                  🔄 Re-auction Unsold ({unsoldPlayers.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: currentAuction ? '1fr 360px' : '1fr', gap: '20px' }}>
        <div>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: '16px' }}>
            {[['auction', '🏏 Auction'], ['players', `📋 Players (${availablePlayers.length})`], ['teams', '🏆 Teams'], ['log', `📜 Log (${log.length})`]].map(([id, label]) => (
              <button key={id} className={`tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
            ))}
          </div>

          {/* Auction tab */}
          {activeTab === 'auction' && (
            <div>
              {/* Current player being auctioned */}
              {currentAuction?.player ? (
                <div className="auction-card" style={{ padding: '24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                      width: 120, height: 120, borderRadius: '16px',
                      background: 'var(--bg-secondary)', overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px'
                    }}>
                      {currentAuction.player.photo
                        ? <img src={getPhotoSrc(currentAuction.player.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '🏏'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', letterSpacing: '3px', color: '#fff' }}>
                        {currentAuction.player.name}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span className="badge badge-gold">{currentAuction.player.role}</span>
                        <span className="badge badge-blue">{currentAuction.player.nationality}</span>
                        <span className="badge badge-gray">Grade {currentAuction.player.grade}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>Base Price</div>
                          <div style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--text-secondary)' }}>₹{currentAuction.player.basePrice}L</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>Current Bid</div>
                          <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'var(--accent-green)', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>₹{currentAuction.currentBid}L</div>
                        </div>
                        {currentAuction.currentBidderName && (
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>Leading</div>
                            <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: '700', color: 'var(--accent-blue)' }}>{currentAuction.currentBidderName}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timer */}
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div className={`${timer !== null && timer <= 10 ? 'timer-urgent' : ''}`} style={{
                        fontFamily: 'Bebas Neue', fontSize: '56px',
                        color: timer !== null && timer <= 10 ? 'var(--accent-red)' : 'var(--accent-gold)',
                        lineHeight: 1
                      }}>
                        {timer !== null ? timer : '--'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>seconds</div>
                    </div>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
                      <button className="btn btn-success" onClick={markSold} disabled={!currentAuction.currentBidder}>
                        <MdCheck /> SOLD ₹{currentAuction.currentBid}L
                      </button>
                      <button className="btn btn-danger" onClick={markUnsold}><MdClose /> UNSOLD</button>
                    </div>
                  )}

                  {/* Team Owner bid buttons */}
                  {!isAdmin && myTeam && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: '10px' }}>
                        {myTeam.name} • Purse remaining: <strong style={{ color: 'var(--accent-gold)' }}>₹{myTeam.purseRemaining}L</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {incrementValues.map(inc => {
                          const bidAmount = currentAuction.currentBid + inc;
                          const canBid = bidAmount <= myTeam.purseRemaining;
                          return (
                            <button key={inc} className="btn btn-blue" disabled={!canBid} style={{ fontSize: '12px', padding: '8px 14px' }}
                              onClick={() => placeBid(myTeam._id, bidAmount)}>
                              +{inc}L = ₹{bidAmount}L
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '60px' }}>🏟️</div>
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--text-muted)', letterSpacing: '3px', marginTop: '12px' }}>NO ACTIVE AUCTION</h3>
                  <p style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginTop: '8px' }}>
                    {isAdmin ? 'Select a player below to start bidding' : 'Waiting for admin to start auction...'}
                  </p>
                </div>
              )}

              {/* Player selection for admin */}
              {isAdmin && (
                <div>
                  <h3 style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                    Available Players ({availablePlayers.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {availablePlayers.map(player => (
                      <div key={player._id} className="card" style={{ cursor: 'pointer', padding: '12px' }} onClick={() => startAuction(player._id)}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden', flexShrink: 0 }}>
                            {player.photo ? <img src={getPhotoSrc(player.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏏'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{player.name}</div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <span className="badge badge-gray" style={{ padding: '1px 6px', fontSize: '10px' }}>{player.role}</span>
                              <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontFamily: 'Rajdhani' }}>₹{player.basePrice}L</span>
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', fontSize: '11px', padding: '6px', marginTop: '8px', justifyContent: 'center' }}>
                          <MdPlayArrow size={14} /> Start Auction
                        </button>
                      </div>
                    ))}
                    {availablePlayers.length === 0 && <p style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani', gridColumn: '1/-1' }}>All players have been auctioned</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Players tab */}
          {activeTab === 'players' && (
            <div>
              {/* Stats summary */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Available', value: availablePlayers.length, color: 'var(--accent-gold)' },
                  { label: 'Sold', value: soldPlayers.length, color: 'var(--accent-green)' },
                  { label: 'Unsold', value: unsoldPlayers.length, color: 'var(--accent-red)' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ flex: 1, minWidth: '100px', textAlign: 'center', padding: '12px' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>Player</th><th>Role</th><th>Base</th><th>Status</th><th>Sold To</th><th>Sold Price</th>
                  </tr></thead>
                  <tbody>
                    {players.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '14px', flexShrink: 0 }}>
                              {p.photo ? <img src={getPhotoSrc(p.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏏'}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</span>
                          </div>
                        </td>
                        <td><span className="badge badge-gray">{p.role}</span></td>
                        <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>₹{p.basePrice}L</td>
                        <td><span className={`badge ${p.status === 'sold' ? 'badge-green' : p.status === 'unsold' ? 'badge-red' : p.status === 'in_auction' ? 'badge-blue' : 'badge-gold'}`}>{p.status}</span></td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.soldTo?.name || '-'}</td>
                        <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-green)' }}>{p.soldPrice ? `₹${p.soldPrice}L` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Teams tab */}
          {activeTab === 'teams' && (
            <div className="grid-2">
              {teams.map(team => {
                const spent = team.purse - team.purseRemaining;
                return (
                  <div key={team._id} className="card" style={{ borderLeft: `4px solid ${team.primaryColor}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '8px', background: team.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', overflow: 'hidden' }}>
                        {team.logo ? <img src={getPhotoSrc(team.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : team.shortName}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Rajdhani', fontWeight: '700', fontSize: '16px' }}>{team.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{team.players?.length || 0} players</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'Rajdhani', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Purse Left</span>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>₹{team.purseRemaining}L</span>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '4px', height: '5px', marginBottom: '10px' }}>
                      <div style={{ width: `${Math.min((spent / team.purse) * 100, 100)}%`, height: '100%', background: team.primaryColor, borderRadius: '4px' }} />
                    </div>
                    {team.players?.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textTransform: 'uppercase', marginBottom: '6px' }}>🏏 {team.players.length} Players</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                          {team.players.map((player, i) => (
                            <div key={player._id || i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                {player.photo ? <img src={getPhotoSrc(player.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} /> : '🏏'}
                              </div>
                              <div style={{ flex: 1, fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--accent-green)', fontFamily: 'Rajdhani', fontWeight: '700', flexShrink: 0 }}>₹{player.soldPrice}L</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Log tab */}
          {activeTab === 'log' && (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Action</th><th>Player</th><th>Team</th><th>Amount</th><th>Time</th></tr></thead>
                <tbody>
                  {log.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No auction activity yet</td></tr>
                  ) : [...log].reverse().map((entry, i) => (
                    <tr key={i}>
                      <td><span className={`badge ${entry.action === 'sold' ? 'badge-green' : 'badge-red'}`}>{entry.action.toUpperCase()}</span></td>
                      <td style={{ fontSize: '13px' }}>{entry.playerName}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{entry.teamName || '-'}</td>
                      <td style={{ fontFamily: 'Rajdhani', fontWeight: '700', color: 'var(--accent-gold)' }}>{entry.amount ? `₹${entry.amount}L` : '-'}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {currentAuction && (
          <div style={{ position: 'sticky', top: '84px', height: 'calc(100vh - 120px)' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
              <h3 style={{ fontFamily: 'Rajdhani', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                💬 Live Chat
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {chatMessages.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Rajdhani', marginTop: '20px' }}>
                    No messages yet. Say something!
                  </p>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    padding: '8px 10px', borderRadius: '8px',
                    background: msg.role === 'admin' ? 'rgba(255,215,0,0.08)' : 'var(--bg-secondary)',
                    borderLeft: msg.role === 'admin' ? '3px solid var(--accent-gold)' : '3px solid transparent',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'Rajdhani', fontWeight: '700', color: msg.role === 'admin' ? 'var(--accent-gold)' : 'var(--accent-blue)' }}>
                        {msg.role === 'admin' ? '⭐ ' : ''}{msg.userName}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{msg.message}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="input" style={{ fontSize: '13px', padding: '8px 12px' }} placeholder="Type a message..."
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()} />
                <button className="btn btn-primary" style={{ padding: '8px 12px', flexShrink: 0 }} onClick={sendChat}><MdSend size={16} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
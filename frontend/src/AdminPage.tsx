import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Play, Pause, RefreshCw, Square, Plus, CheckCircle, Trash2, ShieldAlert, Edit2 } from 'lucide-react';
import './AdminPage.css';

interface StepConfig {
  step_number: number;
  step_type: string;
  location_name: string;
  clue_text: string;
  task_description?: string;
  qr_token?: string;
}

interface Member {
  id: string;
  player_name: string;
  phone_number: string;
  character_role?: string;
  current_step: number;
  history?: any[];
}

interface Team {
  id: string;
  team_id: string;
  team_name: string;
  completed?: boolean;
  penalty_minutes?: number;
  members: Member[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/admin`
  : '/api/admin';

// Helper for safe JSON fetching
async function fetchJson(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const fallbackUrl = `http://127.0.0.1:8000${url}`;
      const fallbackRes = await fetch(fallbackUrl, options);
      const fallbackContentType = fallbackRes.headers.get('content-type') || '';
      if (fallbackContentType.includes('application/json')) {
        if (!fallbackRes.ok) {
          const errBody = await fallbackRes.json().catch(() => ({ detail: fallbackRes.statusText }));
          throw new Error(errBody.detail || `Server returned ${fallbackRes.status}`);
        }
        return fallbackRes.json();
      }
    }
    throw new Error('Backend API not responding with JSON. Ensure FastAPI server is running.');
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errBody.detail || `Server returned ${res.status}`);
  }
  return res.json();
}

export const AdminPage: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState<string>(() => sessionStorage.getItem('admin_email') || 'admin@nexus.com');
  const [adminPassword, setAdminPassword] = useState<string>(() => sessionStorage.getItem('admin_password') || 'boomboom');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!sessionStorage.getItem('admin_secret_verified'));

  const [gameState, setGameState] = useState<string>('unknown');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Team
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // New Team Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamId, setNewTeamId] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newPlayerName, setNewPlayerName] = useState<string>('Captain');

  const ws = useRef<WebSocket | null>(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Admin-Email': adminEmail,
    'X-Admin-Password': adminPassword,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await fetchJson(`${API_BASE}/game/state`, { headers: getHeaders() });
      sessionStorage.setItem('admin_email', adminEmail);
      sessionStorage.setItem('admin_password', adminPassword);
      sessionStorage.setItem('admin_secret_verified', 'true');
      setIsAuthenticated(true);
      fetchDashboardData();
      connectWebSocket();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  const connectWebSocket = () => {
    if (ws.current) ws.current.close();
    const wsUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('http', 'ws') + '/ws/game'
      : 'ws://127.0.0.1:8000/ws/game';
      
    ws.current = new WebSocket(wsUrl);
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'game_state') {
          setGameState(data.status);
        } else if (data.type === 'teams_updated') {
          fetchDashboardData();
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      connectWebSocket();
    }
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const stateRes = await fetchJson(`${API_BASE}/game/state`, { headers: getHeaders() });
      setGameState(stateRes.status);

      const teamsRes = await fetchJson(`${API_BASE}/teams`, { headers: getHeaders() });
      setTeams(teamsRes);
    } catch (err: any) {
      if (err.message.includes('401')) {
        setIsAuthenticated(false);
      } else {
        setErrorMsg('Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewTeamName(name);
    setNewTeamId(name.replace(/\s+/g, '').toUpperCase());
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teams.some(t => t.team_id === newTeamId)) {
      setErrorMsg('Team ID already exists!');
      return;
    }
    try {
      await fetchJson(`${API_BASE}/teams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          team_id: newTeamId,
          team_name: newTeamName,
          phone_number: newPhone,
          player_name: newPlayerName,
        }),
      });
      setSuccessMsg(`Team ${newTeamId} created!`);
      setShowCreateModal(false);
      setNewTeamId('');
      setNewTeamName('');
      setNewPhone('');
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create team');
    }
  };

  const handleGameAction = async (action: 'start' | 'pause' | 'stop') => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} the game?`)) return;
    try {
      await fetchJson(`${API_BASE}/game/${action}`, { method: 'PUT', headers: getHeaders() });
      setSuccessMsg(`Game ${action}ed`);
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to ${action} game`);
    }
  };

  const handleDeleteTeam = async (team_doc_id: string) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await fetchJson(`${API_BASE}/teams/${team_doc_id}`, { method: 'DELETE', headers: getHeaders() });
      if (selectedTeamId === team_doc_id) setSelectedTeamId(null);
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleOverrideTeamStep = async (team_doc_id: string, currentStep: number) => {
    const newStep = prompt("Enter new step number for the ENTIRE team:", (currentStep + 1).toString());
    if (newStep !== null) {
      const parsedStep = parseInt(newStep, 10);
      if (!window.confirm(`Are you sure you want to move the entire team to step ${parsedStep}?`)) return;
      try {
        await fetchJson(`${API_BASE}/teams/${team_doc_id}/override_step`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ new_step: parsedStep })
        });
        await fetchDashboardData();
      } catch (err: any) {
        setErrorMsg(err.message);
      }
    }
  };
  
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState<Member | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberPhone, setEditMemberPhone] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) return;
    try {
      await fetchJson(`${API_BASE}/teams/${selectedTeamId}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          player_name: editMemberName,
          phone_number: editMemberPhone,
          character_role: editMemberRole
        })
      });
      setSuccessMsg("Member added!");
      setShowAddMemberModal(false);
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !showEditMemberModal) return;
    try {
      await fetchJson(`${API_BASE}/teams/${selectedTeamId}/members/${showEditMemberModal.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          player_name: editMemberName,
          phone_number: editMemberPhone,
          character_role: editMemberRole
        })
      });
      setSuccessMsg("Member updated!");
      setShowEditMemberModal(null);
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const openEditModal = (member: Member) => {
    setShowEditMemberModal(member);
    setEditMemberName(member.player_name);
    setEditMemberPhone(member.phone_number);
    setEditMemberRole(member.character_role || '');
  };

  const openAddModal = () => {
    setShowAddMemberModal(true);
    setEditMemberName('');
    setEditMemberPhone('');
    setEditMemberRole('demogorgon_hunter');
  };


  // Derived sorted & filtered teams
  const sortedTeams = useMemo(() => {
    return [...teams]
      .filter(t => 
        t.team_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.members.some(m => m.phone_number.includes(searchQuery))
      )
      .sort((a, b) => {
        const aMax = Math.max(0, ...a.members.map(m => m.current_step));
        const bMax = Math.max(0, ...b.members.map(m => m.current_step));
        return bMax - aMax;
      });
  }, [teams, searchQuery]);

  const selectedTeam = useMemo(() => teams.find(t => t.id === selectedTeamId), [teams, selectedTeamId]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-sm w-full">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Admin Login</h2>
          {errorMsg && <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{errorMsg}</div>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black focus:border-black mb-3"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-black focus:border-black"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition">
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-40 bg-white border-b border-gray-200 flex flex-col md:flex-row md:h-16 md:items-center justify-between px-4 py-2 gap-2 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <h1 className="font-semibold text-lg shrink-0">Nexus Admin</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="md:hidden bg-black text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Team
          </button>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto pb-1 md:pb-0">
          <div className="relative w-full md:w-64 shrink-0 order-2 md:order-1 mt-1 md:mt-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Team ID, Name, or Phone"
              className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm w-full focus:ring-1 focus:ring-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Game Controls */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200 shrink-0 order-1 md:order-2 w-full justify-between md:w-auto md:justify-start">
            <div className="px-2 md:px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1 md:mr-2">
              <span className="hidden md:inline">Status: </span>
              <span className="text-black">{gameState.substring(0,3)}</span>
            </div>
            <div className="flex items-center">
              <button onClick={() => handleGameAction('start')} className="p-1 md:p-1.5 hover:bg-white rounded text-gray-600 hover:text-green-600 transition" title="Start">
                <Play className="w-4 h-4" />
              </button>
              <button onClick={() => handleGameAction('pause')} className="p-1 md:p-1.5 hover:bg-white rounded text-gray-600 hover:text-yellow-600 transition" title="Pause">
                <Pause className="w-4 h-4" />
              </button>
              <button onClick={() => fetchDashboardData()} className="p-1 md:p-1.5 hover:bg-white rounded text-gray-600 hover:text-blue-600 transition" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button onClick={() => handleGameAction('stop')} className="p-1 md:p-1.5 hover:bg-white rounded text-gray-600 hover:text-red-600 transition" title="Stop">
                <Square className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="hidden md:flex bg-black text-white px-4 py-1.5 rounded-md text-sm font-medium items-center gap-2 hover:bg-gray-800 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> New Team
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="pt-[140px] md:pt-16 flex h-screen overflow-hidden">
        
        {/* Left Sidebar: Leaderboard */}
        <aside className={`w-full md:w-[320px] bg-white md:border-r border-gray-200 flex-col h-full overflow-hidden shrink-0 ${selectedTeamId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-sm">Leaderboard</h2>
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-medium">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedTeams.map((t, idx) => {
              const maxLvl = Math.max(0, ...t.members.map(m => m.current_step));
              const isSelected = t.id === selectedTeamId;
              return (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTeamId(t.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm text-gray-900">{idx + 1}. {t.team_name}</div>
                    <span className="bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">LVL {maxLvl}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-mono">{t.team_id}</span>
                    {t.completed && <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Completed</span>}
                  </div>
                </div>
              );
            })}
            {sortedTeams.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">No teams found.</div>
            )}
          </div>
        </aside>

        {/* Right Detail Area */}
        <section className={`flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 relative ${selectedTeamId ? 'block' : 'hidden md:block'}`}>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex justify-between items-center">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="font-bold">×</button>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex justify-between items-center">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="font-bold">×</button>
            </div>
          )}

          {selectedTeam ? (
            <div className="max-w-4xl mx-auto">
              <button 
                onClick={() => setSelectedTeamId(null)}
                className="md:hidden mb-4 text-sm font-medium text-blue-600 flex items-center gap-1"
              >
                ← Back to Leaderboard
              </button>
              <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedTeam.team_name}</h2>
                  <div className="text-sm font-mono text-gray-500 mt-1">{selectedTeam.team_id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOverrideTeamStep(selectedTeam.id, Math.max(0, ...selectedTeam.members.map(m => m.current_step)))}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Override Step
                  </button>
                  <button 
                    onClick={() => handleDeleteTeam(selectedTeam.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Team
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedTeam.members.map((member) => (
                  <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.player_name}</h3>
                        <div className="text-xs text-gray-500 mt-0.5">{member.phone_number}</div>
                      </div>
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-medium">Step {member.current_step}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <button 
                        onClick={() => openEditModal(member)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                ))}
                <div 
                  onClick={openAddModal}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 min-h-[120px]"
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Add New Member</span>
                </div>
                {selectedTeam.members.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-400 bg-white border border-gray-200 rounded-lg">
                    No members enrolled yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShieldAlert className="w-12 h-12 mb-4 text-gray-300" />
              <p>Select a team from the leaderboard to view details</p>
            </div>
          )}
        </section>
      </main>

      {/* Member Edit/Add Modal */}
      {(showEditMemberModal || showAddMemberModal) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold">{showEditMemberModal ? 'Edit Member' : 'Add Member'}</h3>
              <button onClick={() => {setShowEditMemberModal(null); setShowAddMemberModal(false)}} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <form onSubmit={showEditMemberModal ? handleEditMember : handleAddMember} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Player Name</label>
                  <input type="text" required className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-1 focus:ring-black" value={editMemberName} onChange={(e) => setEditMemberName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" required className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-1 focus:ring-black" value={editMemberPhone} onChange={(e) => setEditMemberPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role (Optional)</label>
                  <input type="text" className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-1 focus:ring-black" value={editMemberRole} onChange={(e) => setEditMemberRole(e.target.value)} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => {setShowEditMemberModal(null); setShowAddMemberModal(false)}} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold">Create New Team</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-1 focus:ring-black"
                    value={newTeamName}
                    onChange={handleTeamNameChange}
                    placeholder="e.g. The Hellfire Club"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Team ID (Auto-generated)</label>
                  <input
                    type="text"
                    required
                    className="w-full border-gray-300 rounded border p-2 text-sm font-mono focus:ring-1 focus:ring-black"
                    value={newTeamId}
                    onChange={(e) => setNewTeamId(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Must be unique, uppercase, no spaces.</p>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="text-xs font-semibold text-gray-900 mb-3">Captain Details</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-1 focus:ring-black"
                      placeholder="Player Name (Captain)"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                    />
                    <input
                      type="tel"
                      required
                      className="w-full border-gray-300 rounded border p-2 text-sm focus:ring-1 focus:ring-black"
                      placeholder="Phone Number"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

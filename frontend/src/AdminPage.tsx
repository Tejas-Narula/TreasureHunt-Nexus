import React, { useState, useEffect, useMemo } from 'react';
import { Search, Play, Pause, RefreshCw, Square, Plus, Trash2, Edit2, MapPin, Map, Users } from 'lucide-react';
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
}

interface Team {
  id: string;
  team_id: string;
  team_name: string;
  completed?: boolean;
  penalty_minutes?: number;
  current_step: number;
  history?: any[];
  assigned_trail?: string;
  members: Member[];
}

interface Location {
  id?: string;
  name: string;
  code: string;
}

interface Trail {
  name: string;
  steps: StepConfig[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/admin`
  : '/api/admin';

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
    throw new Error('Backend API not responding with JSON.');
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errBody.detail || `Server returned ${res.status}`);
  }
  return res.json();
}

export const AdminPage: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState<string>(() => sessionStorage.getItem('admin_email') || 'admin@nexus.com');
  const [adminPassword, setAdminPassword] = useState<string>(() => sessionStorage.getItem('admin_password') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!sessionStorage.getItem('admin_secret_verified'));

  const [gameState, setGameState] = useState<string>('unknown');
  const [gameStartTime, setGameStartTime] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [teams, setTeams] = useState<Team[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'teams' | 'locations' | 'trails'>('teams');

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTrailName, setSelectedTrailName] = useState<string | null>(null);

  // New Team Modal State
  const [showCreateTeamModal, setShowCreateTeamModal] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [newTeamId, setNewTeamId] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Admin-Email': adminEmail,
    'X-Admin-Password': adminPassword,
  });

  const fetchDashboardData = async () => {
    setErrorMsg('');
    try {
      const stateRes = await fetchJson(`${API_BASE}/game/state`, { headers: getHeaders() });
      setGameState(stateRes.status);
      setGameStartTime(stateRes.start_time || null);
      const teamsRes = await fetchJson(`${API_BASE}/teams`, { headers: getHeaders() });
      setTeams(teamsRes);
      const locRes = await fetchJson(`${API_BASE}/locations`, { headers: getHeaders() });
      setLocations(locRes);
      const trailRes = await fetchJson(`${API_BASE}/trails`, { headers: getHeaders() });
      setTrails(trailRes);
    } catch (err: any) {
      if (err.message.includes('401')) {
        setIsAuthenticated(false);
      } else {
        setErrorMsg('Failed to load dashboard data.');
      }
    }
  };

  const handleGameAction = async (action: 'start' | 'pause' | 'stop' | 'reset') => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} the game?`)) return;
    try {
      await fetchJson(`${API_BASE}/game/${action}`, { method: 'PUT', headers: getHeaders() });
      setSuccessMsg(`Game ${action}ed`);
      await fetchDashboardData();
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to ${action} game`);
    }
  };

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
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let interval: number;
    if ((gameState === 'active' || gameState === 'paused') && gameStartTime) {
      interval = window.setInterval(() => {
        const start = new Date(gameStartTime).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((now - start) / 1000));

        const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
        const mins = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const secs = (diff % 60).toString().padStart(2, '0');
        setElapsedTime(`${hours}:${mins}:${secs}`);
      }, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => window.clearInterval(interval);
  }, [gameState, gameStartTime]);


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
  };

  const openAddModal = () => {
    setShowAddMemberModal(true);
    setEditMemberName('');
    setEditMemberPhone('');
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teams.some(t => t.team_id === newTeamId)) return setErrorMsg('Team ID exists');
    try {
      await fetchJson(`${API_BASE}/teams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ team_id: newTeamId, team_name: newTeamName, phone_number: newPhone }),
      });
      setSuccessMsg(`Team created!`);
      setShowCreateTeamModal(false);
      setNewTeamId(''); setNewTeamName(''); setNewPhone('');
      fetchDashboardData();
    } catch (err: any) { setErrorMsg(err.message); }
  };

  // derived data
  const sortedTeams = useMemo(() => {
    return [...teams].filter(t => t.team_id.toLowerCase().includes(searchQuery.toLowerCase()) || t.team_name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => (b.current_step || 0) - (a.current_step || 0));
  }, [teams, searchQuery]);

  const sortedLocations = useMemo(() => {
    return [...locations].filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.code.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [locations, searchQuery]);

  const sortedTrails = useMemo(() => {
    return [...trails].filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [trails, searchQuery]);

  const selectedTeam = useMemo(() => teams.find(t => t.id === selectedTeamId), [teams, selectedTeamId]);

  // Locations Logic
  const [locFormName, setLocFormName] = useState('');
  const [locFormCode, setLocFormCode] = useState('');

  const handleSaveLocation = async () => {
    try {
      await fetchJson(`${API_BASE}/locations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: locFormName, code: locFormCode })
      });
      setSuccessMsg('Location saved');
      setLocFormName(''); setLocFormCode('');
      fetchDashboardData();
    } catch (err: any) { setErrorMsg(err.message); }
  };

  // Trails Logic
  const [trailFormName, setTrailFormName] = useState('');
  const [trailSteps, setTrailSteps] = useState<StepConfig[]>([]);

  const openNewTrail = () => {
    setSelectedTrailName(null);
    setTrailFormName('');
    setTrailSteps([]);
  };

  const openEditTrail = (trail: Trail) => {
    setSelectedTrailName(trail.name);
    setTrailFormName(trail.name);
    setTrailSteps([...trail.steps]);
  };

  const handleAddTrailStep = () => {
    setTrailSteps([...trailSteps, { step_number: trailSteps.length + 1, step_type: 'qr_scan', location_name: '', clue_text: '', qr_token: '' }]);
  };

  const handleUpdateTrailStep = (index: number, field: keyof StepConfig, value: any) => {
    const newSteps = [...trailSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setTrailSteps(newSteps);
  };

  const handleRemoveTrailStep = (index: number) => {
    const newSteps = trailSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 }));
    setTrailSteps(newSteps);
  };

  const handleSaveTrail = async () => {
    if (!trailFormName) return setErrorMsg('Trail name required');
    try {
      await fetchJson(`${API_BASE}/trails`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: trailFormName, steps: trailSteps })
      });
      setSuccessMsg('Trail saved');
      fetchDashboardData();
    } catch (err: any) { setErrorMsg(err.message); }
  };

  if (!isAuthenticated) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Admin Login</h2>
        {errorMsg && <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{errorMsg}</div>}
        <div className="mb-4">
          <input type="email" placeholder="Email" className="w-full border-gray-300 rounded p-2 border mb-3" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full border-gray-300 rounded p-2 border" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-black text-white py-2 rounded">Login</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="w-full z-40 bg-white border-b border-gray-200 flex flex-col md:flex-row md:h-16 items-center justify-between px-4 py-2 gap-2">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">Nexus Admin</h1>
          {/* Game Controls */}
          <div className="flex items-center gap-2 shrink-0 hidden md:flex">
            <div className="px-2 py-1 bg-gray-100 rounded-md border border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1 flex items-center">
              <span className="mr-1">Status: </span>
              <span className="text-black font-bold mr-2">{gameState}</span>
              {(gameState === 'active' || gameState === 'paused') && gameStartTime && (
                <span className="text-blue-600 border-l border-gray-300 pl-2">⏱ {elapsedTime}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(!gameState || gameState === 'waiting' || gameState === 'unknown') && (
                <button onClick={() => handleGameAction('start')} className="px-4 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition shadow-sm flex items-center gap-1">
                  <Play className="w-4 h-4" /> Start
                </button>
              )}

              {gameState === 'active' && (
                <button onClick={() => handleGameAction('pause')} className="px-4 py-1.5 bg-amber-500 text-white rounded-md text-sm font-medium hover:bg-amber-600 transition shadow-sm flex items-center gap-1">
                  <Pause className="w-4 h-4" /> Pause
                </button>
              )}

              {gameState === 'paused' && (
                <>
                  <button onClick={() => handleGameAction('start')} className="px-4 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition shadow-sm flex items-center gap-1">
                    <Play className="w-4 h-4" /> Start
                  </button>
                  <button onClick={() => handleGameAction('stop')} className="px-4 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition shadow-sm flex items-center gap-1">
                    <Square className="w-4 h-4" /> End
                  </button>
                </>
              )}

              {gameState === 'ended' && (
                <>
                  <button onClick={() => handleGameAction('start')} className="px-4 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition shadow-sm flex items-center gap-1">
                    <Play className="w-4 h-4" /> Start
                  </button>
                  <button onClick={() => handleGameAction('reset')} className="px-4 py-1.5 bg-slate-500 text-white rounded-md text-sm font-medium hover:bg-slate-600 transition shadow-sm flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('teams')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'teams' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Users className="w-4 h-4" /> Teams</button>
          <button onClick={() => setActiveTab('locations')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'locations' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><MapPin className="w-4 h-4" /> Locations</button>
          <button onClick={() => setActiveTab('trails')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${activeTab === 'trails' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><Map className="w-4 h-4" /> Trails</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded w-full text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {activeTab === 'teams' && (
              <button onClick={() => setShowCreateTeamModal(true)} className="bg-black text-white px-3 py-1.5 rounded text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> New Team</button>
            )}
            {activeTab === 'trails' && (
              <button onClick={openNewTrail} className="bg-black text-white px-3 py-1.5 rounded text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> New Trail</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'teams' && sortedTeams.map(t => (
              <div key={t.id} onClick={() => setSelectedTeamId(t.id)} className={`p-4 border-b cursor-pointer ${selectedTeamId === t.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <div className="font-medium text-sm">{t.team_name}</div>
                <div className="text-xs text-gray-500">LVL {t.current_step || 0} | {t.team_id}</div>
              </div>
            ))}
            {activeTab === 'locations' && sortedLocations.map(l => (
              <div key={l.id} className="p-4 border-b">
                <div className="font-medium text-sm">{l.name}</div>
                <div className="text-xs text-gray-500 font-mono">{l.code}</div>
              </div>
            ))}
            {activeTab === 'trails' && sortedTrails.map(t => (
              <div key={t.name} onClick={() => openEditTrail(t)} className={`p-4 border-b cursor-pointer ${selectedTrailName === t.name ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-gray-500">{t.steps.length} steps</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Detail */}
        <section className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">{successMsg}</div>}

          {activeTab === 'teams' && selectedTeam && (
            <div className="max-w-3xl">
              <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTeam.team_name}</h2>
                  <p className="text-gray-500 font-mono text-sm">{selectedTeam.team_id} • Step {selectedTeam.current_step || 0}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOverrideTeamStep(selectedTeam.id, selectedTeam.current_step || 0)}
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

              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-semibold">Members</h3>
                <button onClick={openAddModal} className="text-sm text-blue-600 flex items-center gap-1 hover:underline"><Plus className="w-4 h-4" /> Add Member</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTeam.members.map(m => (
                  <div key={m.id} className="bg-white p-4 rounded border shadow-sm flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{m.player_name}</div>
                      <div className="text-sm text-gray-500">{m.phone_number}</div>
                    </div>
                    <button onClick={() => openEditModal(m)} className="text-gray-400 hover:text-gray-800"><Edit2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="max-w-md bg-white p-6 rounded border shadow-sm">
              <h2 className="text-xl font-bold mb-4">Add Location</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Location Name (e.g. Library)" className="w-full border p-2 rounded text-sm" value={locFormName} onChange={e => setLocFormName(e.target.value)} />
                <input type="text" placeholder="Location Code (e.g. LIB_01)" className="w-full border p-2 rounded text-sm font-mono" value={locFormCode} onChange={e => setLocFormCode(e.target.value)} />
                <button onClick={handleSaveLocation} className="w-full bg-black text-white py-2 rounded text-sm">Save Location</button>
              </div>
            </div>
          )}

          {activeTab === 'trails' && (
            <div className="max-w-4xl bg-white p-6 rounded border shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{selectedTrailName ? `Edit Trail: ${selectedTrailName}` : 'New Trail'}</h2>
                <button onClick={handleSaveTrail} className="bg-black text-white px-4 py-2 rounded text-sm">Save Trail</button>
              </div>

              <input type="text" placeholder="Trail Name (e.g. Alpha Route)" className="w-full border p-2 rounded text-sm mb-6 font-semibold" value={trailFormName} onChange={e => setTrailFormName(e.target.value)} disabled={!!selectedTrailName} />

              <div className="space-y-6">
                {trailSteps.map((step, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-4 bg-gray-50 relative">
                    <button onClick={() => handleRemoveTrailStep(idx)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                    <h4 className="font-bold text-sm mb-3">Step {step.step_number}</h4>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                        <select className="w-full border rounded p-1.5 text-sm" value={step.step_type} onChange={e => handleUpdateTrailStep(idx, 'step_type', e.target.value)}>
                          <option value="qr_scan">QR Scan</option>
                          <option value="special_task">Special Task</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                        <select className="w-full border rounded p-1.5 text-sm" value={step.location_name} onChange={e => handleUpdateTrailStep(idx, 'location_name', e.target.value)}>
                          <option value="">Select a location...</option>
                          {locations.map(l => (
                            <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Clue Text</label>
                      <textarea className="w-full border rounded p-1.5 text-sm" rows={2} value={step.clue_text} onChange={e => handleUpdateTrailStep(idx, 'clue_text', e.target.value)}></textarea>
                    </div>

                    {step.step_type === 'qr_scan' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">QR Token (optional)</label>
                        <input type="text" className="w-full border rounded p-1.5 text-sm font-mono" value={step.qr_token || ''} onChange={e => handleUpdateTrailStep(idx, 'qr_token', e.target.value)} />
                      </div>
                    )}

                    {step.step_type === 'special_task' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Task Description</label>
                        <textarea className="w-full border rounded p-1.5 text-sm" rows={2} value={step.task_description || ''} onChange={e => handleUpdateTrailStep(idx, 'task_description', e.target.value)}></textarea>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={handleAddTrailStep} className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded-lg text-sm hover:bg-gray-100 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          {/* omitted for brevity, this is just a mockup of the old modal if needed, let's keep it simple */}
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="font-bold mb-4">New Team</h3>
            <input type="text" placeholder="Team ID" className="w-full border p-2 mb-2" value={newTeamId} onChange={e => setNewTeamId(e.target.value)} />
            <input type="text" placeholder="Team Name" className="w-full border p-2 mb-4" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateTeamModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleCreateTeam} className="bg-black text-white px-4 py-2 rounded">Create</button>
            </div>
          </div>
        </div>
      )}
      {/* Member Edit/Add Modal */}
      {(showEditMemberModal || showAddMemberModal) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold">{showEditMemberModal ? 'Edit Member' : 'Add Member'}</h3>
              <button onClick={() => { setShowEditMemberModal(null); setShowAddMemberModal(false) }} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
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
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => { setShowEditMemberModal(null); setShowAddMemberModal(false) }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

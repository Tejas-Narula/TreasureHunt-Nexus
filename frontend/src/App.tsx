import { useState, useEffect } from 'react';
import type { ThemeMode, OperativeUser } from './types';
import { Navbar } from './components/Navbar';
import { BackgroundEffects } from './components/BackgroundEffects';
import { LoginPage } from './components/LoginPage';
import { GameStatusPage } from './components/GameStatusPage';
import { MissionPage } from './pages/mission/MissionPage';
import './index.css';

export function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'waiting' | 'paused' | 'ended' | 'mission'>('login');
  const [themeMode, setThemeMode] = useState<ThemeMode>('hawkins');
  const [currentUser, setCurrentUser] = useState<OperativeUser | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Apply upsidedown mode body class for corrupted filters
  useEffect(() => {
    if (themeMode === 'upsidedown') {
      document.documentElement.classList.add('upsidedown-corrupted');
    } else {
      document.documentElement.classList.remove('upsidedown-corrupted');
    }
  }, [themeMode]);

  // Global WebSocket listener for game state
  useEffect(() => {
    if (!currentUser || activeTab === 'login') return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace(/^https?:\/\//, '') 
      : window.location.host;
      
    const wsUrl = import.meta.env.VITE_API_BASE_URL 
      ? `${protocol}//${host}/ws/game`
      : `ws://localhost:8000/ws/game`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'game_state') {
          if (data.status === 'active') {
            setActiveTab('mission');
          } else if (data.status === 'paused') {
            setActiveTab('paused');
          } else if (data.status === 'ended') {
            setActiveTab('ended');
          } else {
            setActiveTab('waiting');
          }
        }
      } catch (err) {
        console.error('Error parsing websocket message:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [currentUser, activeTab]);

  return (
    <div className={`min-h-screen relative flex flex-col ${themeMode === 'upsidedown' ? 'upsidedown-active' : ''}`}>
      {/* Dynamic Background Effects: Spore Particles, Vortex, CRT Scanlines */}
      <BackgroundEffects themeMode={themeMode} />

      {/* Header Navigation - Only shown on Home Hub */}
      {activeTab === 'home' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      )}

      {/* Main Content Area */}
<main className="relative z-10 flex-1 flex flex-col">
          {activeTab === 'login' ? (
  <LoginPage
    onLoginSuccess={async (user) => {
      setCurrentUser(user);
      try {
        const res = await fetch(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/player/state` : '/api/player/state');
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'active') {
            setActiveTab('mission');
            return;
          }
        }
        // Fallback to check localhost if API_BASE is missing or failing (dev env workaround)
        if (!res.ok && !import.meta.env.VITE_API_BASE_URL) {
           const fb = await fetch(`http://127.0.0.1:8000/api/player/state`);
           if (fb.ok) {
             const fbData = await fb.json();
             if (fbData.status === 'active') {
               setActiveTab('mission');
             } else {
               setActiveTab(fbData.status || 'waiting');
             }
             return;
           }
        }
      } catch (err) {
        console.error('Failed to check game state', err);
      }
      setActiveTab('waiting');
    }}
    onNavigateHome={() => {}}
  />
) : activeTab === 'waiting' || activeTab === 'paused' || activeTab === 'ended' ? (
  <GameStatusPage status={activeTab as 'waiting' | 'paused' | 'ended'} />
) : (
  <MissionPage onBack={() => setActiveTab('waiting')} currentUser={currentUser!} />
)}
      </main>

      {/* Footer Status Bar - Only shown on Home Hub */}
      {activeTab === 'home' && (
        <footer className="relative z-10 w-full border-t border-[#ff0033]/20 bg-[#080204]/90 py-2.5 px-4 font-digital text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#ff3355] font-bold">NEXUS OPERATIVE SYSTEM</span>
            <span>•</span>
            <span>INTO THE UPSIDE DOWN</span>
          </div>
          <div className="flex items-center gap-4">
            <span>HAWKINS, INDIANA</span>
            <span>•</span>
            <span className="text-[#00ff66]">VECNA SIGNATURE: TRACKED</span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import type { ThemeMode, OperativeUser } from './types';
import { Navbar } from './components/Navbar';
import { BackgroundEffects } from './components/BackgroundEffects';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import './index.css';

export function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'home'>('login');
  const [themeMode, setThemeMode] = useState<ThemeMode>('hawkins');
  const [currentUser, setCurrentUser] = useState<OperativeUser | null>({
    agentId: 'NX7Q-DUSTIN',
    codename: 'DUSTIN HENDERSON',
    clearance: 'HELLFIRE LEADER (LEVEL 5)',
  });
  const [isMuted, setIsMuted] = useState(false);

  // Apply upsidedown mode body class for corrupted filters
  useEffect(() => {
    if (themeMode === 'upsidedown') {
      document.documentElement.classList.add('upsidedown-corrupted');
    } else {
      document.documentElement.classList.remove('upsidedown-corrupted');
    }
  }, [themeMode]);

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
            onLoginSuccess={(user) => setCurrentUser(user)}
            onNavigateHome={() => setActiveTab('home')}
          />
        ) : (
          <HomePage
            currentUser={currentUser}
            onNavigateLogin={() => setActiveTab('login')}
          />
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

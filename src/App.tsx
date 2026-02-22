import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal } from './components/Terminal';
import { MainView } from './components/MainView';
import { UPGRADES, JOBS } from './game/data';
import { playBurstSound, playUpgradeSound, playJobStartSound, playJobCompleteSound } from './utils/audio';
import { Settings, Terminal as TerminalIcon, Cpu, Network, Zap, Activity, Play } from 'lucide-react';

type GameState = {
  data: number;
  totalDataEarned: number;
  era: number;
  upgrades: Record<string, number>;
  nodes: {
    total: number;
    mining: number;
    scanning: number;
  };
  activeJob: {
    id: string;
    timeLeft: number;
    duration: number;
    payout: number;
  } | null;
  logs: { id: string; text: string; timestamp: number }[];
  settings: {
    crtEnabled: boolean;
    soundEnabled: boolean;
    typingSpeed: number;
  };
};

const initialState: GameState = {
  data: 0,
  totalDataEarned: 0,
  era: 1,
  upgrades: {},
  nodes: { total: 0, mining: 0, scanning: 0 },
  activeJob: null,
  logs: [{ id: 'init', text: 'SYSTEM BOOT... OK. WAITING FOR INPUT.', timestamp: Date.now() }],
  settings: {
    crtEnabled: true,
    soundEnabled: true,
    typingSpeed: 20,
  }
};

export default function App() {
  const [state, setState] = useState<GameState>(initialState);
  const [showSettings, setShowSettings] = useState(false);
  
  const lastTickRef = useRef<number>(Date.now());

  const addLog = useCallback((text: string) => {
    setState(s => ({
      ...s,
      logs: [...s.logs, { id: Math.random().toString(36).substr(2, 9), text, timestamp: Date.now() }]
    }));
  }, []);

  const getBurstValue = useCallback((s: GameState) => {
    let val = 1;
    if (s.upgrades.ram) val += s.upgrades.ram * UPGRADES.ram.value;
    return val;
  }, []);

  const getDps = useCallback((s: GameState) => {
    let dps = 0;
    if (s.upgrades.scraper) dps += s.upgrades.scraper * UPGRADES.scraper.value;
    if (s.upgrades.overclock) dps += s.upgrades.overclock * UPGRADES.overclock.value;
    
    if (s.era >= 2) {
      let nodeDps = 1;
      if (s.upgrades.miningAlgo) nodeDps += s.upgrades.miningAlgo * UPGRADES.miningAlgo.value;
      dps += s.nodes.mining * nodeDps;
    }
    return dps;
  }, []);

  const getJobMultiplier = useCallback((s: GameState) => {
    let mult = 1;
    if (s.era >= 2 && s.upgrades.deepScan) {
      mult += s.nodes.scanning * (s.upgrades.deepScan * UPGRADES.deepScan.value);
    }
    return mult;
  }, []);

  const getUpgradeCost = useCallback((upgradeId: string, currentLevel: number) => {
    const upg = UPGRADES[upgradeId as keyof typeof UPGRADES];
    return Math.floor(upg.baseCost * Math.pow(upg.costMult, currentLevel));
  }, []);

  const handleBurst = useCallback(() => {
    if (state.settings.soundEnabled) playBurstSound();
    const amount = getBurstValue(state);
    setState(s => ({
      ...s,
      data: s.data + amount,
      totalDataEarned: s.totalDataEarned + amount
    }));
    if (Math.random() < 0.1) {
      addLog(`> Manual data extraction: +${amount} Data`);
    }
  }, [state, getBurstValue, addLog]);

  const handleBuyUpgrade = useCallback((id: string) => {
    const upg = UPGRADES[id as keyof typeof UPGRADES];
    const currentLevel = state.upgrades[id] || 0;
    if (upg.maxLevel && currentLevel >= upg.maxLevel) return;
    
    const cost = getUpgradeCost(id, currentLevel);
    if (state.data >= cost) {
      if (state.settings.soundEnabled) playUpgradeSound();
      setState(s => {
        const next = {
          ...s,
          data: s.data - cost,
          upgrades: { ...s.upgrades, [id]: currentLevel + 1 }
        };
        
        if (upg.effect === 'era') {
          next.era = upg.value;
          addLog(`>>> UPLINK ESTABLISHED. WELCOME TO ERA ${upg.value}.`);
        } else if (upg.effect === 'node') {
          next.nodes.total += 1;
          if (next.nodes.total === 1) next.nodes.mining = 1;
        }
        
        return next;
      });
      addLog(`> Installed: ${upg.name} (Lvl ${currentLevel + 1})`);
    }
  }, [state, getUpgradeCost, addLog]);

  const handleStartJob = useCallback((id: string) => {
    if (state.activeJob) return;
    const job = JOBS[id as keyof typeof JOBS];
    if (state.settings.soundEnabled) playJobStartSound();
    
    const mult = getJobMultiplier(state);
    const payout = Math.floor(job.basePayout * mult);
    
    setState(s => ({
      ...s,
      activeJob: {
        id,
        duration: job.duration,
        timeLeft: job.duration,
        payout
      }
    }));
    addLog(`> Executing script: ${job.name}...`);
  }, [state, getJobMultiplier, addLog]);

  const handleAssignNode = useCallback((type: 'mining' | 'scanning', amount: number) => {
    setState(s => {
      const next = { ...s };
      const unassigned = s.nodes.total - s.nodes.mining - s.nodes.scanning;
      
      if (amount > 0 && unassigned >= amount) {
        next.nodes[type] += amount;
      } else if (amount < 0 && s.nodes[type] >= Math.abs(amount)) {
        next.nodes[type] += amount;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setState(s => {
        let next = { ...s };
        let dataGained = 0;

        const dps = getDps(s);
        if (dps > 0) {
          dataGained += dps * dt;
        }

        if (next.activeJob) {
          next.activeJob.timeLeft -= dt;
          if (next.activeJob.timeLeft <= 0) {
            if (s.settings.soundEnabled) playJobCompleteSound();
            dataGained += next.activeJob.payout;
            addLog(`> Job Complete: ${JOBS[next.activeJob.id as keyof typeof JOBS].name}. Payout: ${next.activeJob.payout} Data.`);
            next.activeJob = null;
          }
        }

        if (dataGained > 0) {
          next.data += dataGained;
          next.totalDataEarned += dataGained;
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [getDps, addLog]);

  const dps = getDps(state);
  const burstVal = getBurstValue(state);

  return (
    <div className={`min-h-screen bg-black text-[#33ff00] font-mono flex flex-col ${state.settings.crtEnabled ? 'crt-flicker' : ''}`}>
      {state.settings.crtEnabled && (
        <>
          <div className="crt-overlay" />
          <div className="scanline" />
        </>
      )}

      <header className="p-4 border-b border-[#33ff00]/30 flex justify-between items-center bg-[#051005] z-10 relative">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-widest">NET_CRAWLER v1.0</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-bold text-[#ffb000]">{Math.floor(state.data).toLocaleString()} DATA</div>
            <div className="text-xs opacity-70">{dps.toFixed(1)} / sec</div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-[#33ff00]/20 rounded transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 z-10 relative max-w-7xl mx-auto w-full">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <MainView era={state.era} />
          <div className="h-96 lg:h-[600px] flex flex-col">
            <Terminal logs={state.logs} typingSpeed={state.settings.typingSpeed} soundEnabled={state.settings.soundEnabled} />
          </div>
        </div>

        <div className="flex flex-col gap-4 pr-2">
          <div className="border border-[#33ff00]/30 rounded p-4 bg-[#051005]">
            <h2 className="text-lg mb-2 flex items-center gap-2 border-b border-[#33ff00]/30 pb-2">
              <Zap className="w-5 h-5" /> MANUAL OVERRIDE
            </h2>
            <button 
              onClick={handleBurst}
              className="w-full py-4 bg-[#1a4d1a] hover:bg-[#33ff00] hover:text-black border border-[#33ff00] rounded font-bold text-lg transition-all active:scale-95"
            >
              EXTRACT DATA (+{burstVal})
            </button>
          </div>

          <div className="border border-[#33ff00]/30 rounded p-4 bg-[#051005]">
            <h2 className="text-lg mb-2 flex items-center gap-2 border-b border-[#33ff00]/30 pb-2">
              <Activity className="w-5 h-5" /> ACTIVE JOBS
            </h2>
            
            {state.activeJob ? (
              <div className="p-3 border border-[#ffb000] rounded bg-[#ffb000]/10">
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-[#ffb000]">{JOBS[state.activeJob.id as keyof typeof JOBS].name}</span>
                  <span>{Math.ceil(state.activeJob.timeLeft)}s</span>
                </div>
                <div className="w-full bg-black h-2 rounded overflow-hidden border border-[#ffb000]/50">
                  <div 
                    className="bg-[#ffb000] h-full transition-all duration-100 linear"
                    style={{ width: `${(1 - state.activeJob.timeLeft / state.activeJob.duration) * 100}%` }}
                  />
                </div>
                <div className="text-xs mt-1 text-right text-[#ffb000]">
                  Payout: {state.activeJob.payout}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.values(JOBS).filter(j => j.era <= state.era).map(job => {
                  const mult = getJobMultiplier(state);
                  const payout = Math.floor(job.basePayout * mult);
                  return (
                    <button
                      key={job.id}
                      onClick={() => handleStartJob(job.id)}
                      className="flex items-center justify-between p-2 border border-[#33ff00]/30 rounded hover:bg-[#33ff00]/10 text-left transition-colors"
                    >
                      <div>
                        <div className="font-bold">{job.name}</div>
                        <div className="text-xs opacity-70">{job.duration}s | Payout: {payout}</div>
                      </div>
                      <Play className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {state.era >= 2 && (
            <div className="border border-[#33ff00]/30 rounded p-4 bg-[#051005]">
              <h2 className="text-lg mb-2 flex items-center gap-2 border-b border-[#33ff00]/30 pb-2">
                <Network className="w-5 h-5" /> LAN NODES
              </h2>
              <div className="mb-2 text-sm">
                Total Nodes: {state.nodes.total} | Unassigned: {state.nodes.total - state.nodes.mining - state.nodes.scanning}
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-2 border border-[#33ff00]/20 rounded bg-black">
                  <div>
                    <div className="font-bold">Mining Nodes</div>
                    <div className="text-xs opacity-70">Adds to DPS</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAssignNode('mining', -1)} className="px-2 py-1 border border-[#33ff00] rounded hover:bg-[#33ff00]/20">-</button>
                    <span className="w-6 text-center">{state.nodes.mining}</span>
                    <button onClick={() => handleAssignNode('mining', 1)} className="px-2 py-1 border border-[#33ff00] rounded hover:bg-[#33ff00]/20">+</button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border border-[#33ff00]/20 rounded bg-black">
                  <div>
                    <div className="font-bold">Scanning Nodes</div>
                    <div className="text-xs opacity-70">Boosts Job Payouts</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAssignNode('scanning', -1)} className="px-2 py-1 border border-[#33ff00] rounded hover:bg-[#33ff00]/20">-</button>
                    <span className="w-6 text-center">{state.nodes.scanning}</span>
                    <button onClick={() => handleAssignNode('scanning', 1)} className="px-2 py-1 border border-[#33ff00] rounded hover:bg-[#33ff00]/20">+</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border border-[#33ff00]/30 rounded p-4 bg-[#051005]">
            <h2 className="text-lg mb-2 flex items-center gap-2 border-b border-[#33ff00]/30 pb-2">
              <Cpu className="w-5 h-5" /> HARDWARE & SCRIPTS
            </h2>
            <div className="flex flex-col gap-2">
              {Object.values(UPGRADES).filter(u => u.era <= state.era).map(upg => {
                const currentLevel = state.upgrades[upg.id] || 0;
                if (upg.maxLevel && currentLevel >= upg.maxLevel) return null;
                
                const cost = getUpgradeCost(upg.id, currentLevel);
                const canAfford = state.data >= cost;
                
                return (
                  <button
                    key={upg.id}
                    onClick={() => handleBuyUpgrade(upg.id)}
                    disabled={!canAfford}
                    className={`flex flex-col p-2 border rounded text-left transition-colors ${
                      canAfford 
                        ? 'border-[#33ff00]/50 hover:bg-[#33ff00]/10 cursor-pointer' 
                        : 'border-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold">{upg.name} <span className="text-xs font-normal opacity-70">Lvl {currentLevel}</span></span>
                      <span className={canAfford ? 'text-[#ffb000]' : ''}>{cost} Data</span>
                    </div>
                    <div className="text-xs opacity-70 mt-1">{upg.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#051005] border border-[#33ff00] p-6 rounded max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 border-b border-[#33ff00]/30 pb-2">SYSTEM SETTINGS</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              <label className="flex items-center justify-between cursor-pointer">
                <span>CRT Scanlines & Flicker</span>
                <input 
                  type="checkbox" 
                  checked={state.settings.crtEnabled}
                  onChange={(e) => setState(s => ({...s, settings: {...s.settings, crtEnabled: e.target.checked}}))}
                  className="w-5 h-5 accent-[#33ff00]"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span>Audio (Beeps & Boops)</span>
                <input 
                  type="checkbox" 
                  checked={state.settings.soundEnabled}
                  onChange={(e) => setState(s => ({...s, settings: {...s.settings, soundEnabled: e.target.checked}}))}
                  className="w-5 h-5 accent-[#33ff00]"
                />
              </label>
              
              <label className="flex flex-col gap-2">
                <span>Terminal Typing Speed (ms/char)</span>
                <input 
                  type="range" 
                  min="0" max="100" step="5"
                  value={state.settings.typingSpeed}
                  onChange={(e) => setState(s => ({...s, settings: {...s.settings, typingSpeed: parseInt(e.target.value)}}))}
                  className="w-full accent-[#33ff00]"
                />
                <div className="text-right text-xs opacity-70">{state.settings.typingSpeed}ms</div>
              </label>
            </div>
            
            <button 
              onClick={() => setShowSettings(false)}
              className="w-full py-2 border border-[#33ff00] hover:bg-[#33ff00] hover:text-black transition-colors font-bold rounded"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

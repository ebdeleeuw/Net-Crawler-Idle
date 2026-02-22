export type Upgrade = {
  id: string;
  name: string;
  baseCost: number;
  costMult: number;
  effect: string;
  value: number;
  era: number;
  desc: string;
  maxLevel?: number;
};

export const UPGRADES: Record<string, Upgrade> = {
  ram: { id: 'ram', name: 'RAM Upgrade', baseCost: 10, costMult: 1.5, effect: 'burst', value: 1, era: 1, desc: 'Increases Data per Burst by 1.' },
  scraper: { id: 'scraper', name: 'Auto-Scraper', baseCost: 20, costMult: 1.5, effect: 'dps', value: 1, era: 1, desc: 'Increases Data per Second by 1.' },
  overclock: { id: 'overclock', name: 'Overclock CPU', baseCost: 100, costMult: 1.8, effect: 'dps', value: 5, era: 1, desc: 'Increases Data per Second by 5.' },
  network: { id: 'network', name: 'Network Card', baseCost: 500, costMult: 1, effect: 'era', value: 2, era: 1, desc: 'Connect to the LAN. Unlocks Era 2.', maxLevel: 1 },
  
  node: { id: 'node', name: 'Buy Node', baseCost: 1000, costMult: 1.4, effect: 'node', value: 1, era: 2, desc: 'Adds 1 Node to your LAN.' },
  miningAlgo: { id: 'miningAlgo', name: 'Mining Algorithms', baseCost: 2000, costMult: 1.6, effect: 'nodeDps', value: 2, era: 2, desc: 'Each Mining Node produces +2 Data/sec.' },
  deepScan: { id: 'deepScan', name: 'Deep Scan', baseCost: 2500, costMult: 1.6, effect: 'nodeScan', value: 0.1, era: 2, desc: 'Each Scanning Node adds +10% to Job payouts.' },
  fiber: { id: 'fiber', name: 'Fiber Backbone', baseCost: 50000, costMult: 1, effect: 'era', value: 3, era: 2, desc: 'Connect to the corporate backbone. Unlocks Era 3.', maxLevel: 1 },
};

export const JOBS = {
  skim: { id: 'skim', name: 'Skim Bank Accounts', duration: 10, basePayout: 50, era: 1 },
  ddos: { id: 'ddos', name: 'DDoS Competitor', duration: 30, basePayout: 200, era: 1 },
  steal: { id: 'steal', name: 'Steal Corporate Secrets', duration: 60, basePayout: 1000, era: 2 },
  ransom: { id: 'ransom', name: 'Deploy Ransomware', duration: 120, basePayout: 5000, era: 2 },
};

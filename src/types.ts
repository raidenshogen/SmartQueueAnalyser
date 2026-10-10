// ==========================================
// FRONTEND UI TYPES
// ==========================================
export interface Individual {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  mfaActive: boolean;
  biometricActive: boolean;
}

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface AppToastType {
  message: string;
  type: 'success' | 'error' | 'info';
}

export type TabType = 'overview' | 'history' | 'predictions' | 'settings';

// ==========================================
// BACKEND DATA TYPES
// ==========================================
export interface Ticket {
  id: string;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  queue: 'Technical Support' | 'Billing' | 'Onboarding' | 'General Inquiry';
  created_at: string;
  elapsed_time: number;
  sla_limit: number;
  predicted_wait_time: number;
  risk_level: 'Safe' | 'Warning' | 'High Risk';
  ai_recommendation: string;
  subject: string;
  assignee: string;
}

export interface KPIHistory {
  id: number;
  annee: number;
  duree_attente_moy: number; 
  duree_attente_p90: number; 
  duree_traitement_moy: number; 
  flux_par_heure: number; 
  heure_pointe: number; 
  is_special_day: number; 
  jour: string; 
  jour_semaine: string; 
  mois: number; 
  nb_guichets_actifs: number; 
  occupation_guichets: number; 
  pct10a20min: number; 
  pct5a10min: number; 
  pct_moins5min: number; 
  pct_plus20min: number; 
  productivite_agent: number; 
  service: string; 
  site: string; 
  sla_breach_count: number; 
  special_day_label: string; 
  taux_abandon: number; 
  taux_pause: number; 
  taux_redirection: number; 
  taux_service: number; 
  tickets_abandonnes: number; 
  tickets_en_pause: number; 
  tickets_par_guichet: number; 
  tickets_termines: number; 
  trimestre: number; 
  volume_heure_pointe: number; 
  volume_tickets: number;
}

export interface KPIPredictions extends KPIHistory {
  date: string;
  granularite: string;
}

export interface WaitDistributionItem {
  range: string;
  count: number;
  queue: string;
}

export interface AgentPerformance {
  id: string;
  name: string;
  status: 'Online' | 'Away' | 'Offline';
  resolvedCount: number;
  avgResolveTime: number; 
  slaAdherenceRate: number; 
  avatarUrl: string;
}
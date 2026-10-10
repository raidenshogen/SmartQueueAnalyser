import React from 'react';

export const formatMessageText = (text: string, darkMode: boolean) => {
  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    if (line.startsWith('### ')) {
      return <h4 key={lIdx} className="font-display font-bold text-[#ff682c] mt-3 mb-1 text-sm">{line.replace('### ', '')}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={lIdx} className="font-display font-bold text-[#ff682c] mt-3 mb-1 text-base">{line.replace('## ', '')}</h3>;
    }
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={lIdx} className="mt-1 text-xs leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold">{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
          })}
        </p>
      );
    }
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      return (
        <li key={lIdx} className="ml-4 mt-1 text-xs list-disc text-slate-600 dark:text-slate-400">
          {line.trim().substring(2)}
        </li>
      );
    }
    if (/^\d+\.\s/.test(line.trim())) {
      return (
        <li key={lIdx} className="ml-4 mt-1 text-xs list-decimal text-slate-600 dark:text-slate-400">
          {line.trim().replace(/^\d+\.\s/, '')}
        </li>
      );
    }
    if (line.trim() === '') return <br key={lIdx} />;
    return <p key={lIdx} className="mt-1 text-xs leading-relaxed">{line}</p>;
  });
};

export const findKPIHistoryArray = (obj: any): any[] | null => {
  if (!obj) return null;
  if (Array.isArray(obj)) {
    if (obj.length > 0 && (obj[0].jour || obj[0].day || obj[0].date || obj[0].site)) return obj;
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (Array.isArray(val) && val.length > 0 && (val[0].jour || val[0].date || val[0].site)) return val;
      if (val && typeof val === 'object') {
        const nested = findKPIHistoryArray(val);
        if (nested) return nested;
      }
    }
  }
  return null;
};

export const cleanSiteNameFrontend = (site: string | undefined | null): string => {
  if (!site) return '';
  const trimmed = site.trim();
  if (/^site[_\-\s]?(\d+)$/i.test(trimmed)) {
    const match = trimmed.match(/^site[_\-\s]?(\d+)$/i);
    if (match) return `Site ${match[1]}`;
  }
  return trimmed.replace(/[_\-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase()).replace(/\s+/g, ' ').trim();
};

export const cleanServiceNameFrontend = (service: string | undefined | null): string => {
  if (!service) return '';
  const trimmed = service.trim();
  if (/^service[_\-\s]?(\d+)$/i.test(trimmed)) {
    const match = trimmed.match(/^service[_\-\s]?(\d+)$/i);
    if (match) return `Service ${match[1]}`;
  }
  return trimmed.replace(/[_\-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase()).replace(/\s+/g, ' ').trim();
};

export const cleanRates = (arr: any[]) => arr.map(item => ({
  ...item,
  taux_service: typeof item.taux_service === 'number' && item.taux_service <= 1 ? item.taux_service * 100 : item.taux_service,
  taux_abandon: typeof item.taux_abandon === 'number' && item.taux_abandon <= 1 ? item.taux_abandon * 100 : item.taux_abandon,
  occupation_guichets: typeof item.occupation_guichets === 'number' && item.occupation_guichets <= 1 ? item.occupation_guichets * 100 : item.occupation_guichets
}));

// Ajoutez cette fonction utilitaire dans votre fichier helpers.ts ou directement dans le hook
export const aggregateHistoryByDay = (data: any[]) => {
  if (!data || data.length === 0) return [];
  
  const grouped: Record<string, any> = {};
  
  data.forEach(item => {
    // Clé unique : Date + Site + Service
    const key = `${item.jour}|${item.site}|${item.service}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        ...item,
        id: key, // Nouvel ID unique
        _volumeSum: item.volume_tickets || 0,
        _waitWeightedSum: (item.duree_attente_moy || 0) * (item.volume_tickets || 0),
        _serviceWeightedSum: (item.taux_service || 0) * (item.volume_tickets || 0),
        _abandonWeightedSum: ((item.taux_abandon || 0) <= 1 ? (item.taux_abandon || 0) * 100 : (item.taux_abandon || 0)) * (item.volume_tickets || 0),
        _slaBreachSum: item.sla_breach_count || 0,
        _p90Max: item.duree_attente_p90 || 0
      };
    } else {
      const vol = item.volume_tickets || 0;
      grouped[key]._volumeSum += vol;
      grouped[key]._waitWeightedSum += (item.duree_attente_moy || 0) * vol;
      grouped[key]._serviceWeightedSum += (item.taux_service || 0) * vol;
      grouped[key]._abandonWeightedSum += ((item.taux_abandon || 0) <= 1 ? (item.taux_abandon || 0) * 100 : (item.taux_abandon || 0)) * vol;
      grouped[key]._slaBreachSum += item.sla_breach_count || 0;
      grouped[key]._p90Max = Math.max(grouped[key]._p90Max, item.duree_attente_p90 || 0);
    }
  });

  // Reconstruction des objets finaux
  return Object.values(grouped).map(g => ({
    ...g,
    volume_tickets: g._volumeSum,
    duree_attente_moy: g._volumeSum > 0 ? g._waitWeightedSum / g._volumeSum : 0,
    taux_service: g._volumeSum > 0 ? g._serviceWeightedSum / g._volumeSum : 0,
    taux_abandon: g._volumeSum > 0 ? g._abandonWeightedSum / g._volumeSum : 0,
    sla_breach_count: g._slaBreachSum,
    duree_attente_p90: g._p90Max,
    // Nettoyage des champs temporaires
    _volumeSum: undefined, _waitWeightedSum: undefined, 
    _serviceWeightedSum: undefined, _abandonWeightedSum: undefined,
    _slaBreachSum: undefined, _p90Max: undefined
  }));
};
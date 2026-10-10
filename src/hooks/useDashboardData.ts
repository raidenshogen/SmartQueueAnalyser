import { useState, useEffect, useRef, useMemo } from 'react';
import { useI18n } from '../lib/i18n/i18n';
import * as XLSX from 'xlsx';
import { cleanRates, findKPIHistoryArray, cleanSiteNameFrontend, cleanServiceNameFrontend,aggregateHistoryByDay } from '../lib/helpers';

export const useDashboardData = (authMode: string, n8nWebhookUrl: string, comparisonHorizon: string, showToast: (message: string, type?: 'success' | 'error' | 'info') => void) => {
  const { t } = useI18n();
  
  const [kpiHistory, setKPIHistory] = useState<any[]>([]);
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiInsightLoading, setAiInsightLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [allDiscoveredSites, setAllDiscoveredSites] = useState<string[]>([]);
  const [allDiscoveredServices, setAllDiscoveredServices] = useState<string[]>([]);
  
  const [historySite, setHistorySite] = useState('all');
  const [historyService, setHistoryService] = useState('all');
  const [historyPeriod, setHistoryPeriod] = useState('Last Month');
  const [predictionTimePeriod, setPredictionTimePeriod] = useState('Next Month');
  const [predictionSite, setPredictionSite] = useState('all');
  const [predictionService, setPredictionService] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const isFetchingRef = useRef(false);
  const predictionFetchIdRef = useRef(0);
  const historyFetchIdRef = useRef(0);
  const overviewFetchIdRef = useRef(0);

  const fetchDashboardData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    const historyFetchId = ++historyFetchIdRef.current;
    try {
      const allHistory: any[] = [];
      let lastId = 0; let hasMore = true; let pageCount = 0; const MAX_PAGES = 100;
      while (hasMore && pageCount < MAX_PAGES) {
        if (historyFetchId !== historyFetchIdRef.current) return;
        const histRes = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'history', n8nWebhookUrl, payload: { period: 'quarter', lastId } }) });
        if (!histRes.ok) break;
        const hData = await histRes.json();
        const arr = hData.history || hData.data?.history || findKPIHistoryArray(hData);
        if (arr && Array.isArray(arr) && arr.length > 0) { allHistory.push(...arr); pageCount++; }
        hasMore = hData.hasMore === true;
        if (hasMore && typeof hData.nextId === 'number') lastId = hData.nextId;
        if (!arr || arr.length === 0) hasMore = false;
      }
      if (historyFetchId === historyFetchIdRef.current && allHistory.length > 0) {
        const cleaned = cleanRates(allHistory);
        setKPIHistory(cleaned);
        setAllDiscoveredSites(Array.from(new Set(cleaned.map(h => String(h.site || '')))).filter(Boolean).sort() as string[]);
        setAllDiscoveredServices(Array.from(new Set(cleaned.map(h => String(h.service || '')))).filter(Boolean).sort() as string[]);
      }
    } catch (e) { console.error('[FETCH] History failed', e); } 
    finally { if (historyFetchId === historyFetchIdRef.current) { isFetchingRef.current = false; setLoading(false); } }
  };

  const fetchOverviewData = async () => {
    const fetchId = ++overviewFetchIdRef.current;
    try {
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'overview', n8nWebhookUrl, payload: { sync: true } }) });
      if (!res.ok) return;
      const data = await res.json();
      if (fetchId !== overviewFetchIdRef.current) return;
      if (data.success && data.overview) setOverviewData(data.overview);
    } catch (e) { console.error('[OVERVIEW] failed:', e); }
  };

  const loadOverviewFromCache = async () => {
    try {
      const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'overview', payload: { sync: false } }) });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.overview) setOverviewData(data.overview);
    } catch (e) { console.error('[OVERVIEW] cache load failed:', e); }
  };

  const fetchPredictions = async () => {
    const predFetchId = ++predictionFetchIdRef.current;
    const MAX_PAGES = 100;
    try {
      const allPredictions: any[] = [];
      let predLastId = 0; let predHasMore = true; let predPageCount = 0;
      while (predHasMore && predPageCount < MAX_PAGES) {
        if (predFetchId !== predictionFetchIdRef.current) return;
        const predRes = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'prediction', n8nWebhookUrl, payload: { period: comparisonHorizon, lastId: predLastId } }) });
        if (!predRes.ok) break;
        const pData = await predRes.json();
        const pArr = pData.predictions || pData.data?.predictions || findKPIHistoryArray(pData);
        if (pArr && Array.isArray(pArr) && pArr.length > 0) { allPredictions.push(...pArr); predPageCount++; }
        predHasMore = pData.hasMore === true;
        if (predHasMore && typeof pData.nextId === 'number') predLastId = pData.nextId;
        if (!pArr || pArr.length === 0) predHasMore = false;
      }
      if (predFetchId === predictionFetchIdRef.current && allPredictions.length > 0) {
        setPredictionData(cleanRates(allPredictions));
      }
    } catch (e) { console.error('[FETCH] Predictions failed', e); }
  };

  useEffect(() => { if (authMode === 'authenticated') fetchDashboardData(); }, [authMode]);
  useEffect(() => {
    if (authMode === 'authenticated') {
      loadOverviewFromCache().then(() => { setTimeout(() => { if (!overviewData) fetchOverviewData(); }, 500); });
    }
  }, [authMode]);
  useEffect(() => { if (authMode === 'authenticated') fetchPredictions(); }, [authMode, comparisonHorizon]);

  const handleSyncData = async () => {
    setSyncing(true); setHistoryPage(1);
    showToast(t('common.syncing'), "info");
    await fetchDashboardData();
    showToast(t('overview.syncHistory'), "success");
    setSyncing(false);
  };

  useEffect(() => {
    if (authMode !== 'authenticated') return;
    const fetchAIInsight = async () => {
      setAiInsightLoading(true);
      try {
        const response = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: "chat", payload: { question: "In 2 sentences maximum, give the most important alert from the last 7 days of queue data. Be direct, no formatting, no bullet points.", history: [] } }) });
        if (response.ok) {
          const data = await response.json();
          const replyText = data.reply || data.text || (data.data && data.data.reply) || null;
          if (replyText) setAiInsight(replyText);
        }
      } catch (e) { console.error(e); } finally { setAiInsightLoading(false); }
    };
    fetchAIInsight();
  }, [n8nWebhookUrl, authMode]);

  const lastWeekRecords = useMemo(() => {
    if (!kpiHistory || kpiHistory.length === 0) return [];
    const uniqueDays = Array.from(new Set(kpiHistory.map(h => h.jour))).sort((a, b) => b.localeCompare(a)).slice(0, 7);
    return kpiHistory.filter(h => uniqueDays.includes(h.jour));
  }, [kpiHistory]);

  const avgWaitTime = useMemo(() => {
    if (overviewData?.avg_wait != null) return parseFloat(Number(overviewData.avg_wait).toFixed(1));
    if (lastWeekRecords.length === 0) return 3.4;
    const totalVol = lastWeekRecords.reduce((sum, r) => sum + r.volume_tickets, 0) || 1;
    return parseFloat((lastWeekRecords.reduce((sum, r) => sum + r.duree_attente_moy * r.volume_tickets, 0) / totalVol).toFixed(1));
  }, [lastWeekRecords, overviewData]);

  const avgServiceRate = useMemo(() => {
    if (overviewData?.avg_taux_service != null) return parseFloat(Number(overviewData.avg_taux_service).toFixed(1));
    if (lastWeekRecords.length === 0) return 94.8;
    const totalVol = lastWeekRecords.reduce((sum, r) => sum + r.volume_tickets, 0) || 1;
    return parseFloat((lastWeekRecords.reduce((sum, r) => sum + r.taux_service * r.volume_tickets, 0) / totalVol).toFixed(1));
  }, [lastWeekRecords, overviewData]);

  const totalVolumeLastWeek = useMemo(() => {
    if (overviewData?.avg_volume_tickets != null) return Number(overviewData.avg_volume_tickets);
    return lastWeekRecords.reduce((sum, r) => sum + r.volume_tickets, 0) || 1450;
  }, [lastWeekRecords, overviewData]);

  const avgProductivity = useMemo(() => {
    if (overviewData?.avg_productivite != null) return parseFloat(Number(overviewData.avg_productivite).toFixed(1));
    if (lastWeekRecords.length === 0) return 82.0;
    const raw = lastWeekRecords.reduce((sum, r) => sum + (r.productivite_agent || 0), 0) / lastWeekRecords.length;
    const asPct = raw <= 1 ? raw * 100 : raw;
    return parseFloat(asPct.toFixed(1));
  }, [lastWeekRecords, overviewData]);

  const avgAbandonRate = useMemo(() => {
    if (overviewData?.avg_taux_abandon != null) return parseFloat(Number(overviewData.avg_taux_abandon).toFixed(1));
    if (lastWeekRecords.length === 0) return 0;
    const totalVol = lastWeekRecords.reduce((sum, r) => sum + (r.volume_tickets || 0), 0) || 1;
    const weighted = lastWeekRecords.reduce((sum, r) => {
      const raw = r.taux_abandon || 0; const pct = raw <= 1 ? raw * 100 : raw; return sum + pct * (r.volume_tickets || 0);
    }, 0);
    return parseFloat((weighted / totalVol).toFixed(1));
  }, [lastWeekRecords, overviewData]);

  const totalSlaBreaches = useMemo(() => {
    if (overviewData?.total_sla_breaches != null) return Number(overviewData.total_sla_breaches);
    return lastWeekRecords.reduce((sum, r) => sum + (r.sla_breach_count || 0), 0);
  }, [lastWeekRecords, overviewData]);

  const avgOccupancyRate = useMemo(() => {
    if (overviewData?.avg_occupation != null) return parseFloat(Number(overviewData.avg_occupation).toFixed(1));
    if (lastWeekRecords.length === 0) return 0;
    const totalVol = lastWeekRecords.reduce((s, r) => s + (r.volume_tickets || 0), 0) || 1;
    const weighted = lastWeekRecords.reduce((s, r) => {
      const raw = r.occupation_guichets || 0; const pct = raw <= 1 ? raw * 100 : raw; return s + pct * (r.volume_tickets || 0);
    }, 0);
    return parseFloat((weighted / totalVol).toFixed(1));
  }, [lastWeekRecords, overviewData]);

  const siteOccupation = useMemo(() => {
    const records = lastWeekRecords.length > 0 ? lastWeekRecords : kpiHistory;
    const defaultState = { topSites: [{ name: "London Hub", value: 78, color: "#ff682c" }, { name: "Paris Ops", value: 62, color: "#ffdbcf" }, { name: "Berlin Center", value: 45, color: "#816729" }], globalAvg: 65 };
    if (!records || records.length === 0) return defaultState;
    const siteMap = new Map<string, { sum: number; count: number }>();
    records.forEach(r => {
      if (!r.site) return;
      const current = siteMap.get(r.site) || { sum: 0, count: 0 };
      const occValue = r.occupation_guichets || 0; const occPct = occValue <= 1 ? occValue * 100 : occValue;
      siteMap.set(r.site, { sum: current.sum + occPct, count: current.count + 1 });
    });
    const computed = Array.from(siteMap.entries()).map(([rawName, stats]) => ({ name: cleanSiteNameFrontend(rawName), value: Math.round(stats.sum / stats.count) })).sort((a, b) => b.value - a.value).slice(0, 3);
    if (computed.length === 0) return defaultState;
    const colors = ["#ff682c", "#ffdbcf", "#816729"];
    return { topSites: computed.map((s, i) => ({ ...s, color: colors[i % colors.length] })), globalAvg: Math.round(computed.reduce((s, x) => s + x.value, 0) / computed.length) };
  }, [lastWeekRecords, kpiHistory]);

  const dynamicAlerts = useMemo(() => {
    if (lastWeekRecords.length === 0) return [{ id: "1", title: t('overview.alerts.allHealthy'), severity: "low", time: t('overview.alerts.minutesAgo', { count: 10 }) }];
    const alertsList: any[] = [];
    const sorted = [...lastWeekRecords].sort((a, b) => b.jour.localeCompare(a.jour));
    for (const r of sorted) {
      const abandonPct = (r.taux_abandon || 0) <= 1 ? (r.taux_abandon || 0) * 100 : r.taux_abandon || 0;
      const servicePct = (r.taux_service || 0) <= 1 ? (r.taux_service || 0) * 100 : r.taux_service || 0;
      if (r.sla_breach_count > 0) alertsList.push({ id: `sla-${r.id}`, title: t('overview.alerts.slaBreaches', { count: r.sla_breach_count, site: cleanSiteNameFrontend(r.site) }), severity: "high", time: r.jour });
      if (r.duree_attente_moy > 3.2) alertsList.push({ id: `wait-${r.id}`, title: t('overview.alerts.longWaitTime', { time: r.duree_attente_moy.toFixed(1), site: cleanSiteNameFrontend(r.site) }), severity: "high", time: r.jour });
      if (abandonPct > 3) alertsList.push({ id: `ab-${r.id}`, title: t('overview.alerts.highAbandonRate', { rate: abandonPct.toFixed(1), site: cleanSiteNameFrontend(r.site) }), severity: "medium", time: r.jour });
      if (servicePct < 70) alertsList.push({ id: `svc-${r.id}`, title: t('overview.alerts.lowCompliance', { rate: servicePct.toFixed(1), site: cleanSiteNameFrontend(r.site) }), severity: "high", time: r.jour });
      if (alertsList.length >= 4) break;
    }
    return alertsList.length > 0 ? alertsList : [{ id: "ok-1", title: t('overview.alerts.allPerforming'), severity: "low", time: t('overview.alerts.justNow') }];
  }, [lastWeekRecords, t]);

  const dynamicAIInsight = useMemo(() => {
    if (aiInsight) return aiInsight;
    if (overviewData) {
      const breaches = Number(overviewData.total_sla_breaches || 0);
      if (breaches > 10) return t('overview.insights.weeklyCongestion', { count: breaches });
      return t('overview.insights.operationalStable', { wait: avgWaitTime.toFixed(1), service: avgServiceRate.toFixed(1) });
    }
    if (lastWeekRecords.length === 0) return t('overview.insights.waitTimesStable');
    const totalBreaches = lastWeekRecords.reduce((s, r) => s + r.sla_breach_count, 0);
    if (totalBreaches > 10) return t('overview.insights.weeklyCongestion', { count: totalBreaches });
    return t('overview.insights.operationalStable', { wait: avgWaitTime.toFixed(1), service: avgServiceRate.toFixed(1) });
  }, [lastWeekRecords, avgWaitTime, avgServiceRate, aiInsight, overviewData, t]);

  const predictionRecords = useMemo(() => {
    if (predictionData && predictionData.length > 0) return predictionData.map(p => ({ ...p, jour: p.jour || p.date }));
    return [];
  }, [predictionData]);

  const chartData = useMemo(() => {
    const raw = kpiHistory && kpiHistory.length > 0 ? kpiHistory : [];
    if (raw.length === 0) return [];
    const sortedDates = raw.map(r => r.jour).sort((a, b) => b.localeCompare(a));
    const maxDateStr = sortedDates[0];
    const refDate = new Date(maxDateStr + 'T00:00:00');
    let daysBack: number;
    if (historyPeriod === 'Last Week') daysBack = 7;
    else if (historyPeriod === 'Last Month') daysBack = 30;
    else daysBack = 90;
    const cutoff = new Date(refDate); cutoff.setDate(cutoff.getDate() - (daysBack - 1));
    const filtered = raw.filter(r => { const d = new Date(r.jour + 'T00:00:00'); return d >= cutoff && d <= refDate; });
    const grouped: any = {};
    filtered.forEach(r => {
      if (!grouped[r.jour]) grouped[r.jour] = { waitSum: 0, treatSum: 0, count: 0 };
      grouped[r.jour].waitSum += r.duree_attente_moy; grouped[r.jour].treatSum += r.duree_traitement_moy; grouped[r.jour].count += 1;
    });
    return Object.keys(grouped).sort().map(d => ({
      jour: d, label: new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      "Wait Time": parseFloat((grouped[d].waitSum / grouped[d].count).toFixed(1)),
      "Treatment Time": parseFloat((grouped[d].treatSum / grouped[d].count).toFixed(1))
    }));
  }, [kpiHistory, historyPeriod]);

  // Dans useDashboardData, remplacez le useMemo filteredHistoryList existant par :

const aggregatedHistory = useMemo(() => {
  return aggregateHistoryByDay(kpiHistory);
}, [kpiHistory]);

const filteredHistoryList = useMemo(() => {
  let list = [...aggregatedHistory]; // ← Utilise les données agrégées
  
  if (list.length === 0) return [];
  
  // Filtrage par période
  const sortedDates = list.map(h => h.jour).sort((a, b) => b.localeCompare(a));
  const maxDateStr = sortedDates[0];
  const refDate = new Date(maxDateStr + 'T00:00:00');
  let daysBack: number;
  if (historyPeriod === 'Last Week') daysBack = 7;
  else if (historyPeriod === 'Last Month') daysBack = 30;
  else daysBack = 90;
  const cutoff = new Date(refDate); cutoff.setDate(cutoff.getDate() - (daysBack - 1));
  list = list.filter(h => { const d = new Date(h.jour + 'T00:00:00'); return d >= cutoff && d <= refDate; });
  
  // Filtrage par site/service
  if (historySite !== 'all') list = list.filter(h => h.site === historySite);
  if (historyService !== 'all') list = list.filter(h => h.service === historyService || h.service.includes(historyService));
  
  return list.sort((a, b) => b.jour.localeCompare(a.jour));
}, [aggregatedHistory, historySite, historyService, historyPeriod]);
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * itemsPerPage;
    return filteredHistoryList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistoryList, historyPage, itemsPerPage]);

  const historySitesOpts = useMemo(() => [
    { value: 'all', label: t('history.allSites') },
    ...allDiscoveredSites.map(s => ({ value: s, label: `SITE: ${cleanSiteNameFrontend(s)}` }))
  ], [allDiscoveredSites, t]);

  const historyServicesOpts = useMemo(() => [
    { value: 'all', label: t('history.allServices') },
    ...allDiscoveredServices.map(s => ({ value: s, label: `SERVICE: ${cleanServiceNameFrontend(s)}` }))
  ], [allDiscoveredServices, t]);

  const totalPages = Math.ceil(filteredHistoryList.length / itemsPerPage) || 1;

  const peakHourVolume = useMemo(() => {
    if (lastWeekRecords.length === 0) return 0;
    const dailyPeakTotals: Record<string, number> = {};
    lastWeekRecords.forEach(r => {
      const day = r.jour; if (!day) return;
      const peak = Number(r.volume_heure_pointe) || 0;
      dailyPeakTotals[day] = (dailyPeakTotals[day] || 0) + peak;
    });
    const values = Object.values(dailyPeakTotals);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [lastWeekRecords]);

  const filteredPredictions = useMemo(() => {
    if (!predictionRecords || predictionRecords.length === 0) return [];
    const sortedDates = predictionRecords.map(p => p.jour).filter(Boolean).sort((a, b) => b.localeCompare(a));
    if (sortedDates.length === 0) return predictionRecords;
    const maxDateStr = sortedDates[0]; const refDate = new Date(maxDateStr + 'T00:00:00');
    let daysBack = 30;
    if (predictionTimePeriod === 'Next Week') daysBack = 7;
    else if (predictionTimePeriod === 'Next Month') daysBack = 30;
    else if (predictionTimePeriod === 'Next Quarter') daysBack = 90;
    const cutoff = new Date(refDate); cutoff.setDate(cutoff.getDate() - (daysBack - 1));
    
    let list = predictionRecords.filter(p => { const d = new Date(p.jour + 'T00:00:00'); return d >= cutoff && d <= refDate; });

    if (predictionSite !== 'all') list = list.filter(p => p.site === predictionSite);
    if (predictionService !== 'all') list = list.filter(p => p.service === predictionService || p.service.includes(predictionService));

    return list;
  }, [predictionRecords, predictionTimePeriod, predictionSite, predictionService]);

  const predictionsPage = useMemo(() => {
    const startIndex = (historyPage - 1) * itemsPerPage;
    return filteredPredictions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPredictions, historyPage, itemsPerPage]);

  const predictionsTotalPages = Math.ceil(filteredPredictions.length / itemsPerPage) || 1;

  const predictionChartData = useMemo(() => {
    if (filteredPredictions.length === 0) return [];
    const grouped: any = {};
    filteredPredictions.forEach(p => {
      if (!grouped[p.jour]) grouped[p.jour] = { waitSum: 0, treatSum: 0, volumeSum: 0, count: 0 };
      grouped[p.jour].waitSum += p.duree_attente_moy || 0; grouped[p.jour].treatSum += p.duree_traitement_moy || 0;
      grouped[p.jour].volumeSum += p.volume_tickets || 0; grouped[p.jour].count += 1;
    });
    return Object.keys(grouped).sort().map(d => ({
      jour: d, label: new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      "Wait Time": parseFloat((grouped[d].waitSum / grouped[d].count).toFixed(1)),
      "Treatment Time": parseFloat((grouped[d].treatSum / grouped[d].count).toFixed(1)),
      "Volume": grouped[d].volumeSum
    }));
  }, [filteredPredictions]);

  const exportHistoryToXLSX = () => {
    if (!filteredHistoryList || filteredHistoryList.length === 0) { alert(t('common.noData')); return; }
    const rows = filteredHistoryList.map((row: any) => {
      const abandonPct = (row.taux_abandon || 0) <= 1 ? (row.taux_abandon || 0) * 100 : (row.taux_abandon || 0);
      const servicePct = (row.taux_service || 0) <= 1 ? (row.taux_service || 0) * 100 : (row.taux_service || 0);
      return {
        [t('history.table.date')]: row.jour, [t('history.table.site')]: cleanSiteNameFrontend(row.site),
        [t('history.table.service')]: cleanServiceNameFrontend(row.service), [t('history.table.volume')]: row.volume_tickets || 0,
        'Wait Avg (min)': Number((row.duree_attente_moy || 0).toFixed(2)), 'Wait P90 (min)': Number((row.duree_attente_p90 || 0).toFixed(2)),
        'Active Counters': row.nb_guichets_actifs || 0, [t('history.table.serviceRate')]: Number(servicePct.toFixed(2)),
        'Abandon Rate (%)': Number(abandonPct.toFixed(2)), 'SLA Breaches': row.sla_breach_count || 0,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
    const dateRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = dateRange.s.r + 1; row <= dateRange.e.r; row++) { const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 }); if (ws[cellRef]) ws[cellRef].t = 's'; }
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, t('history.title'));
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    XLSX.writeFile(wb, `kpi-history-${historyPeriod.replace(/\s/g, '-')}-${timestamp}.xlsx`);
  };

  return {
    kpiHistory, predictionData, aiInsight, aiInsightLoading, loading, syncing, overviewData,
    allDiscoveredSites, allDiscoveredServices, historySite, setHistorySite, historyService, 
    setHistoryService, historyPeriod, setHistoryPeriod, predictionTimePeriod, setPredictionTimePeriod,
    predictionSite, setPredictionSite, predictionService, setPredictionService,
    historyPage, setHistoryPage, itemsPerPage, setItemsPerPage,
    lastWeekRecords, avgWaitTime, avgServiceRate, totalVolumeLastWeek, avgProductivity, 
    avgAbandonRate, totalSlaBreaches, avgOccupancyRate, siteOccupation, dynamicAlerts, dynamicAIInsight,
    chartData, filteredHistoryList, paginatedHistory, historySitesOpts, historyServicesOpts, totalPages,
    peakHourVolume, filteredPredictions, predictionsPage, predictionsTotalPages, predictionChartData,
    handleSyncData, exportHistoryToXLSX
  };
};

import React from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { cleanSiteNameFrontend, cleanServiceNameFrontend } from '../lib/helpers';

interface HistoryPageProps {
  darkMode: boolean;
  dashboard: any;
  t: any;
  dm: (light: string, dark: string) => string;
}

export default function HistoryPage({ darkMode, dashboard, t, dm }: HistoryPageProps) {
  return (
    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className={`p-8 rounded-lg border space-y-4 ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
        <div className="flex justify-between">
          <div>
            <h2 className={`font-display font-semibold text-lg ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{t('overview.charts.waitTimeDistribution')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('overview.lastUpdate', { time: dashboard.historyPeriod === 'Last Week' ? t('history.week') : dashboard.historyPeriod === 'Last Quarter' ? t('history.quarter') : t('history.month') })}
            </p>
          </div>
        </div>
        <div className="h-64 w-full relative pt-4 text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboard.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="treatGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff682c" stopOpacity={0.2} /><stop offset="95%" stopColor="#ff682c" stopOpacity={0} /></linearGradient>
                <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#828282" stopOpacity={0.1} /><stop offset="95%" stopColor="#828282" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dm('#f0eceb', '#2a2a2a')} />
              <XAxis dataKey="label" stroke="#a1a1a1" fontSize={10} tickLine={false} />
              <YAxis stroke="#a1a1a1" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: dm('#fff', '#1a1a1a'), borderRadius: '8px', border: dm('1px solid #e8e8e8', '1px solid #2a2a2a'), color: dm('#202020', '#e5e5e5') }} />
              <Area type="monotone" dataKey="Treatment Time" stroke="#ff682c" strokeWidth={2.5} fillOpacity={1} fill="url(#treatGrad)" />
              <Area type="monotone" dataKey="Wait Time" stroke="#828282" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#waitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`rounded-lg border overflow-hidden ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b uppercase font-bold text-[10px] text-slate-500 tracking-wider ${dm('bg-[#f7f3f2] border-[#e8e8e8]', 'bg-[#222] border-[#2a2a2a]')}`}>
              <tr>
                <th className="px-6 py-4">{t('history.table.date')}</th>
                <th className="px-6 py-4">{t('history.table.site')}</th>
                <th className="px-6 py-4">{t('history.table.service')}</th>
                <th className="px-6 py-4 text-right">{t('history.table.volume')}</th>
                <th className="px-6 py-4 text-right">{t('history.table.waitTime')}</th>
                <th className="px-6 py-4 text-right">{t('common.waitP90')}</th>
                <th className="px-6 py-4 text-center">{t('history.table.serviceRate')}</th>
                <th className="px-6 py-4 text-right">{t('history.table.satisfaction')}</th>
                <th className="px-6 py-4 text-right">{t('common.slaBreaches')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm('divide-[#e8e8e8]', 'divide-[#2a2a2a]')}`}>
              {dashboard.paginatedHistory.map((item: any) => {
                const abandonPct = (item.taux_abandon || 0) <= 1 ? (item.taux_abandon || 0) * 100 : (item.taux_abandon || 0);
                const abandonDisplay = item.taux_abandon != null ? `${abandonPct.toFixed(1)}%` : '—';
                const isHighAbandon = abandonPct > 3;
                return (
                  <tr key={item.id || Math.random()} className={dm('hover:bg-slate-50/50', 'hover:bg-[#222]')}>
                    <td className={`px-6 py-4 font-semibold ${dm('', 'text-[#e5e5e5]')}`}>{item.jour}</td>
                    <td className="px-6 py-4 text-slate-500">{cleanSiteNameFrontend(item.site)}</td>
                    <td className="px-6 py-4 text-slate-500">{cleanServiceNameFrontend(item.service)}</td>
                    <td className={`px-6 py-4 text-right font-mono ${dm('', 'text-slate-300')}`}>{item.volume_tickets}</td>
                    <td className={`px-6 py-4 text-right font-mono ${dm('', 'text-slate-300')}`}>{item.duree_attente_moy?.toFixed(1)} mins</td>
                    <td className={`px-6 py-4 text-right font-mono ${dm('', 'text-slate-300')}`}>{item.duree_attente_p90?.toFixed(1) ?? '—'} mins</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${(item.taux_service || 0) >= 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-[#ff682c]'}`}>{item.taux_service?.toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      <span className={`font-bold text-[10px] ${isHighAbandon ? 'text-rose-600' : 'text-slate-500'}`}>{abandonDisplay}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      <span className={item.sla_breach_count > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>{item.sla_breach_count || 0}</span>
                    </td>
                  </tr>
                );
              })}
              {dashboard.paginatedHistory.length === 0 && (
                <tr><td colSpan={10} className="px-6 py-10 text-center text-slate-400">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={`p-4 border-t flex items-center justify-between gap-2 text-xs text-slate-500 ${dm('bg-[#fbfbfb] border-[#e8e8e8]', 'bg-[#161616] border-[#2a2a2a]')}`}>
          <div className="flex items-center gap-2">
            <select value={dashboard.itemsPerPage} onChange={(e) => { dashboard.setItemsPerPage(Number(e.target.value)); dashboard.setHistoryPage(1); }}
              className={`border rounded px-2 py-1 text-xs font-medium hover:bg-slate-50 focus:outline-none cursor-pointer ${dm('bg-white border-slate-200 text-slate-700', 'bg-[#222] border-[#333] text-slate-300')}`}>
              <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
            </select>
            <span className="text-slate-500">{t('common.itemsPerPage')}</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={dashboard.historyPage} onChange={(e) => dashboard.setHistoryPage(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-[#202020] hover:bg-slate-50 focus:outline-none cursor-pointer">
              {Array.from({ length: dashboard.totalPages }, (_, i) => i + 1).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="text-slate-500">{t('common.ofPages', { pages: dashboard.totalPages.toLocaleString() })}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => dashboard.setHistoryPage((p: number) => Math.max(1, p - 1))} disabled={dashboard.historyPage === 1}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center">
              <ChevronRight className="w-3 h-3 text-slate-500 rotate-180" />
            </button>
            <button onClick={() => dashboard.setHistoryPage((p: number) => Math.min(dashboard.totalPages, p + 1))} disabled={dashboard.historyPage === dashboard.totalPages}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center">
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
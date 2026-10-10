import React from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, Sparkles } from 'lucide-react';

interface OverviewPageProps {
  darkMode: boolean;
  dashboard: any;
  t: any;
  dm: (light: string, dark: string) => string;
}

export default function OverviewPage({ darkMode, dashboard, t, dm }: OverviewPageProps) {
  return (
    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.totalVisitors')}</span>
            <span className="text-xs font-semibold text-[#ff682c] flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> {t('history.week')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.totalVolumeLastWeek.toLocaleString()}</span>
            <span className="text-[11px] text-[#828282]">{t('overview.total')}</span>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.avgWaitTime')}</span>
            <span className="text-xs font-semibold text-emerald-500">{t('overview.target')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.avgWaitTime.toFixed(1)} {t('overview.mins')}</span>
            <span className="text-[11px] text-[#828282]">{t('overview.avg')}</span>
          </div>
          <div className="h-6 mt-4 opacity-75">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,5 Q20,15 40,8 T80,18 T100,2" fill="none" stroke="rgb(16,185,129)" strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.productivity')}</span>
            <span className="text-xs font-semibold text-emerald-500">{t('overview.optimal')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.avgProductivity.toFixed(1)} {t('overview.callsH')}</span>
            <span className="text-[11px] text-[#828282]">{t('overview.avg')}</span>
          </div>
          <div className="h-6 mt-4 opacity-75">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,18 Q30,15 60,8 T100,4" fill="none" stroke="rgb(16,185,129)" strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.serviceRate')}</span>
            <span className="text-xs font-semibold text-[#ff682c]">{t('overview.volumeTarget')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.avgServiceRate.toFixed(1)}%</span>
            <span className="text-[11px] text-[#828282]">{t('overview.avg')}</span>
          </div>
          <div className="h-6 mt-4 opacity-75">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,15 Q25,5 50,15 T100,18" fill="none" stroke="#ff682c" strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.abandonRate')}</span>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${dashboard.avgAbandonRate > 3 ? 'text-rose-500' : 'text-emerald-500'}`}>{dashboard.avgAbandonRate > 3 ? t('overview.high') : t('overview.healthy')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.avgAbandonRate.toFixed(1)}%</span>
            <span className="text-[11px] text-[#828282]">{t('overview.avg')}</span>
          </div>
          <div className="h-6 mt-4 opacity-75">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none"><path d={`M0,${20 - dashboard.avgAbandonRate * 2} Q20,${20 - dashboard.avgAbandonRate * 3} 40,${20 - dashboard.avgAbandonRate * 1.5} T100,${20 - dashboard.avgAbandonRate * 2.5}`} fill="none" stroke={dashboard.avgAbandonRate > 3 ? 'rgb(244,63,94)' : 'rgb(16,185,129)'} strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.slaBreaches')}</span>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${dashboard.totalSlaBreaches > 10 ? 'text-rose-500' : 'text-emerald-500'}`}>{dashboard.totalSlaBreaches > 10 ? t('overview.critical') : t('overview.stable')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.totalSlaBreaches.toLocaleString()}</span>
            <span className="text-[11px] text-[#828282]">{t('overview.last7d')}</span>
          </div>
          <div className="h-6 mt-4 opacity-75">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,18 L20,15 L40,17 L60,10 L80,12 L100,5" fill="none" stroke={dashboard.totalSlaBreaches > 10 ? '#ff682c' : 'rgb(16,185,129)'} strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.peakHourVolume')}</span>
            <span className="text-xs font-semibold text-[#ff682c] flex items-center gap-0.5"><Activity className="w-3 h-3" /> {t('overview.highestDay')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.peakHourVolume.toLocaleString()}</span>
            <span className="text-[11px] text-[#828282]">{t('overview.tickets')}</span>
          </div>
          <div className="h-6 mt-4 opacity-75">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,15 L15,12 L30,16 L45,8 L60,10 L75,4 L90,6 L100,2" fill="none" stroke="#ff682c" strokeWidth="1.5" /></svg>
          </div>
        </div>

        <div className={`p-5 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div className="flex justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('overview.occupancyRate')}</span>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${dashboard.avgOccupancyRate > 85 ? 'text-rose-500' : dashboard.avgOccupancyRate > 60 ? 'text-[#ff682c]' : 'text-emerald-500'}`}>{dashboard.avgOccupancyRate > 85 ? t('overview.overloaded') : dashboard.avgOccupancyRate > 60 ? t('overview.busy') : t('overview.slack')}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-display font-medium ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.avgOccupancyRate.toFixed(1)}%</span>
            <span className="text-[11px] text-[#828282]">{t('overview.avg')}</span>
          </div>
          <div className="h-6 mt-4 opacity-75">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none"><path d={`M0,${20 - dashboard.avgOccupancyRate / 6} Q25,${20 - dashboard.avgOccupancyRate / 5} 50,${20 - dashboard.avgOccupancyRate / 4} T100,${20 - dashboard.avgOccupancyRate / 5}`} fill="none" stroke="#ff682c" strokeWidth="1.5" /></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-8 rounded-lg border lg:col-span-2 space-y-6 ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
          <div>
            <h2 className={`font-display font-semibold text-lg ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{t('overview.charts.servicePerformance')}</h2>
            <p className="text-xs text-slate-400 mt-1">{t('overview.lastUpdate', { time: t('history.week') })}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            <div className="space-y-5">
              {dashboard.siteOccupation.topSites.map((site: any) => (
                <div key={site.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className={dm('text-[#202020]', 'text-[#e5e5e5]')}>{site.name}</span>
                    <span className="text-slate-400">{site.value}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${dm('bg-slate-100', 'bg-[#2a2a2a]')}`}>
                    <div className="h-full rounded-full" style={{ width: `${site.value}%`, backgroundColor: site.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="70" stroke={dm('#f1edec', '#2a2a2a')} strokeWidth="15" fill="transparent" />
                  <circle cx="88" cy="88" r="70" stroke="#ff682c" strokeWidth="15" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * dashboard.siteOccupation.globalAvg) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`font-display font-bold text-3xl ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{dashboard.siteOccupation.globalAvg}%</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{t('overview.globalAvg')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-lg border ${dm('bg-white border-[#e8e8e8]', 'bg-[#1a1a1a] border-[#2a2a2a]')}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-4">{t('overview.recentAlerts')}</span>
            <div className="space-y-4">
              {dashboard.dynamicAlerts.map((al: any) => (
                <div key={al.id} className="flex gap-3 justify-start items-start">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${al.severity === 'high' ? 'bg-[#ff682c]' : 'bg-slate-400'}`} />
                  <div>
                    <h4 className={`text-xs font-semibold leading-tight ${dm('text-[#202020]', 'text-[#e5e5e5]')}`}>{al.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{al.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#202020] text-white p-6 rounded-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-[#ff682c] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase">{t('overview.aiChat')}</span>
            </div>
            <p className="text-xs font-light text-slate-300 leading-relaxed">{dashboard.dynamicAIInsight}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
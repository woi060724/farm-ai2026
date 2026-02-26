import { useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AuthContext } from '../App.jsx'

const COLORS = ['#4caf50', '#66bb6a', '#ff8f00', '#7e57c2']

const StatCard = ({ icon, label, value, sub, color = '#4caf50' }) => (
  <div className="glass stat-card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="text-2xl">{icon}</div>
      <div className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>●  live</div>
    </div>
    <div className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Unbounded, sans-serif' }}>{value}</div>
    <div className="text-sm text-green-300/70">{label}</div>
    {sub && <div className="text-xs mt-1" style={{ color: `${color}99` }}>{sub}</div>}
  </div>
)

export default function Dashboard() {
  const { token } = useContext(AuthContext)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/livestock/stats', { headers: { Authorization: `Bearer ${token}` } })
      return res.data
    },
    refetchInterval: 30000,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const s = stats || { total_livestock: 0, sick_count: 0, monitoring_count: 0, counted_today: 0, farms_count: 0, weekly_counts: [], species_breakdown: [] }

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(165,214,167,0.6)' }}>
            Нақты уақыт мониторингі • {new Date().toLocaleDateString('kk-KZ')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)', color: '#81c784' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 pulse-live" /> Онлайн
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🐄" label="Жалпы мал саны"   value={s.total_livestock.toLocaleString()} sub="Барлық фермалар" color="#4caf50" />
        <StatCard icon="❤️" label="Ауру / бақылауда" value={`${s.sick_count} / ${s.monitoring_count}`} sub="Ескерту қажет" color="#d32f2f" />
        <StatCard icon="🤖" label="Бүгін санады"     value={s.counted_today}  sub="ЖИ дәлдік 94.7%" color="#7e57c2" />
        <StatCard icon="🏡" label="Фермалар саны"    value={s.farms_count}    sub="Белсенді" color="#ff8f00" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="glass p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
            Апталық мал санының динамикасы
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={s.weekly_counts}>
              <XAxis dataKey="date" tick={{ fill: '#81c784', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#81c784', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#142016', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 8, fontFamily: 'Onest, sans-serif' }}
                labelStyle={{ color: '#a5d6a7' }}
                itemStyle={{ color: '#4caf50' }}
              />
              <Bar dataKey="count" fill="#2e7d32" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fill: '#66bb6a', fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass p-5">
          <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
            Тұқым бөлінісі
          </h3>
          {s.species_breakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={s.species_breakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {s.species_breakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#142016', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {s.species_breakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span style={{ color: '#a5d6a7' }}>{item.name}</span>
                    </div>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'rgba(165,214,167,0.4)' }}>
              Деректер жоқ
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>
          Жылдам іс-қимылдар
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '➕', label: 'Мал қосу', href: '/livestock', color: '#4caf50' },
            { icon: '📷', label: 'ЖИ Санау', href: '/ai-detect', color: '#7e57c2' },
            { icon: '💊', label: 'Денсаулық', href: '/health', color: '#ff8f00' },
            { icon: '📊', label: 'PDF Есеп', href: '/reports', color: '#ef5350' },
          ].map(({ icon, label, href, color }) => (
            <a key={href} href={href} className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all"
              style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
              onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
              onMouseLeave={e => e.currentTarget.style.background = `${color}15`}>
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium" style={{ fontFamily: 'Onest, sans-serif' }}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

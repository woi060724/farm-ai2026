import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',           icon: '📊', label: 'Dashboard' },
  { to: '/livestock',  icon: '🐄', label: 'Мал тізімі' },
  { to: '/ai-detect',  icon: '🤖', label: 'ЖИ Талдау' },
  { to: '/health',     icon: '❤️', label: 'Денсаулық' },
  { to: '/map',        icon: '🗺️', label: 'Карта' },
  { to: '/reports',    icon: '📋', label: 'Есептер' },
]

export default function Navbar({ user, onLogout }) {
  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{
        background: 'rgba(14, 24, 15, 0.98)',
        borderRight: '1px solid rgba(76,175,80,0.15)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(76,175,80,0.15)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #1b5e20, #388e3c)' }}
          >
            🌿
          </div>
          <div>
            <div className="text-lg font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>
              AgroAI
            </div>
            <div className="text-xs" style={{ color: 'rgba(165,214,167,0.6)' }}>
              Мал есебі жүйесі
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-xs font-semibold mb-3 px-2" style={{ color: 'rgba(165,214,167,0.4)', fontFamily: 'Unbounded, sans-serif', letterSpacing: '0.08em' }}>
          НАВИГАЦИЯ
        </div>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-all ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-green-300/70 hover:text-green-200'
              }`
            }
            style={({ isActive }) => ({
              background: isActive
                ? 'linear-gradient(135deg, rgba(46,125,50,0.5), rgba(56,142,60,0.3))'
                : 'transparent',
              border: isActive ? '1px solid rgba(76,175,80,0.3)' : '1px solid transparent',
            })}
          >
            <span className="text-base">{icon}</span>
            <span style={{ fontFamily: 'Onest, sans-serif' }}>{label}</span>
          </NavLink>
        ))}

        {/* Chatbot highlight */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(76,175,80,0.15)' }}>
          <div className="text-xs font-semibold mb-3 px-2" style={{ color: 'rgba(165,214,167,0.4)', fontFamily: 'Unbounded, sans-serif', letterSpacing: '0.08em' }}>
            ЖИ ҚОЛДАУ
          </div>
          <div
            className="px-3 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(46,125,50,0.15)',
              border: '1px solid rgba(76,175,80,0.25)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>🤖</span>
              <span className="text-green-300 font-medium">ЖИ Кеңесші</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-400 pulse-live" />
            </div>
            <div className="text-xs" style={{ color: 'rgba(165,214,167,0.5)' }}>
              Төменгі оң жақтағы 🤖 батырмасын басыңыз
            </div>
          </div>
        </div>
      </nav>

      {/* User info */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(76,175,80,0.15)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2e7d32, #66bb6a)' }}
          >
            {user?.full_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.full_name}</div>
            <div className="text-xs truncate" style={{ color: 'rgba(165,214,167,0.5)' }}>
              {user?.role}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-xs py-2 rounded-lg transition-all"
          style={{
            background: 'rgba(211,47,47,0.15)',
            border: '1px solid rgba(211,47,47,0.3)',
            color: '#ef9a9a',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(211,47,47,0.3)'}
          onMouseLeave={e => e.target.style.background = 'rgba(211,47,47,0.15)'}
        >
          Шығу / Logout
        </button>
      </div>
    </aside>
  )
}

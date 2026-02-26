import { useState, useContext } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../App.jsx'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const fd = new FormData()
        fd.append('username', form.email)
        fd.append('password', form.password)
        const res = await axios.post('/api/v1/auth/login', fd)
        login(res.data.user, res.data.access_token)
        toast.success('Қош келдіңіз! 🌿')
      } else {
        const res = await axios.post('/api/v1/auth/register', form)
        login(res.data.user, res.data.access_token)
        toast.success('Тіркеу сәтті! 🎉')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Қате орын алды')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface)' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #4caf50, transparent)', top: '-100px', right: '-100px' }} />
        <div className="absolute w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #66bb6a, transparent)', bottom: '-100px', left: '-100px' }} />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, #1b5e20, #388e3c)', boxShadow: '0 8px 32px rgba(76,175,80,0.3)' }}>
            🌿
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Unbounded, sans-serif' }}>AgroAI</h1>
          <p className="text-sm" style={{ color: 'rgba(165,214,167,0.6)' }}>Мал есебі веб-жүйесі</p>
        </div>

        <div className="glass p-6 glow">
          {/* Tabs */}
          <div className="flex rounded-lg p-1 mb-6" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: mode === m ? 'linear-gradient(135deg,#2e7d32,#388e3c)' : 'transparent', color: mode === m ? 'white' : 'rgba(165,214,167,0.6)' }}>
                {m === 'login' ? 'Кіру' : 'Тіркелу'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(165,214,167,0.7)' }}>Толық аты-жөні</label>
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                  required className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest, sans-serif' }}
                  placeholder="Асылбек Медеу" />
              </div>
            )}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(165,214,167,0.7)' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                required className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest, sans-serif' }}
                placeholder="farmer@email.com" />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(165,214,167,0.7)' }}>Пароль</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                required minLength={6} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest, sans-serif' }}
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all mt-2"
              style={{ background: loading ? 'rgba(46,125,50,0.4)' : 'linear-gradient(135deg, #2e7d32, #388e3c)', fontFamily: 'Unbounded, sans-serif', letterSpacing: '0.02em' }}>
              {loading ? 'Жүктелуде...' : mode === 'login' ? 'Кіру →' : 'Тіркелу →'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(255,143,0,0.1)', border: '1px solid rgba(255,143,0,0.3)', color: '#ffb74d' }}>
            <strong>Demo:</strong> demo@agroai.kz / demo1234
          </div>
        </div>
      </div>
    </div>
  )
}

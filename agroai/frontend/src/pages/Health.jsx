// Health Page
import { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../App.jsx'

export default function Health() {
  const { token } = useContext(AuthContext)
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ livestock_id: 1, diagnosis: '', treatment: '', medicine: '', temperature: '', notes: '', record_date: new Date().toISOString().slice(0, 10) })

  const headers = { Authorization: `Bearer ${token}` }

  const createMutation = useMutation({
    mutationFn: (data) => axios.post('/api/v1/health', data, { headers }),
    onSuccess: () => { qc.invalidateQueries(['health']); setShowForm(false); toast.success('Жазба сақталды 💊') },
    onError: (err) => toast.error(err.response?.data?.detail || 'Қате'),
  })

  const alerts = [
    { icon: '⚠️', animal: 'Сиыр #0421', issue: 'Температура 40.2°C', time: '2 сағат бұрын', color: '#d32f2f' },
    { icon: '💉', animal: 'Қой топтасы A', issue: 'Вакцинация жоспарланды', time: 'Ертең', color: '#ff8f00' },
    { icon: '👁️', animal: 'Ешкі #0089', issue: 'Бақылауда (3 күн)', time: 'Бүгін', color: '#7e57c2' },
  ]

  return (
    <div className="space-y-4 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>Денсаулық</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(165,214,167,0.6)' }}>Мал денсаулығы мониторингі мен журналы</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #c62828, #d32f2f)' }}>
          ➕ Жазба қосу
        </button>
      </div>

      {/* Alerts */}
      <div className="glass p-5">
        <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Unbounded, sans-serif' }}>🔔 Белсенді ескертулер</h3>
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${a.color}11`, border: `1px solid ${a.color}33` }}>
              <span className="text-xl">{a.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{a.animal}</div>
                <div className="text-xs" style={{ color: a.color }}>{a.issue}</div>
              </div>
              <div className="text-xs" style={{ color: 'rgba(165,214,167,0.4)' }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Record Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="glass p-6 w-full max-w-md slide-up">
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>Денсаулық жазбасы</h3>
            <div className="space-y-3">
              {[
                { label: 'Мал ID', key: 'livestock_id', type: 'number' },
                { label: 'Диагноз', key: 'diagnosis', type: 'text' },
                { label: 'Дәрі-дәрмек', key: 'medicine', type: 'text' },
                { label: 'Температура (°C)', key: 'temperature', type: 'number' },
                { label: 'Күні', key: 'record_date', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(165,214,167,0.7)' }}>{label}</label>
                  <input type={type} value={formData[key]} onChange={e => setFormData(f => ({...f, [key]: e.target.value}))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest' }} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#a5d6a7' }}>Болдырмау</button>
              <button onClick={() => createMutation.mutate(formData)} className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #c62828, #d32f2f)' }}>Сақтау</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

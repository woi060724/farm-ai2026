// ====================================================
// Livestock Page
// ====================================================
import { useState, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../App.jsx'

const STATUS_COLORS = {
  healthy: 'status-healthy',
  sick: 'status-sick',
  monitoring: 'status-monitoring',
  quarantine: 'status-quarantine',
}

const STATUS_LABELS = {
  healthy: 'Сау', sick: 'Ауру', monitoring: 'Бақылауда', quarantine: 'Карантин',
}

export default function Livestock() {
  const { token } = useContext(AuthContext)
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState({ species: '', health_status: '' })
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ tag_number: '', species: 'cattle', breed: '', sex: 'F', weight_kg: '', farm_id: 1, health_status: 'healthy' })

  const headers = { Authorization: `Bearer ${token}` }

  const { data, isLoading } = useQuery({
    queryKey: ['livestock', page, search, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page, size: 20, ...(search && { search }), ...(filter.species && { species: filter.species }), ...(filter.health_status && { health_status: filter.health_status }) })
      const res = await axios.get(`/api/v1/livestock?${params}`, { headers })
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data) => axios.post('/api/v1/livestock', data, { headers }),
    onSuccess: () => { qc.invalidateQueries(['livestock']); setShowForm(false); toast.success('Мал тіркелді! 🐄') },
    onError: (err) => toast.error(err.response?.data?.detail || 'Қате'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/v1/livestock/${id}`, { headers }),
    onSuccess: () => { qc.invalidateQueries(['livestock']); toast.success('Жойылды') },
  })

  return (
    <div className="space-y-4 slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>Мал Тізімі</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #2e7d32, #388e3c)' }}>
          ➕ Жаңа мал
        </button>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Іздеу (тег, тұқым...)"
          className="flex-1 min-w-48 px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest' }} />
        <select value={filter.species} onChange={e => setFilter(f => ({...f, species: e.target.value}))}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest' }}>
          <option value="">Барлық тұқым</option>
          <option value="cattle">Сиыр</option>
          <option value="sheep">Қой</option>
          <option value="goat">Ешкі</option>
          <option value="horse">Жылқы</option>
        </select>
        <select value={filter.health_status} onChange={e => setFilter(f => ({...f, health_status: e.target.value}))}
          className="px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest' }}>
          <option value="">Барлық мәртебе</option>
          <option value="healthy">Сау</option>
          <option value="sick">Ауру</option>
          <option value="monitoring">Бақылауда</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                {['Тег №', 'Тұқым', 'Жынысы', 'Салмақ', 'Денсаулық', 'Тіркелген', 'Іс'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map(animal => (
                <tr key={animal.id}>
                  <td><span className="font-mono text-green-400">{animal.tag_number || `#${animal.id}`}</span></td>
                  <td><div className="font-medium text-white">{animal.species}</div><div className="text-xs text-green-300/50">{animal.breed}</div></td>
                  <td>{animal.sex === 'F' ? '♀️' : animal.sex === 'M' ? '♂️' : '—'}</td>
                  <td>{animal.weight_kg ? `${animal.weight_kg} кг` : '—'}</td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[animal.health_status] || ''}`}>{STATUS_LABELS[animal.health_status] || animal.health_status}</span></td>
                  <td className="text-green-300/50 text-xs">{animal.created_at?.slice(0, 10)}</td>
                  <td>
                    <button onClick={() => deleteMutation.mutate(animal.id)} className="text-red-400/60 hover:text-red-400 text-xs px-2 py-1 rounded">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(76,175,80,0.15)' }}>
            <span className="text-xs" style={{ color: 'rgba(165,214,167,0.5)' }}>Жалпы: {data.total} жануар</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30"
                style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)', color: '#81c784' }}>← Алдыңғы</button>
              <button disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30"
                style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)', color: '#81c784' }}>Келесі →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="glass p-6 w-full max-w-md slide-up">
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Unbounded, sans-serif' }}>Жаңа мал тіркеу</h3>
            <div className="space-y-3">
              {[
                { label: 'Тег нөмірі', key: 'tag_number', type: 'text', placeholder: 'UA-00421' },
                { label: 'Тұқым', key: 'breed', type: 'text', placeholder: 'Голштин' },
                { label: 'Салмақ (кг)', key: 'weight_kg', type: 'number', placeholder: '450' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(165,214,167,0.7)' }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={formData[key]} onChange={e => setFormData(f => ({...f, [key]: e.target.value}))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(165,214,167,0.7)' }}>Түрі</label>
                <select value={formData.species} onChange={e => setFormData(f => ({...f, species: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(28,46,30,0.8)', border: '1px solid rgba(76,175,80,0.3)', color: '#e8f5e9', fontFamily: 'Onest' }}>
                  <option value="cattle">Сиыр</option>
                  <option value="sheep">Қой</option>
                  <option value="goat">Ешкі</option>
                  <option value="horse">Жылқы</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', color: '#a5d6a7' }}>Болдырмау</button>
              <button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending} className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #2e7d32, #388e3c)' }}>
                {createMutation.isPending ? 'Сақталуда...' : 'Сақтау'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

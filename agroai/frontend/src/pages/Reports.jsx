import { useContext } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../App.jsx'

export default function Reports() {
  const { token } = useContext(AuthContext)
  const headers = { Authorization: `Bearer ${token}` }

  const downloadPDF = async () => {
    try {
      const res = await axios.get('/api/v1/reports/pdf?farm_id=1&period=monthly', {
        headers, responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `agroai_report_${new Date().toISOString().slice(0,10)}.pdf`
      a.click()
      toast.success('PDF жүктелді!')
    } catch { toast.error('PDF жасау қатесі') }
  }

  const downloadExcel = async () => {
    try {
      const res = await axios.get('/api/v1/reports/excel?farm_id=1', {
        headers, responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `agroai_livestock_${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      toast.success('Excel жүктелді!')
    } catch { toast.error('Excel жасау қатесі') }
  }

  const reportCards = [
    { title: 'Ай есебі (PDF)', desc: 'Барлық мал деректері, денсаулық статистикасы, ЖИ санау тарихы', icon: '📄', color: '#ef5350', action: downloadPDF, label: 'PDF жүктеу' },
    { title: 'Мал тізімі (Excel)', desc: 'Барлық малдар, тег нөмірлері, салмақ, денсаулық мәртебесі', icon: '📊', color: '#4caf50', action: downloadExcel, label: 'Excel жүктеу' },
    { title: 'Ветеринарлық есеп', desc: 'Диагноздар, вакцинациялар, дәрі-дәрмек тарихы', icon: '💊', color: '#7e57c2', action: () => toast('Жақын арада...'), label: 'Жасау' },
    { title: 'Мемлекеттік форма', desc: 'ҚР ауылшаруашылық министрлігі форматындағы есеп', icon: '🏛️', color: '#ff8f00', action: () => toast('Жақын арада...'), label: 'Жасау' },
  ]

  return (
    <div className="space-y-4 slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>Есептілік</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(165,214,167,0.6)' }}>PDF және Excel форматта автоматты есептер</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map(({ title, desc, icon, color, action, label }) => (
          <div key={title} className="glass stat-card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${color}22` }}>
                {icon}
              </div>
              <div>
                <div className="font-semibold text-white">{title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(165,214,167,0.5)' }}>{desc}</div>
              </div>
            </div>
            <button onClick={action} className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color})`, fontFamily: 'Unbounded, sans-serif', fontSize: '12px' }}>
              ⬇ {label}
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="glass p-4 text-sm" style={{ color: 'rgba(165,214,167,0.6)' }}>
        <span className="text-yellow-400 mr-2">💡</span>
        Есептерде барлық тіркелген малдар, ЖИ санау тарихы және денсаулық журналдары қамтылады.
        Автоматты email жіберуді <strong className="text-white">Баптаулар</strong> бөлімінен орнатыңыз.
      </div>
    </div>
  )
}

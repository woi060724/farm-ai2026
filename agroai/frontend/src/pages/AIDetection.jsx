import { useState, useContext, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthContext } from '../App.jsx'

export default function AIDetection() {
  const { token } = useContext(AuthContext)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((files) => {
    const f = files[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png'] }, maxFiles: 1,
  })

  const detect = async () => {
    if (!file) return toast.error('Алдымен сурет жүктеңіз')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post('/api/v1/ai/detect?farm_id=1', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      toast.success(`Табылды: ${res.data.total_count} жануар 🎉`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'ЖИ талдау қатесі')
    } finally {
      setLoading(false)
    }
  }

  const ResultBar = ({ label, value, max, color }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span style={{ color: '#a5d6a7' }}>{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / Math.max(max, 1)) * 100}%`, background: color }} />
      </div>
    </div>
  )

  return (
    <div className="space-y-4 slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>ЖИ Талдау</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(165,214,167,0.6)' }}>YOLOv8 нейрондық желісімен автоматты мал санау</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload zone */}
        <div className="glass p-5">
          <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Unbounded, sans-serif' }}>Сурет жүктеу</h3>
          <div
            {...getRootProps()}
            className="rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden"
            style={{
              borderColor: isDragActive ? '#4caf50' : 'rgba(76,175,80,0.3)',
              background: isDragActive ? 'rgba(76,175,80,0.1)' : 'rgba(28,46,30,0.4)',
              minHeight: '240px',
            }}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative">
                <img src={preview} alt="preview" className="w-full h-60 object-cover" />
                <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  Өзгерту үшін басыңыз
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 gap-3">
                <div className="text-5xl">📷</div>
                <div className="text-center">
                  <div className="text-sm text-white font-medium">Суретті осы жерге сүйреңіз</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(165,214,167,0.5)' }}>немесе басып таңдаңыз (JPEG, PNG)</div>
                </div>
              </div>
            )}
          </div>

          <button onClick={detect} disabled={!file || loading}
            className="w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: file && !loading ? 'linear-gradient(135deg, #7b1fa2, #9c27b0)' : 'rgba(156,39,176,0.2)',
              cursor: file && !loading ? 'pointer' : 'not-allowed',
              fontFamily: 'Unbounded, sans-serif',
            }}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Талдауда...</>
            ) : '🤖 ЖИ Талдауды Бастау'}
          </button>

          {/* Model info */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[['YOLOv8n', '#7b1fa2'], ['mAP@50: 94.7%', '#2e7d32'], ['24ms/сурет', '#ff8f00']].map(([label, color]) => (
              <span key={label} className="text-xs px-2 py-1 rounded-full" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="glass p-5">
          <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Unbounded, sans-serif' }}>Нәтиже</h3>
          {result ? (
            <div className="space-y-4">
              {/* Total */}
              <div className="text-center p-5 rounded-xl" style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.2)' }}>
                <div className="text-5xl font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>{result.total_count}</div>
                <div className="text-sm mt-1" style={{ color: '#81c784' }}>жалпы жануар табылды</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(165,214,167,0.5)' }}>
                  Сенімділік: {(result.confidence_avg * 100).toFixed(1)}% • {result.processing_ms}мс
                </div>
              </div>

              <div className="space-y-3">
                <ResultBar label="🐄 Сиырлар" value={result.cattle_count} max={result.total_count} color="#4caf50" />
                <ResultBar label="🐑 Қойлар" value={result.sheep_count} max={result.total_count} color="#66bb6a" />
                <ResultBar label="🐐 Ешкілер" value={result.goat_count} max={result.total_count} color="#ff8f00" />
                <ResultBar label="🔮 Басқалар" value={result.other_count} max={result.total_count} color="#7e57c2" />
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 text-xs rounded-lg" style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', color: '#81c784' }}>
                  ✅ Растау
                </button>
                <button onClick={() => { setResult(null); setFile(null); setPreview(null) }}
                  className="flex-1 py-2 text-xs rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#a5d6a7' }}>
                  🔄 Жаңадан
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
              <div className="text-5xl opacity-30">🤖</div>
              <div className="text-sm" style={{ color: 'rgba(165,214,167,0.4)' }}>
                Сурет жүктеп, «ЖИ Талдауды Бастау» батырмасын басыңыз
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

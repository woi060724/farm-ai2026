/**
 * AgroAI — ЖИ Чат-боты компоненті
 * ====================================
 * Claude API негізіндегі 24/7 техникалық қолдау
 * Қазақ / Орыс / Ағылшын тілдерін автоматты анықтайды
 */
import { useState, useRef, useEffect, useContext } from 'react'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { AuthContext } from '../App.jsx'

// Suggested quick questions in Kazakh
const QUICK_QUESTIONS = [
  { text: "Мал санауды қалай бастаймын?", icon: "🐄" },
  { text: "Сиырдың температурасы жоғары — не істеу керек?", icon: "🌡️" },
  { text: "ЖИ санау дәлдігін арттыру жолдары", icon: "🤖" },
  { text: "Есеп жасау жолы қандай?", icon: "📋" },
  { text: "Вакцинация кестесін қалай баптаймын?", icon: "💉" },
]

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `Сәлеметсіздер! 🌿 Мен **AgroAI** жүйесінің ЖИ кеңесшісімін.

Мен сізге мынаны көмектесемін:
• 🐄 Мал денсаулығы және ауру белгілері
• 💻 Жүйені пайдалану нұсқаулары  
• 📊 Деректер мен аналитиканы оқу
• 🌿 Жылыжай шаруашылығы кеңестері

Сұрағыңызды қазақша, орысша немесе ағылшынша жазыңыз — автоматты анықтаймын! 👇`,
  timestamp: new Date(),
}

function formatContent(text) {
  // Convert markdown-like formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
    .replace(/• /g, '&bull; ')
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-xs flex-shrink-0">🤖</div>
      <div className="chat-bubble-bot px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="typing-dot w-2 h-2 rounded-full bg-green-400"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatBot() {
  const { token } = useContext(AuthContext)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => uuidv4())
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || isLoading) return

    const userMsg = { role: 'user', content: trimmed, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await axios.post(
        '/api/v1/chat',
        { message: trimmed, session_id: sessionId, language: 'auto' },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )

      const botMsg = {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date(),
        tokens: res.data.tokens_used,
      }
      setMessages(prev => [...prev, botMsg])

      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
    } catch (err) {
      const errMsg = err.response?.status === 503
        ? '⚠️ Chatbot сервисі қосылмаған. ANTHROPIC_API_KEY баптауын тексеріңіз.'
        : err.response?.status === 429
        ? '⏳ Тым көп сұраныс. Бірнеше секунд күтіңіз.'
        : '❌ Қате орын алды. Қайтадан көріңіз.'

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errMsg,
        timestamp: new Date(),
        isError: true,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE])
    axios.delete(`/api/v1/chat/history/${sessionId}`).catch(() => {})
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 slide-up"
          style={{
            width: '380px',
            height: isMinimized ? '56px' : '560px',
            transition: 'height 0.3s ease',
          }}
        >
          <div
            className="glass glow flex flex-col h-full overflow-hidden"
            style={{ borderRadius: '20px', border: '1px solid rgba(76,175,80,0.4)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
                borderRadius: isMinimized ? '20px' : '20px 20px 0 0',
              }}
              onClick={() => setIsMinimized(m => !m)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  🤖
                </div>
                <div>
                  <div className="font-bold text-white text-sm" style={{ fontFamily: 'Unbounded, sans-serif' }}>
                    AgroAI Кеңесші
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-live" />
                    Онлайн • Claude API
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); clearChat() }}
                  className="text-green-200 hover:text-white text-xs px-2 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  title="Тарихты тазалау"
                >
                  ↺
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
                  className="text-green-200 hover:text-white w-6 h-6 flex items-center justify-center rounded"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-2"
                  style={{ background: 'rgba(13, 27, 14, 0.95)' }}
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-end gap-2 slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      style={{ animationDelay: `${i * 0.02}s` }}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-green-800 flex items-center justify-center text-xs flex-shrink-0">
                          🤖
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-bot text-green-100'
                        } ${msg.isError ? 'border-red-500/50 text-red-300' : ''}`}
                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                      />
                    </div>
                  ))}

                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick questions */}
                {messages.length <= 1 && (
                  <div
                    className="px-3 py-2 flex flex-wrap gap-1.5 border-t"
                    style={{ borderColor: 'rgba(76,175,80,0.2)', background: 'rgba(13,27,14,0.9)' }}
                  >
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q.text)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-all"
                        style={{
                          background: 'rgba(46,125,50,0.2)',
                          border: '1px solid rgba(76,175,80,0.3)',
                          color: '#a5d6a7',
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(46,125,50,0.4)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(46,125,50,0.2)'}
                      >
                        {q.icon} {q.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div
                  className="p-3 border-t"
                  style={{ borderColor: 'rgba(76,175,80,0.2)', background: 'rgba(20,32,22,0.95)' }}
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Сұрағыңызды жазыңыз... (қаз/рус/eng)"
                      disabled={isLoading}
                      rows={1}
                      className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(28,46,30,0.8)',
                        border: '1px solid rgba(76,175,80,0.3)',
                        color: '#e8f5e9',
                        fontFamily: 'Onest, sans-serif',
                        minHeight: '40px',
                        maxHeight: '100px',
                        lineHeight: '1.4',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(76,175,80,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={isLoading || !input.trim()}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        background: input.trim() && !isLoading
                          ? 'linear-gradient(135deg, #2e7d32, #388e3c)'
                          : 'rgba(46,125,50,0.2)',
                        cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#e8f5e9' }}>
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="text-center mt-1.5 text-xs" style={{ color: 'rgba(165,214,167,0.4)' }}>
                    Enter — жіберу • Shift+Enter — жол алмастыру
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #b71c1c, #d32f2f)'
            : 'linear-gradient(135deg, #1b5e20, #388e3c)',
          boxShadow: '0 4px 24px rgba(76,175,80,0.4)',
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
        }}
        title="ЖИ Кеңесші"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = isOpen ? 'scale(0.95)' : 'scale(1)'}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
        {unreadCount > 0 && !isOpen && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: '#d32f2f' }}
          >
            {unreadCount}
          </div>
        )}
      </button>
    </>
  )
}

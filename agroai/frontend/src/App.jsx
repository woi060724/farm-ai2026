import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import ChatBot from './components/ChatBot.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Livestock from './pages/Livestock.jsx'
import AIDetection from './pages/AIDetection.jsx'
import Health from './pages/Health.jsx'
import MapPage from './pages/MapPage.jsx'
import Reports from './pages/Reports.jsx'
import Login from './pages/Login.jsx'

export const AuthContext = React.createContext(null)
import React from 'react'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agroai_user')) }
    catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('agroai_token') || '')

  const login = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('agroai_user', JSON.stringify(userData))
    localStorage.setItem('agroai_token', accessToken)
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('agroai_user')
    localStorage.removeItem('agroai_token')
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, token, login, logout }}>
        <Login />
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <div className="flex min-h-screen">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 ml-64 p-6">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/livestock"   element={<Livestock />} />
            <Route path="/ai-detect"   element={<AIDetection />} />
            <Route path="/health"      element={<Health />} />
            <Route path="/map"         element={<MapPage />} />
            <Route path="/reports"     element={<Reports />} />
            <Route path="*"            element={<Navigate to="/" />} />
          </Routes>
        </main>
        {/* 💬 AI Chatbot — always visible */}
        <ChatBot />
      </div>
    </AuthContext.Provider>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Dashboard } from '@/pages/Dashboard'
import { Onboard } from '@/pages/Onboard'
import { Admin } from '@/pages/Admin'
import { NotFound } from '@/pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

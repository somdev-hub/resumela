// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import CoverLetter from './pages/CoverLetter'
import Resume from './pages/Resume'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coverletter" element={<CoverLetter />} />
        <Route path="/resume" element={<Resume />} />

      </Routes>
    </Router>
  )
}

export default App

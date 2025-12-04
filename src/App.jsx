// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import CoverLetter from './pages/CoverLetter'
import Resume from './pages/Resume'
import ViewDocument from './pages/ViewDocument'
import Marketplace from './pages/MarketPlace'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cover-letter/:docId?" element={<CoverLetter />} />
        <Route path="/resume/:docId?" element={<Resume />} />
        <Route path="/view/document/:docId" element={<ViewDocument />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
    </Router>
  )
}

export default App

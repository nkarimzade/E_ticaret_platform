import { useState } from 'react'
import Navbar from './Component/Navbar'
import './App.css'
import Home from './Pages/Home'
import Footer from './Component/Footer'
import Magazalar from './Pages/Magazalar'
import MagazaAc from './Pages/MagazaAc'
import Admin from './Pages/Admin'
import MagazaPanel from './Pages/MagazaPanel'
import StoreDetail from './Pages/StoreDetail'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/magazalar' element={<Magazalar />} />
          <Route path='/magaza-ac' element={<MagazaAc />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/panel' element={<MagazaPanel />} />
          <Route path='/magaza/:id' element={<StoreDetail />} />
        </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App

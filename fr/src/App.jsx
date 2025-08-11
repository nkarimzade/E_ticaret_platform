import React from 'react'
import Navbar from './Component/Navbar'
import './App.css'
import Home from './Pages/Home'
import Footer from './Component/Footer'
import Magazalar from './Pages/Magazalar'
import MagazaAc from './Pages/MagazaAc'
import Admin from './Pages/Admin'
import AdminUsers from './Pages/AdminUsers'
import AdminLayout from './Pages/AdminLayout'
import MagazaPanel from './Pages/MagazaPanel'
import StoreDetail from './Pages/StoreDetail'
import ProductDetail from './Pages/ProductDetail'
import ProductAdd from './Pages/ProductAdd'
import Debug from './Pages/Debug'
import ProductEdit from './Pages/ProductEdit'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Magazalar />} />
        <Route path='/anasayfa' element={<Home />} />
        <Route path='/magaza-ac' element={<MagazaAc />} />
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Admin />} />
          <Route path='stores' element={<Admin />} />
          <Route path='users' element={<AdminUsers />} />
        </Route>
        <Route path='/panel' element={<MagazaPanel />} />
        <Route path='/magaza/:id' element={<StoreDetail />} />
        <Route path='/urun/:storeId/:productId' element={<ProductDetail />} />
        <Route path='/urun-ekle' element={<ProductAdd />} />
        <Route path='/urun-duzenle/:storeId/:productId' element={<ProductEdit />} />
        <Route path='/debug' element={<Debug />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App

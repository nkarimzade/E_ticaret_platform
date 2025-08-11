import React, { useState } from 'react'
import Navbar from './Component/Navbar'
import CategoryBar from './Component/CategoryBar'
import './App.css'
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
import ProductComments from './Pages/ProductComments'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState('kadin')

  return (
    <Router>
      <Navbar />
      <CategoryBar 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      <Routes>
        <Route path='/' element={<Magazalar />} />
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
        <Route path='/urun-yorumlari/:productId' element={<ProductComments />} />
        <Route path='/debug' element={<Debug />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default App

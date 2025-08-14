import React, { useState } from 'react'
import Navbar from './Component/Navbar'
import CategoryBar from './Component/CategoryBar'
import './App.css'
import Footer from './Component/Footer'
import Magazalar from './Pages/Magazalar'
import MagazaAc from './Pages/MagazaAc'
import Admin from './Pages/Admin'
import AdminLogin from './Pages/AdminLogin'
import AdminStores from './Pages/AdminStores'
import AdminUsers from './Pages/AdminUsers'
import AdminLayout from './Pages/AdminLayout'
import MagazaPanel from './Pages/MagazaPanel'
import StoreDetail from './Pages/StoreDetail'
import ProductDetail from './Pages/ProductDetail'
import ProductAdd from './Pages/ProductAdd'
import Debug from './Pages/Debug'
import ProductEdit from './Pages/ProductEdit'
import ProductComments from './Pages/ProductComments'
import UserRegister from './Pages/UserRegister'
import UserLogin from './Pages/UserLogin'
import Favorites from './Pages/Favorites'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'

const AppContent = () => {
  const [selectedCategory, setSelectedCategory] = useState('tumu')
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <>
      <Navbar />
      {isHomePage && (
        <CategoryBar 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />
      )}
      <Routes>
        <Route path='/' element={<Magazalar selectedCategory={selectedCategory} />} />
        <Route path='/magaza-ac' element={<MagazaAc />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Admin />} />
          <Route path='stores' element={<AdminStores />} />
          <Route path='users' element={<AdminUsers />} />
        </Route>
        <Route path='/panel' element={<MagazaPanel />} />
        <Route path='/magaza/:id' element={<StoreDetail />} />
        <Route path='/urun/:storeId/:productId' element={<ProductDetail />} />
        <Route path='/urun-ekle' element={<ProductAdd />} />
        <Route path='/urun-duzenle/:storeId/:productId' element={<ProductEdit />} />
        <Route path='/urun-yorumlari/:productId' element={<ProductComments />} />
        <Route path='/debug' element={<Debug />} />
        <Route path='/kayit' element={<UserRegister />} />
        <Route path='/giris' element={<UserLogin />} />
        <Route path='/favorites' element={<Favorites />} />
      </Routes>
      <Footer />
    </>
  )
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

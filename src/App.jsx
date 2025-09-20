import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Register from './pages/Auth/Register'
import CategoryManagement from './pages/Admin/CategoryManagement'
import Login from './pages/Auth/Login'
import AddProduct from './pages/Seller/AddProduct'
import ManageProducts from './pages/Seller/ManageProducts'
import SellerOrders from './pages/Seller/SellerOrders'
import SellerDashboard from './pages/Seller/SellerDashboard'


function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/category' element={<CategoryManagement />} />
      <Route path='/add-product' element={<AddProduct />} />
      <Route path='/manage-products' element={<ManageProducts />} />
      <Route path='/seller-orders' element={<SellerOrders />} />
      <Route path='seller-dashboard' element={<SellerDashboard/>} />
    </Routes>
  )
}

export default App
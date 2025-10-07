import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Register from './pages/Auth/Register'
import CategoryManagement from './pages/Admin/CategoryManagement'
import Login from './pages/Auth/Login'
import AddProduct from './pages/Seller/AddProduct'
import ManageProducts from './pages/Seller/ManageProducts'
import SellerOrders from './pages/Seller/SellerOrders'
import SellerDashboard from './pages/Seller/SellerDashboard'
import AllProducts from './pages/Admin/AllProducts'
import ManageUser from './pages/Admin/ManageUsers'
import ManageOrders from './pages/Admin/ManageOrders'
import Sidebar from './pages/layout/Sidebar'
import SellerLayout from './pages/layout/SellerLayout'
import SellerProfile from './pages/Seller/SellerProfile'
import AdminProfile from './pages/Admin/AdminProfile'


function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register/>} />
      <Route path='/login' element={<Login/>} />
      <Route path='/category-management' element={<CategoryManagement/>} />
      <Route path='/add-product' element={<AddProduct/>} />
      <Route path='/manage-products' element={<ManageProducts />} />
      <Route path='/seller-orders' element={<SellerOrders/>} />
      <Route path='/seller-dashboard' element={<SellerDashboard/>} />
      <Route path='/all-products' element={<AllProducts/>} />
      <Route path='/manage-users' element={<ManageUser/>} />
      <Route path='/manage-orders' element={<ManageOrders/>} />
      <Route path='/seller-layout' element={<SellerLayout/>} />
      <Route path="/seller-profile" element={<SellerProfile/>} />
      <Route path='/admin-profile' element={<AdminProfile/>} />
    </Routes>
  )
}

export default App
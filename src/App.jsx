import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Register from './pages/Auth/Register'
import CategoryManagement from './pages/Admin/CategoryManagement'
import Login from './pages/Auth/Login'
import AddProduct from './pages/Seller/AddProduct'


function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/category' element={<CategoryManagement />} />
      <Route path='/addproduct' element={<AddProduct />} />
    </Routes>
  )
}

export default App
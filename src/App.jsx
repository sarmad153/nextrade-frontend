import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import CategoryManagement from './pages/CategoryManagement'
import Login from './pages/Login'


function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/category' element={<CategoryManagement />} />
    </Routes>
  )
}

export default App
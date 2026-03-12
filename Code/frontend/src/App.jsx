import { useState } from 'react'
import { Route, Routes } from 'react-router'  
import './App.css'

import Home from './pages/Home'
import HomeBase from './assets/components/HomeBase'


function App() {
  

  return (
    <>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/homebase" element={<HomeBase />} />
      </Routes>
    </>
  )
}

export default App

import { useState } from 'react'
import { Route, Routes } from 'react-router'  
import './App.css'

import Home from './pages/Home'


function App() {
  

  return (
    <>
      
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/incidencias-urbanas" element={<IncidenciasUrbanas />} /> */}
        {/* <Route path="*" element={<NoMatch />} /> */}
      </Routes>
    </>
  )
}

export default App

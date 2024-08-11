import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './pages/register'
import Login from './pages/login'
import Home from './pages/home'
import QuestionsPage from './pages/questions'
import AttemptPage from './pages/AttemptPage'
import Profile from './pages/profile'
import Gradebook from './pages/gradebook'
import QuestionManagement from './pages/questionsManagement'
import QuestionsBuild from './pages/questionBuild'
import Tutorial from './pages/tutorial'
import { useEffect, useState } from 'react'

function App() {
   
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/question_management" element={<QuestionManagement />} />
          <Route path="/gradebook" element={<Gradebook />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/attempt" element={<AttemptPage />} />
          <Route path="/question_bank" element={<QuestionsPage />} />
          <Route path="/question_build" element={<QuestionsBuild />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

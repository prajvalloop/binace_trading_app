import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Ticker from './components/Ticker.jsx'

function App() {
  

  return (
    <>
      <BrowserRouter>
          <Routes>
            <Route path="/ticker" element={<Ticker/>}/>
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

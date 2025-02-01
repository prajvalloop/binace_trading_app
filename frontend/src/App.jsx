import { BrowserRouter as Router, Routes, Route,useLocation  } from 'react-router-dom';
import Login from "./Pages/Login";
import Profile from './Pages/Profile';
import Ticker from './Pages/Ticker';
import Navbar from './Components/Navbar';
import Weather from './Components/Weather';

function App() {
  
  return (
    <>
    
    <Router>
    {localStorage.getItem('authToken') && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ticker" element={<Ticker/>}/>
        <Route path='/weather' element={<Weather/>}/>
      </Routes>
    </Router>
    </>
  );
}

export default App;

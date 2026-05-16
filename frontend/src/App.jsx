import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatWidget from './components/ChatWidget';
import { UtensilsCrossed } from 'lucide-react';
import './index.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <UtensilsCrossed size={28} color="#ff4757" />
        Foodie<span>Bot</span>
      </Link>
      <div className="navbar-links">
        <Link to="/">Menu</Link>
        {user ? (
          <>
            <span className="user-greeting">
              Hi, <strong>{user.name}</strong>
            </span>
            <button className="nav-btn outline" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="nav-btn outline">Login</button>
            </Link>
            <Link to="/register">
              <button className="nav-btn">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <ChatWidget />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

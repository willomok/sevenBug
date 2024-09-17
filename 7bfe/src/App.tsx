import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import SideNav from './components/SideNav';
import './App.css';


const App: React.FC = () => {
    return (
        <Router>
            <SideNav />
            <div className="content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/user-management" element={<UserManagement />} /> 
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;

import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
// Import all page components
import Home from './pages/Home/Home';
import Globe from './pages/Globe';
import Profile from './pages/Profile';
import MyLibrary from './pages/MyLibrary';
import TripPlanner from './pages/TripPlanner';
import PublicFeeds from './pages/PublicFeeds';
import PrivateZone from './pages/PrivateZone';
import './App.css'; 

const App = () => {
    // State to manage simple navigation
    const [currentPage, setCurrentPage] = useState('home');

    // Function to render the correct page component based on state
    const renderPage = () => {
        switch (currentPage) {
            case 'globe':
                return <Globe />;
            case 'profile':
                return <Profile />;
            case 'library':
                return <MyLibrary />;
            case 'trip-planner':
                return <TripPlanner />;
            case 'public':
                return <PublicFeeds />;
            case 'private':
                return <PrivateZone />;
            case 'home':
            default:
                return <Home />;
        }
    };

    return (
        <div className="App">
            {/* Pass state control to the Navbar */}
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;
import React from 'react';
import './Home.css'; 

const Home = () => {
    return (
        <section className="home-page">
            <header className="hero-section">
                <h1>Welcome Back, Wanderer!</h1>
                <p>Your next adventure is waiting to be logged.</p>
                <div className="quick-actions">
                    <button className="primary-btn">Start a New Journal Entry</button>
                </div>
            </header>

            <div className="recent-trips">
                <h2>Recent Journeys</h2>
                <div className="trip-card-grid">
                    {/* Placeholder Cards for recent activity */}
                    <div className="trip-card">Trip to Paris 🇫🇷</div>
                    <div className="trip-card">Hike in Patagonia 🏔️</div>
                    <div className="trip-card">Tokyo Food Tour 🍜</div>
                </div>
            </div>
        </section>
    );
};

export default Home;
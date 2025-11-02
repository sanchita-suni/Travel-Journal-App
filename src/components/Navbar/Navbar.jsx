import React from 'react';
import './Navbar.css';

const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'globe', label: 'Look Up Globe' },
    { id: 'profile', label: 'Profile' },
    { id: 'library', label: 'My Library' },
    { id: 'trip-planner', label: 'Trip Planner' },
    { id: 'public', label: 'Public Feeds' },
    { id: 'private', label: 'Private Zone' },
];

const Navbar = ({ currentPage, setCurrentPage }) => {
    return (
        <nav className="navbar">
            <div className="logo">WanderLog 🌍</div>
            <ul className="nav-links">
                {navItems.map((item) => (
                    <li key={item.id}>
                        <a
                            href="#"
                            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(item.id); 
                            }}
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
            <div className="user-action">
                <button className="login-btn">Log In (Later)</button>
            </div>
        </nav>
    );
};

export default Navbar;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Earth from "./components/Earth.jsx"; // ✅ Add this here at the very top
import TripPlanner from "./components/TripPlanner.jsx";
import MyLibrary from "./components/MyLibrary";
import CreatePage from "./components/CreatePage";
// Firebase Imports will be integrated later.
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, collection, onSnapshot, query, addDoc } from 'firebase/firestore';


// Mock data for Journal Creation Mode
const fontStyles = [
    { name: 'Classic', className: 'font-serif' },
    { name: 'Modern', className: 'font-sans' },
    { name: 'Handwritten', className: 'font-[Snell_Roundhand,cursive]' }, // Using a custom font stack fallback
    { name: 'Typewriter', className: 'font-mono' },
];
const coverBackgrounds = [
    { type: 'solid', color: '#B3E5FC', label: 'Sky', tw: 'bg-[#B3E5FC]' },
    { type: 'solid', color: '#C8E6C9', label: 'Mint', tw: 'bg-[#C8E6C9]' },
    { type: 'solid', color: '#FFCCBC', label: 'Coral', tw: 'bg-[#FFCCBC]' },
    // Patterns need inline styles since Tailwind doesn't support complex CSS property values inline easily
    { type: 'pattern', label: 'Stripes', style: { backgroundImage: 'repeating-linear-gradient(45deg, #f0f0f0 0, #f0f0f0 1px, #ffffff 1px, #ffffff 10px)' } },
    { type: 'pattern', label: 'Dots', style: { backgroundImage: 'radial-gradient(circle, #00000040 1px, transparent 1px)', backgroundSize: '10px 10px' } },
];
const mockStickers = ['✈️', '🗺️', '📸', '☕', '🌟', '⛰️', '🌴', '☀️', '✏️', '❤️'];
const textColors = [
    { hex: '#000000', tw: 'text-gray-900' }, 
    { hex: '#ffffff', tw: 'text-white' }, 
    { hex: '#dc3545', tw: 'text-red-600' }, 
    { hex: '#007bff', tw: 'text-blue-600' }, 
    { hex: '#28a745', tw: 'text-green-600' }, 
    { hex: '#ffc107', tw: 'text-amber-500' }
];

// Default state for a completely blank journal
const defaultBlankJournalState = {
    coverTitle: 'Untitled Journey',
    font: fontStyles[0].className,
    bg: coverBackgrounds[0],
    color: textColors[0],
    stickers: [],
};

// --- NEW MOCK TEMPLATE DATA ---
const mockTemplates = [
    { 
        id: 1, 
        name: 'Sunset Gradient', 
        coverTitle: 'The Adventure Begins', 
        bg: { type: 'gradient', label: 'Sunset', tw: 'bg-gradient-to-br from-pink-400 to-orange-300' }, 
        font: fontStyles.find(f => f.name === 'Modern').className, 
        color: textColors[0],
        stickers: []
    },
    { 
        id: 2,
        name: 'Cow Print', 
        coverTitle: 'Memories Log', 
        bg: { type: 'pattern', label: 'Cow Print', style: { background: 'radial-gradient(circle at 60% 80%, black 15px, transparent 15px), radial-gradient(circle at 20% 40%, black 20px, transparent 20px), radial-gradient(circle at 80% 20%, black 10px, transparent 10px), radial-gradient(circle at 45% 55%, black 25px, transparent 25px), white' } }, 
        font: fontStyles.find(f => f.name === 'Typewriter').className, 
        color: textColors[0],
        stickers: [{ emoji: '📸', x: 50, y: 70, id: 900 }]
    },
    { 
        id: 3,
        name: 'Wavy Pink', 
        coverTitle: 'My Travel Log', 
        bg: { type: 'gradient', label: 'Wavy', tw: 'bg-gradient-to-t from-pink-300 via-pink-400 to-blue-100' }, 
        font: fontStyles.find(f => f.name === 'Handwritten').className, 
        color: textColors[1], // White
        stickers: [{ emoji: '❤️', x: 20, y: 15, id: 901 }, { emoji: '✈️', x: 80, y: 85, id: 902 }]
    },
    { 
        id: 4,
        name: 'Forest Green', 
        coverTitle: 'Nature Escapes', 
        bg: { type: 'solid', color: '#38761d', label: 'Forest', tw: 'bg-[#38761d]' }, 
        font: fontStyles.find(f => f.name === 'Classic').className, 
        color: textColors[1],
        stickers: [{ emoji: '⛰️', x: 50, y: 40, id: 903 }]
    },
];

// Array of navigation features
const navFeatures = [
  { name: "Profile", key: "profile" },
  { name: "My Library", key: "library" },
  { name: "Look Up", key: "lookup" },
  { name: "Public", key: "public" },
  { name: "Private", "key": "private" },
  { name: "Trip Planner", key: "planner" },
];

// Mock User State (This is where real user data would load)
const initialUser = {
    username: 'traveler_suni',
    password: 'securepassword123',
    contact: 'user@example.com',
};


// --- Helper component to load Tailwind and Fonts (Crucial for the new design) ---
function TailwindConfig() {
    // Inject the Tailwind script and set the Inter font
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.tailwindcss.com';
        document.head.appendChild(script);

        // Configure Tailwind to enable custom font-family (for 'Handwritten')
        script.onload = () => {
             // Define a custom font family if not defined in Tailwind default
             tailwind.config = {
                 theme: {
                     extend: {
                         fontFamily: {
                             'inter': ['Inter', 'sans-serif'],
                             // Include custom font stack for "Handwritten" look
                             'cursive': ['Snell Roundhand', 'cursive'],
                         },
                     },
                 },
             };
        }

        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        document.documentElement.classList.add('font-inter');
    }, []);

    // Also ensures dark mode is initialized correctly in the document
    useEffect(() => {
        const root = document.documentElement;
        // Setting the Tailwind dark mode class on the root element
        if (root.classList.contains('dark-mode')) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, []);

    return null;
}

// --- 1. Profile Page Component (Tailwind Refactored) ---
function ProfilePage({ user, setUser, onLogout, isDarkMode, toggleTheme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser(formData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Custom alert/modal for successful update/logout (as alerts are forbidden)
  const [message, setMessage] = useState('');
  
  const handleLogoutWithMessage = () => {
      onLogout();
      setMessage('You have been successfully logged out.');
      setTimeout(() => setMessage(''), 3000);
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">User Profile</h1>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-8">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Username:</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password (New):</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Info:</span>
              <input
                type="email"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </label>
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition duration-150"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-gray-700 dark:text-gray-200">
            <p className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <strong className="w-24 inline-block">Username:</strong> {user.username}
            </p>
            <p className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <strong className="w-24 inline-block">Password:</strong> ********
            </p>
            <p className="border-b border-gray-200 dark:border-gray-700 pb-2">
              <strong className="w-24 inline-block">Contact:</strong> {user.contact}
            </p>
            <div className="pt-4">
              <button 
                onClick={handleEdit} 
                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}

        {/* Theme Toggle Switch */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <label htmlFor="theme-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode:</label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Light</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="theme-switch"
                checked={isDarkMode}
                onChange={toggleTheme}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">Dark</span>
          </div>
        </div>

        <button 
            onClick={handleLogoutWithMessage} 
            className="mt-6 w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-150"
        >
            Log Out
        </button>
      </div>
      
      {/* Custom Message Modal (no alerts) */}
      {message && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300">
              {message}
          </div>
      )}
    </div>
  );
}

// --- 2. Navigation Bar Component (Tailwind Refactored) ---
function Navbar({ onNavigate, currentPage }) {
  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => onNavigate('home')} 
              className="text-xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 bg-transparent p-0 border-none hover:text-blue-500 dark:hover:text-blue-300 transition duration-150"
            >
              🌎 Travel Journal App
            </button>
          </div>
          
          {/* Navigation Links (Desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-4 lg:space-x-8">
            {navFeatures.map((feature) => (
              <button
                key={feature.key}
                onClick={() => onNavigate(feature.key)}
                className={`
                  inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-150
                  ${currentPage === feature.key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white bg-transparent'
                  }
                `}
              >
                {feature.name}
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Button (Hamburger) - Not implemented, but kept responsive for larger screens */}
          <div className="sm:hidden">
            {/* Can be implemented later for a fully responsive menu */}
          </div>
        </div>
      </div>
    </nav>
  );
}

// --- 3. Default Home Page Content (Tailwind Refactored) ---
function HomePage({ onNavigate }) {
    return (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                Welcome to Your Digital Journal!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
                Capture every memory, plan every trip, and share your adventures with the world (or keep them private).
            </p>
            
            <section className="mt-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer" onClick={() => onNavigate('library')}>
                    <div className="text-blue-500 text-4xl mb-3">📚</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Library</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Design new journals and access all your saved trips.</p>
                </div>
                
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer" onClick={() => onNavigate('planner')}>
                    <div className="text-green-500 text-4xl mb-3">🗺️</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Trip Planner</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Visualize your next adventure and organize logistics.</p>
                </div>
                
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer" onClick={() => onNavigate('profile')}>
                    <div className="text-purple-500 text-4xl mb-3">👤</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Profile & Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account details and theme preferences.</p>
                </div>
            </section>
        </div>
    );
}

// --- 4. Trip Planner Page Component (Tailwind Refactored) ---
function TripPlannerPage() {
    return (
        <div className="p-8 text-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">🌍 Trip Planner</h2>
            <div className="bg-white dark:bg-gray-800 max-w-3xl mx-auto p-8 rounded-xl shadow-xl">
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                    This is where you will plan your next great adventure!
                </p>
                <div className="p-6 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-gray-700">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        **Feature Idea:** Add a form here to input trip details (Destination, Dates, Budget, Notes).
                    </p>
                    <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-150">
                        Start a New Trip Plan
                    </button>
                </div>
            </div>
        </div>
    );
}


// --- 5. Journal Templates Modal Component (Tailwind Refactored) ---
function JournalTemplatesModal({ onSelectTemplate, onClose, onGoBlank }) {
    const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);

    const handleDone = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate);
        }
    };

    const TemplatePreview = ({ template, isSelected }) => (
        <div 
            className={`cursor-pointer p-3 rounded-xl transition-all duration-200 ${isSelected ? 'border-4 border-blue-500 ring-4 ring-blue-200 dark:ring-blue-800 shadow-lg scale-[1.02]' : 'border-2 border-gray-100 dark:border-gray-700 hover:shadow-md'}`}
            onClick={() => setSelectedTemplate(template)}
        >
            <div 
                className={`w-full h-64 rounded-lg shadow-xl mb-3 relative flex justify-center items-center text-center overflow-hidden ${template.font} ${template.bg.tw}`}
                style={{ 
                    ...(template.bg.style || {}),
                    color: template.color.hex 
                }}
            >
                <div className="text-xl font-bold p-3 leading-tight break-words">{template.coverTitle}</div>
                {template.stickers && template.stickers.map((s, i) => (
                    <span 
                        key={i} 
                        className="absolute text-3xl" 
                        style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        {s.emoji}
                    </span>
                ))}
                {isSelected && (
                    <div className="absolute top-2 right-2 text-amber-400 drop-shadow-md">
                         <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                )}
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-200">{template.name}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl p-6 md:p-8 relative">
                <button 
                    className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition duration-150 p-1 rounded-full bg-gray-100 dark:bg-gray-800" 
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Choose a Journal Template
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {mockTemplates.map(template => (
                        <TemplatePreview 
                            key={template.id} 
                            template={template} 
                            isSelected={selectedTemplate?.id === template.id} 
                        />
                    ))}
                </div>
                
                <div className="max-w-md mx-auto mb-6">
                    <input 
                        type="text" 
                        placeholder="Give your journal a title (Optional)" 
                        value={selectedTemplate?.coverTitle || ''}
                        onChange={(e) => {
                            if (selectedTemplate) {
                                setSelectedTemplate({ ...selectedTemplate, coverTitle: e.target.value });
                            }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-center text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={onGoBlank} 
                        className="px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 font-bold rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition duration-150"
                    >
                        Start Blank Journal
                    </button>
                    <button 
                        onClick={handleDone} 
                        className="px-10 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition duration-150 disabled:opacity-50"
                        disabled={!selectedTemplate}
                    >
                        Use Template
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- 6. Journal Creation Mode Component (Tailwind Refactored) ---
function JournalCreationMode({ onBack, initialCoverState = {} }) {
    // Merge initial state with defaults
    const [title, setTitle] = useState(initialCoverState.coverTitle || defaultBlankJournalState.coverTitle);
    const [author, setAuthor] = useState("Traveler Suni");
    const [selectedFont, setSelectedFont] = useState(initialCoverState.font || defaultBlankJournalState.font);
    const [selectedBg, setSelectedBg] = useState(initialCoverState.bg || defaultBlankJournalState.bg);
    const [selectedTextColor, setSelectedTextColor] = useState(initialCoverState.color || defaultBlankJournalState.color);
    const [stickers, setStickers] = useState(initialCoverState.stickers || defaultBlankJournalState.stickers); // Array of { emoji, x, y }
    const [activeTool, setActiveTool] = useState('sticker'); // 'sticker', 'font', 'color', 'design'
    
    const coverRef = useRef(null);
    const draggingStickerRef = useRef(null);
    const isDraggingRef = useRef(false);

    // --- Drag & Drop Handlers ---
    const handleDragStart = (e, emoji) => {
        e.dataTransfer.setData("text/plain", emoji);
        e.dataTransfer.effectAllowed = "copy";
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const emoji = e.dataTransfer.getData("text/plain");
        if (!coverRef.current) return;

        const rect = coverRef.current.getBoundingClientRect();
        
        // Calculate position relative to the cover (0 to 100%)
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
        
        setStickers(prev => [...prev, { emoji, x: xPercent, y: yPercent, id: Date.now() }]);
    };

    // --- Sticker Repositioning (Drag inside canvas) ---
    const startStickerDrag = useCallback((e, id) => {
        // Use touch events for mobile interaction
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        e.stopPropagation();
        isDraggingRef.current = true;
        
        // Find the sticker element from the event target
        let stickerElement = e.target;
        // Sometimes the touch event target is a child element, make sure we get the .placed-sticker span
        while (stickerElement && !stickerElement.classList.contains('placed-sticker')) {
            stickerElement = stickerElement.parentElement;
        }

        if (!stickerElement) return;

        const rect = stickerElement.getBoundingClientRect();
        
        // Offset from mouse/touch to sticker center/corner
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;
        
        draggingStickerRef.current = { id, offsetX, offsetY };
        
        document.addEventListener('mousemove', handleStickerDrag);
        document.addEventListener('mouseup', handleStickerDragEnd);
        document.addEventListener('touchmove', handleStickerDrag);
        document.addEventListener('touchend', handleStickerDragEnd);
    }, []);

    const handleStickerDrag = useCallback((e) => {
        // Use touch events for mobile interaction
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        if (!isDraggingRef.current || !coverRef.current || !draggingStickerRef.current) return;
        
        e.preventDefault(); // Important for preventing scrolling on touchmove

        const { id, offsetX, offsetY } = draggingStickerRef.current;
        const coverRect = coverRef.current.getBoundingClientRect();
        
        // Calculate new mouse position relative to cover
        let newX = clientX - coverRect.left - offsetX;
        let newY = clientY - coverRect.top - offsetY;

        // Convert to percentage (for responsiveness)
        const xPercent = (newX / coverRect.width) * 100;
        const yPercent = (newY / coverRect.height) * 100;

        setStickers(prev => prev.map(s => 
            s.id === id ? { ...s, x: Math.max(0, Math.min(100, xPercent)), y: Math.max(0, Math.min(100, yPercent)) } : s
        ));
    }, []);

    const handleStickerDragEnd = useCallback(() => {
        isDraggingRef.current = false;
        draggingStickerRef.current = null;
        
        document.removeEventListener('mousemove', handleStickerDrag);
        document.removeEventListener('mouseup', handleStickerDragEnd);
        document.removeEventListener('touchmove', handleStickerDrag);
        document.removeEventListener('touchend', handleStickerDragEnd);
    }, [handleStickerDrag]);


    // --- Tool Panel Renderer ---
    const renderToolContent = () => {
        switch (activeTool) {
            case 'sticker':
                return (
                    <div className="p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Drag and drop these stickers onto the book cover!</p>
                        <div className="grid grid-cols-4 gap-3">
                            {mockStickers.map((sticker, index) => (
                                <div 
                                    key={index} 
                                    className="text-3xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab transition duration-150 text-center" 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, sticker)}
                                >
                                    {sticker}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'font':
                return (
                    <div className="p-4 space-y-3 w-full">
                        {fontStyles.map((font) => (
                            <button
                                key={font.name}
                                className={`w-full px-4 py-2 border rounded-lg text-lg transition duration-150 ${font.className} ${
                                    selectedFont === font.className 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                                }`}
                                onClick={() => setSelectedFont(font.className)}
                            >
                                {font.name}
                            </button>
                        ))}
                    </div>
                );
            case 'color':
                return (
                    <div className="p-4 w-full">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Select text color</p>
                        <div className="grid grid-cols-3 gap-4">
                            {textColors.map((color) => (
                                <div 
                                    key={color.hex} 
                                    className={`w-full h-12 rounded-full cursor-pointer transition duration-150 flex justify-center items-center ${
                                        selectedTextColor.hex === color.hex ? 'border-4 border-blue-500 shadow-inner' : 'border border-gray-300 dark:border-gray-600'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => setSelectedTextColor(color)}
                                >
                                    {selectedTextColor.hex === color.hex && (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={color.hex === '#ffffff' ? '#000' : '#fff'} strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'design':
                return (
                    <div className="p-4 w-full">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Select cover background</p>
                        <div className="grid grid-cols-3 gap-4">
                            {coverBackgrounds.map((bg) => (
                                <div 
                                    key={bg.label} 
                                    className={`w-full h-16 rounded-lg cursor-pointer transition duration-150 flex justify-center items-center text-xs font-bold ${
                                        selectedBg.label === bg.label ? 'border-4 border-blue-500 shadow-md' : 'border border-gray-300 dark:border-gray-600'
                                    } ${bg.tw || ''} ${bg.color === '#ffffff' ? 'text-gray-900' : 'text-white'}`}
                                    style={bg.style || {}}
                                    onClick={() => setSelectedBg(bg)}
                                >
                                    {bg.label.charAt(0)}
                                </div>
                            ))}
                            {/* Templates as background options (simple gradient/pattern options) */}
                             {mockTemplates.filter(t => t.bg.tw).map(t => (
                                <div 
                                    key={t.id} 
                                    className={`w-full h-16 rounded-lg cursor-pointer transition duration-150 flex justify-center items-center text-xs font-bold ${
                                        selectedBg.label === t.bg.label ? 'border-4 border-blue-500 shadow-md' : 'border border-gray-300 dark:border-gray-600'
                                    } ${t.bg.tw}`}
                                    style={t.bg.style || {}}
                                    onClick={() => setSelectedBg(t.bg)}
                                >
                                    {t.name.split(' ')[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Combine styles for the cover preview
    const coverStyle = {
        // Use inline style for complex patterns/gradients not covered by simple tw classes
        ...selectedBg.style,
        // Fallback for simple solid/gradient colors via Tailwind classes, ensuring inline styles (if present) take precedence
        color: selectedTextColor.hex,
    };
    const coverClasses = `w-[300px] h-[420px] sm:w-[350px] sm:h-[490px] rounded-xl shadow-2xl relative border-[6px] border-black/5 flex justify-center items-center overflow-hidden ${selectedFont} ${selectedBg.tw || ''}`;
    
    // Check if the background has a specific style (like pattern) that overrides the tw class
    const finalCoverClasses = selectedBg.style ? coverClasses.replace(selectedBg.tw, '') : coverClasses;

    return (
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col items-center">
            <button 
                onClick={onBack} 
                className="self-start mb-6 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-transparent border border-blue-600 dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition duration-150"
            >
                ← Back to Library
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Design Your Journal Cover
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-8 w-full justify-center">

                {/* Left: Interactive Book Canvas */}
                <div 
                    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl lg:w-1/2 max-w-lg mx-auto lg:mx-0"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <div className="w-full mb-6 space-y-3">
                        <input 
                            type="text" 
                            placeholder="JOURNAL TITLE" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            maxLength={30}
                            className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-inner text-center font-bold text-xl focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${selectedFont} ${selectedTextColor.tw}`}
                            style={{ color: selectedTextColor.hex }}
                        />
                         <input 
                            type="text" 
                            placeholder="Author Name" 
                            value={author} 
                            onChange={(e) => setAuthor(e.target.value)} 
                            maxLength={30}
                            className={`w-full px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-lg shadow-inner text-center text-sm italic focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 ${selectedFont} ${selectedTextColor.tw}`}
                            style={{ color: selectedTextColor.hex }}
                        />
                    </div>
                    
                    <div 
                        ref={coverRef}
                        className={finalCoverClasses} 
                        style={coverStyle}
                    >
                        {/* Render Draggable Stickers */}
                        {stickers.map((sticker) => (
                            <span 
                                key={sticker.id} 
                                className="placed-sticker absolute text-4xl sm:text-5xl drop-shadow-lg transition-transform duration-100 ease-out" 
                                style={{ 
                                    left: `${sticker.x}%`, 
                                    top: `${sticker.y}%`,
                                    // Use translate to center the sticker relative to the cursor on drop/drag
                                    transform: 'translate(-50%, -50%)', 
                                    cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                                }}
                                onMouseDown={(e) => startStickerDrag(e, sticker.id)}
                                onTouchStart={(e) => startStickerDrag(e, sticker.id)}
                            >
                                {sticker.emoji}
                            </span>
                        ))}
                    </div>

                    <button className="mt-8 px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition duration-150">
                        Save Journal to Library
                    </button>
                </div>

                {/* Right: Vertical Tool Panel */}
                <div className="flex lg:flex-col gap-6 w-full lg:w-auto max-w-full lg:max-w-xs mx-auto">
                    <div className="flex flex-row lg:flex-col gap-3 justify-center">
                        <ToolIcon title="Stickers" iconPath="M15 10c2.25 0 4 1.75 4 4s-1.75 4-4 4s-4-1.75-4-4s1.75-4 4-4zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zM12 11h.01" toolKey="sticker" activeTool={activeTool} setActiveTool={setActiveTool} />
                        <ToolIcon title="Font Style" iconPath="M4 7V4h16v3M9 20h6M12 4v16" toolKey="font" activeTool={activeTool} setActiveTool={setActiveTool} />
                        <ToolIcon title="Text Color" iconPath="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zM18 10a2 2 0 1 0 0-4a2 2 0 0 0 0 4zM12 20a8 8 0 1 0 0-16a8 8 0 0 0 0 16z" toolKey="color" activeTool={activeTool} setActiveTool={setActiveTool} />
                        <ToolIcon title="Background Design" iconPath="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" toolKey="design" activeTool={activeTool} setActiveTool={setActiveTool} />
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl flex-grow lg:flex-grow-0 min-h-[250px] lg:min-h-[400px] w-full lg:w-auto">
                        <h3 className="text-lg font-semibold text-center border-b border-gray-200 dark:border-gray-700 p-4 text-gray-900 dark:text-white">
                            {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Options
                        </h3>
                        {renderToolContent()}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper component for tool icons
function ToolIcon({ title, iconPath, toolKey, activeTool, setActiveTool }) {
    return (
        <button 
            className={`w-12 h-12 rounded-lg transition duration-150 flex items-center justify-center border-2 
                ${activeTool === toolKey 
                    ? 'bg-blue-600 border-blue-700 text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }
            `}
            onClick={() => setActiveTool(toolKey)}
            title={title}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={iconPath}/>
            </svg>
        </button>
    );
}

// --- Component for rendering a single shelf row ---
const ShelfRow = ({ tier }) => {
    // Wood grain color/texture
    const woodClasses = "bg-amber-800 border-b-4 border-amber-900 shadow-lg";
    // Interior background
    const backWallClasses = "bg-stone-100 dark:bg-gray-700";

    return (
        <div className="flex flex-col flex-grow">
            <div className={`h-full flex-grow p-4 ${backWallClasses} relative`}>
                <div className="text-center text-gray-600 dark:text-gray-400 text-sm h-full flex items-center justify-center">
                    <p>Shelf Tier {tier} - Your Journals Go Here</p>
                </div>
                {/* Placeholder for actual journal rendering */}
            </div>
            {/* Shelf board */}
            <div className={`h-4 w-full ${woodClasses} shelf-animated`}></div>

        </div>
    );
};

// --- 7. My Library Page Component (Tailwind Refactored) ---
function MyLibraryPage({ onGoBlank }) {
    const [mode, setMode] = useState('library'); 
    const [newJournalInitialState, setNewJournalInitialState] = useState({});

    const handleCreateBlankJournal = () => {
        setMode('create');
    };

    if (mode === 'create') {
        // When Create is clicked → Show Welcome page
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <h1 className="text-4xl font-semibold text-gray-800">Welcome :)</h1>
            </div>
        );
    }

    // Library View
    return (
        <div className="relative w-full min-h-[calc(100vh-64px)] p-4 md:p-8 bg-gray-200 dark:bg-gray-800">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                📚 My Private Library
            </h2>
            
            <div className="max-w-6xl mx-auto h-[70vh] flex shadow-2xl rounded-lg overflow-hidden border-4 border-amber-800">
                <div className="w-4 bg-amber-800 border-r-4 border-amber-900 shadow-inner"></div>
                <div className="flex flex-col flex-grow bg-white dark:bg-gray-900">
                    <ShelfRow tier={1} />
                    <ShelfRow tier={2} />
                    <ShelfRow tier={3} />
                    <div className="h-4 w-full bg-amber-800 border-t-4 border-amber-900 shadow-inner"></div>
                </div>
                <div className="w-4 bg-amber-800 border-l-4 border-amber-900 shadow-inner"></div>
            </div>

            {/* ✅ Floating Create Button */}
            <button
                onClick={handleCreateBlankJournal}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300"
            >
                +
            </button>
        </div>
    );
}


// --- 8. Main Application Component (Tailwind Refactored) ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('library'); // Start on library page for better demo
  const [isDarkMode, setIsDarkMode] = useState(false); // Let's default to light mode for a brighter look

  // Use a simple mechanism to load Tailwind and manage the theme class
  TailwindConfig();
  
  const [user, setUser] = useState(initialUser);
  
  // --- Theme Toggle Logic ---
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Logout (simple simulation)
  const handleLogout = () => {
    console.log("User logged out.");
    setCurrentPage('home');
    // Using console log instead of forbidden alert()
    console.log("LOG: User has been logged out."); 
  };

  // Render the appropriate page content based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return (
          <ProfilePage 
            user={user} 
            setUser={setUser} 
            onLogout={handleLogout} 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
          />
        );
      case 'library':
        return <MyLibraryPage />;
      case 'planner':
        return <TripPlanner />;
     

case 'lookup':
  return (
    <div className="p-8 text-center bg-black min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-white mb-4">🌍 Explore the Earth</h2>
      <p className="text-gray-300 mb-6">Drag to rotate — scroll to zoom.</p>
      <Earth />
    </div>
  );

      case 'public':
        return <div className="p-8 text-center text-gray-900 dark:text-white"><h2>Public Journals (Coming Soon!)</h2></div>;
      case 'private':
        return <div className="p-8 text-center text-gray-900 dark:text-white"><h2>Private Journals (Coming Soon!)</h2></div>;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
      {renderPage()}
    </div>
  );
}


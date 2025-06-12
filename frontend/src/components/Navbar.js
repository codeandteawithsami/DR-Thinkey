import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'mood', label: 'Mood Analysis' },
    { id: 'schedule', label: 'Daily Schedule' },
    { id: 'custom', label: 'Custom Schedule' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'view', label: 'View Schedule' }
  ];

  return (
    <nav className="bg-purple-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
              <path d="M12 2a5 5 0 110 10 5 5 0 010-10z"/>
              <path d="M4 22v-2c0-2 2-4 4-4h8c2 0 4 2 4 4v2H4z"/>
              <path d="M9 14v2a1 1 0 002 0v-2H9zm4 0v2a1 1 0 002 0v-2h-2z"/>
            </svg>
            <span className="text-xl font-semibold">Dr. Thinky</span>
          </div>
          
          <div className="hidden md:flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-purple-800 text-white'
                    : 'text-purple-100 hover:bg-purple-600'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="md:hidden">
            <select 
              className="bg-purple-800 text-white px-3 py-2 rounded-md"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
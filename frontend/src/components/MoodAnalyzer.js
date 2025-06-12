import React, { useState } from 'react';

const MoodAnalyzer = ({ analyzeMood, moodData, isLoading, setActiveTab }) => {
  const [moodText, setMoodText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (moodText.trim()) {
      await analyzeMood(moodText);
    }
  };

  const handleCreateSchedule = () => {
    setActiveTab('schedule');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Mood Analyzer</h2>
        <p className="mb-4 text-gray-600">
          Describe how you're feeling right now, and our AI will analyze your mood and provide personalized insights.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="4"
              placeholder="How are you feeling today? (e.g., I'm feeling energetic but a bit anxious about my presentation later...)"
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>
          
          <button
            type="submit"
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            disabled={isLoading || !moodText.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Analyze My Mood'}
          </button>
        </form>
      </div>

      {moodData && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">Your Mood Analysis</h3>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Mood Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {moodData["Mood tags"]?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Energy Level:</h4>
              <p className="text-gray-600">{moodData.Energy}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Confidence Score:</h4>
              <p className="text-gray-600">{moodData["confidence score"]}</p>
            </div>
          </div>
          
          {moodData.Cravings && moodData.Cravings.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Cravings:</h4>
              <ul className="list-disc list-inside text-gray-600">
                {moodData.Cravings.map((craving, index) => (
                  <li key={index}>{craving}</li>
                ))}
              </ul>
            </div>
          )}
          
          {moodData["personalized tips"] && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Personalized Tips:</h4>
              <p className="text-gray-600">{moodData["personalized tips"]}</p>
            </div>
          )}
          
          {/* <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleCreateSchedule}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Create Schedule Based on Mood
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default MoodAnalyzer;
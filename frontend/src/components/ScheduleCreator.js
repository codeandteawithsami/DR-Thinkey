import React, { useState, useEffect } from 'react';

const ScheduleCreator = ({ createSchedule, moodData, isLoading }) => {
  const [formData, setFormData] = useState({
    moodText: '',
    dailyGoals: [''],
    events: [{ title: '', start_time: '', end_time: '', is_flexible: false }],
    preferences: {
      work_start_time: '9:00 am',
      work_end_time: '6:00 pm',
      preferred_break_duration: 15,
      preferred_meal_times: {
        breakfast: '8:00 am',
        lunch: '1:00 pm',
        dinner: '7:00 pm'
      },
      exercise_duration: 30,
      mindfulness_duration: 10
    }
  });

  // Update the mood text if mood data is available
  useEffect(() => {
    if (moodData) {
      const moodDescription = `I'm feeling ${moodData['Mood tags'].join(', ')} with ${moodData.Energy} energy.`;
      setFormData(prev => ({ ...prev, moodText: moodDescription }));
    }
  }, [moodData]);

  const handleMoodTextChange = (e) => {
    setFormData(prev => ({ ...prev, moodText: e.target.value }));
  };

  const handleGoalChange = (index, value) => {
    const updatedGoals = [...formData.dailyGoals];
    updatedGoals[index] = value;
    setFormData(prev => ({ ...prev, dailyGoals: updatedGoals }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      dailyGoals: [...prev.dailyGoals, '']
    }));
  };

  const removeGoal = (index) => {
    const updatedGoals = [...formData.dailyGoals];
    updatedGoals.splice(index, 1);
    setFormData(prev => ({ ...prev, dailyGoals: updatedGoals }));
  };

  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...formData.events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    setFormData(prev => ({ ...prev, events: updatedEvents }));
  };

  const addEvent = () => {
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, { title: '', start_time: '', end_time: '', is_flexible: false }]
    }));
  };

  const removeEvent = (index) => {
    const updatedEvents = [...formData.events];
    updatedEvents.splice(index, 1);
    setFormData(prev => ({ ...prev, events: updatedEvents }));
  };

  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const handleMealTimeChange = (meal, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferred_meal_times: {
          ...prev.preferences.preferred_meal_times,
          [meal]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty goals
    const filteredGoals = formData.dailyGoals.filter(goal => goal.trim() !== '');
    
    // Filter and format events
    const filteredEvents = formData.events
      .filter(event => event.title.trim() !== '' && event.start_time.trim() !== '' && event.end_time.trim() !== '')
      .map(event => ({
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        is_flexible: event.is_flexible
      }));
    
    await createSchedule(
      formData.moodText,
      filteredGoals,
      filteredEvents,
      formData.preferences
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Create Daily Schedule</h2>
        <p className="mb-6 text-gray-600">
          Create a personalized daily schedule based on your mood, goals, and preferences.
        </p>
        
        {!moodData && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            Please analyze your mood first to get a more personalized daily schedule.
            <div className="mt-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                Go to Mood Analysis
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Mood Section */}

          
          {/* Daily Goals Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Your Daily Goals</h3>
            
            {formData.dailyGoals.map((goal, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Goal ${index + 1}`}
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                  onClick={() => removeGoal(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 px-3 py-1 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
              onClick={addGoal}
            >
              + Add Goal
            </button>
          </div>
          
          {/* Calendar Events Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Calendar Events</h3>
            
            {formData.events.map((event, index) => (
              <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md">
                <div className="mb-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Event title"
                    value={event.title}
                    onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Start time (e.g., 9:00 am)"
                    value={event.start_time}
                    onChange={(e) => handleEventChange(index, 'start_time', e.target.value)}
                  />
                  <input
                    type="text"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="End time (e.g., 10:00 am)"
                    value={event.end_time}
                    onChange={(e) => handleEventChange(index, 'end_time', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`flexible-${index}`}
                    checked={event.is_flexible}
                    onChange={(e) => handleEventChange(index, 'is_flexible', e.target.checked)}
                    className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor={`flexible-${index}`} className="text-sm text-gray-600">
                    This event can be moved if needed
                  </label>
                  
                  <button
                    type="button"
                    className="ml-auto px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    onClick={() => removeEvent(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 px-3 py-1 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
              onClick={addEvent}
            >
              + Add Event
            </button>
          </div>
          
          {/* Preferences Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Your Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Start Time
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 9:00 am"
                  value={formData.preferences.work_start_time}
                  onChange={(e) => handlePreferenceChange('work_start_time', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work End Time
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 5:00 pm"
                  value={formData.preferences.work_end_time}
                  onChange={(e) => handlePreferenceChange('work_end_time', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breakfast Time
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 8:00 am"
                  value={formData.preferences.preferred_meal_times.breakfast}
                  onChange={(e) => handleMealTimeChange('breakfast', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lunch Time
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 1:00 pm"
                  value={formData.preferences.preferred_meal_times.lunch}
                  onChange={(e) => handleMealTimeChange('lunch', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dinner Time
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 7:00 pm"
                  value={formData.preferences.preferred_meal_times.dinner}
                  onChange={(e) => handleMealTimeChange('dinner', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.preferences.preferred_break_duration}
                  onChange={(e) => handlePreferenceChange('preferred_break_duration', parseInt(e.target.value) || 0)}
                  min="5"
                  max="60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.preferences.exercise_duration}
                  onChange={(e) => handlePreferenceChange('exercise_duration', parseInt(e.target.value) || 0)}
                  min="0"
                  max="180"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mindfulness Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.preferences.mindfulness_duration}
                  onChange={(e) => handlePreferenceChange('mindfulness_duration', parseInt(e.target.value) || 0)}
                  min="0"
                  max="60"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className={`w-full px-4 py-3 rounded-md text-white font-medium ${
                isLoading || !formData.moodText.trim() || !moodData
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              disabled={isLoading || !formData.moodText.trim() || !moodData}
            >
              {isLoading ? 'Creating Schedule...' : 'Create My Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleCreator;
import React, { useState } from 'react';

const CustomScheduler = ({ createCustomSchedule, isLoading, moodData }) => {
  const [formData, setFormData] = useState({
    tasks: [{ name: '', duration_minutes: 30, priority: 'medium' }],
    timeRange: { start_time: '', end_time: '' },
    fixedEvents: [{ title: '', start_time: '', end_time: '', is_flexible: false }],
    userPreferences: {
      break_frequency_minutes: 60,
      break_duration_minutes: 10,
      task_order_preference: 'priority_first',
      work_chunk_preference: 'focused'
    },
    moodText: ''
  });

  const [showFixedEvents, setShowFixedEvents] = useState(true);
  const [includeMood, setIncludeMood] = useState(false);

  // Handle task changes
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setFormData(prev => ({ ...prev, tasks: updatedTasks }));
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { name: '', duration_minutes: 30, priority: 'medium' }]
    }));
  };

  const removeTask = (index) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks.splice(index, 1);
    setFormData(prev => ({ ...prev, tasks: updatedTasks }));
  };

  // Handle time range changes
  const handleTimeRangeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      timeRange: { ...prev.timeRange, [field]: value }
    }));
  };

  // Handle fixed events changes
  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...formData.fixedEvents];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    setFormData(prev => ({ ...prev, fixedEvents: updatedEvents }));
  };

  const addEvent = () => {
    setFormData(prev => ({
      ...prev,
      fixedEvents: [...prev.fixedEvents, { title: '', start_time: '', end_time: '', is_flexible: false }]
    }));
  };

  const removeEvent = (index) => {
    const updatedEvents = [...formData.fixedEvents];
    updatedEvents.splice(index, 1);
    setFormData(prev => ({ ...prev, fixedEvents: updatedEvents }));
  };

  // Handle preference changes
  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      userPreferences: { ...prev.userPreferences, [field]: value }
    }));
  };

  // Handle mood text change
  const handleMoodTextChange = (e) => {
    setFormData(prev => ({ ...prev, moodText: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty tasks
    const filteredTasks = formData.tasks
      .filter(task => task.name.trim() !== '')
      .map(task => ({
        name: task.name,
        duration_minutes: task.duration_minutes,
        priority: task.priority
      }));
    
    // Format time range
    const timeRange = formData.timeRange.start_time && formData.timeRange.end_time
      ? { start_time: formData.timeRange.start_time, end_time: formData.timeRange.end_time }
      : null;
    
    // Filter out empty fixed events
    const filteredEvents = showFixedEvents
      ? formData.fixedEvents
          .filter(event => event.title.trim() !== '' && event.start_time.trim() !== '' && event.end_time.trim() !== '')
          .map(event => ({
            title: event.title,
            start_time: event.start_time,
            end_time: event.end_time,
            is_flexible: event.is_flexible
          }))
      : null;
    
    // Only include mood text if checkbox is checked
    const moodText = includeMood ? formData.moodText : null;
    
    await createCustomSchedule(
      filteredTasks,
      timeRange,
      filteredEvents,
      formData.userPreferences,
      moodText
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Custom Schedule Creator</h2>
        <p className="mb-6 text-gray-600">
          Create a focused schedule for a specific time period with your own tasks and constraints.
        </p>
        
        {/* Add a note recommending mood analysis when includeMood is checked but no mood data exists */}
        {includeMood && !moodData && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            Please analyze your mood first to get a more personalized custom schedule.
            <div className="mt-2">
              <button 
                onClick={() => window.location.href = '#mood'}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                Go to Mood Analysis
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Tasks Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Tasks to Schedule</h3>
            
            {formData.tasks.map((task, index) => (
              <div key={index} className="mb-4 p-3 border border-gray-200 rounded-md">
                <div className="mb-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Task name"
                    value={task.name}
                    onChange={(e) => handleTaskChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={task.duration_minutes}
                      onChange={(e) => handleTaskChange(index, 'duration_minutes', parseInt(e.target.value) || 0)}
                      min="5"
                      max="480"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={task.priority}
                      onChange={(e) => handleTaskChange(index, 'priority', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    onClick={() => removeTask(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 px-3 py-1 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
              onClick={addTask}
            >
              + Add Task
            </button>
          </div>
          
          {/* Time Range Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Scheduling Time Range</h3>
            <p className="text-sm text-gray-600 mb-3">
              Specify the time period you want to schedule tasks for (e.g., afternoon only, evening only).
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 2:00 pm"
                  value={formData.timeRange.start_time}
                  onChange={(e) => handleTimeRangeChange('start_time', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 6:00 pm"
                  value={formData.timeRange.end_time}
                  onChange={(e) => handleTimeRangeChange('end_time', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Fixed Events Section (Collapsible) */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <h3 className="text-lg font-medium text-gray-700">Fixed Events</h3>
              <button
                type="button"
                className="ml-3 px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                onClick={() => setShowFixedEvents(!showFixedEvents)}
              >
                {showFixedEvents ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showFixedEvents && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Add any fixed events or commitments that cannot be moved (meetings, appointments, etc.).
                </p>
                
                {formData.fixedEvents.map((event, index) => (
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
                        placeholder="Start time (e.g., 3:00 pm)"
                        value={event.start_time}
                        onChange={(e) => handleEventChange(index, 'start_time', e.target.value)}
                      />
                      <input
                        type="text"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="End time (e.g., 4:00 pm)"
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
              </>
            )}
          </div>
          
          {/* Preferences Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Scheduling Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Frequency (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.userPreferences.break_frequency_minutes}
                  onChange={(e) => handlePreferenceChange('break_frequency_minutes', parseInt(e.target.value) || 0)}
                  min="0"
                  max="120"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How often to take breaks (0 for no automatic breaks)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.userPreferences.break_duration_minutes}
                  onChange={(e) => handlePreferenceChange('break_duration_minutes', parseInt(e.target.value) || 0)}
                  min="0"
                  max="30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How long each break should be
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Order Preference
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.userPreferences.task_order_preference}
                  onChange={(e) => handlePreferenceChange('task_order_preference', e.target.value)}
                >
                  <option value="priority_first">Priority First</option>
                  <option value="shortest_first">Shortest Tasks First</option>
                  <option value="longest_first">Longest Tasks First</option>
                  <option value="mixed">Mixed (Balanced)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How to prioritize tasks when scheduling
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Style
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.userPreferences.work_chunk_preference}
                  onChange={(e) => handlePreferenceChange('work_chunk_preference', e.target.value)}
                >
                  <option value="focused">Focused (Complete one task before starting another)</option>
                  <option value="pomodoro">Pomodoro (Work in short bursts with regular breaks)</option>
                  <option value="varied">Varied (Mix different tasks throughout the day)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Your preferred working style
                </p>
              </div>
            </div>
          </div>
          
          {/* Mood Section (Optional) */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-mood"
                  checked={includeMood}
                  onChange={() => setIncludeMood(!includeMood)}
                  className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="include-mood" className="text-lg font-medium text-gray-700">
                  Include Mood Analysis (Optional)
                </label>
              </div>
            </div>
            
            {includeMood && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Describe your current mood to help optimize the schedule for your energy level.
                </p>
                
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Describe your current mood and energy level..."
                  value={formData.moodText}
                  onChange={handleMoodTextChange}
                ></textarea>
              </>
            )}
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className={`w-full px-4 py-3 rounded-md text-white font-medium ${
                isLoading || formData.tasks.every(task => !task.name.trim()) || (includeMood && !moodData)
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              disabled={isLoading || formData.tasks.every(task => !task.name.trim()) || (includeMood && !moodData)}
            >
              {isLoading ? 'Creating Schedule...' : 'Create Custom Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomScheduler;
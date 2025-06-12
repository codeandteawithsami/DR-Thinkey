import React, { useState } from 'react';

const ScheduleViewer = ({ scheduleData, adjustSchedule, isLoading }) => {
  const [completedActivities, setCompletedActivities] = useState([]);
  const [newEvents, setNewEvents] = useState([
    { title: '', start_time: '', end_time: '', is_flexible: false }
  ]);
  const [newMoodText, setNewMoodText] = useState('');
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustmentInProgress, setAdjustmentInProgress] = useState(false);

  // Extract the actual schedule based on which API was used
  const schedule = scheduleData.schedule || 
                  scheduleData.custom_schedule || 
                  (scheduleData.adjusted_schedule ? scheduleData.adjusted_schedule : null);
  
  // Extract the mood analysis if available
  const moodAnalysis = scheduleData.mood_analysis || 
                      scheduleData.updated_mood_analysis || 
                      null;
  
  // Handle toggling activity completion status
  const toggleActivityCompletion = (activity) => {
    setCompletedActivities(prev => {
      if (prev.includes(activity)) {
        return prev.filter(a => a !== activity);
      } else {
        return [...prev, activity];
      }
    });
  };

  // Handle new event changes
  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...newEvents];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    setNewEvents(updatedEvents);
  };

  const addNewEvent = () => {
    setNewEvents(prev => [
      ...prev, 
      { title: '', start_time: '', end_time: '', is_flexible: false }
    ]);
  };

  const removeNewEvent = (index) => {
    const updatedEvents = [...newEvents];
    updatedEvents.splice(index, 1);
    setNewEvents(updatedEvents);
  };

  // Handle schedule adjustment submission
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustmentInProgress(true);
    
    // Filter out empty events
    const filteredNewEvents = newEvents
      .filter(event => event.title.trim() !== '' && event.start_time.trim() !== '' && event.end_time.trim() !== '')
      .map(event => ({
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        is_flexible: event.is_flexible
      }));
    
    try {
      await adjustSchedule(
        schedule,
        newMoodText,
        completedActivities,
        filteredNewEvents
      );
      
      // Reset the form after successful adjustment
      setShowAdjustForm(false);
      setNewEvents([{ title: '', start_time: '', end_time: '', is_flexible: false }]);
      setNewMoodText('');
    } catch (error) {
      console.error('Error adjusting schedule:', error);
    } finally {
      setAdjustmentInProgress(false);
    }
  };

  // Format time for display (e.g., "14:00" to "2:00 PM")
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // Check if already in a user-friendly format
      if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
        return timeString;
      }
      
      // Otherwise, convert 24-hour format to 12-hour format
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
      return timeString;
    }
  };

  // Get color class based on activity type
  const getActivityColorClass = (activityType) => {
    const colorMap = {
      'work': 'bg-blue-100 text-blue-800',
      'break': 'bg-green-100 text-green-800',
      'meal': 'bg-yellow-100 text-yellow-800',
      'exercise': 'bg-orange-100 text-orange-800',
      'mindfulness': 'bg-purple-100 text-purple-800',
      'other': 'bg-gray-100 text-gray-800',
      'task': 'bg-indigo-100 text-indigo-800',
      'fixed_event': 'bg-red-100 text-red-800'
    };
    
    return colorMap[activityType] || 'bg-gray-100 text-gray-800';
  };

  if (!schedule) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Schedule Viewer</h2>
          <p className="text-gray-600">No schedule data available. Please create a schedule first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Your Schedule</h2>
        
        {moodAnalysis && (
          <div className="mb-6 p-4 bg-purple-50 rounded-md">
            <h3 className="text-lg font-medium mb-2 text-purple-700">Mood Analysis:</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {moodAnalysis["Mood tags"]?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Energy Level: <span className="font-medium">{moodAnalysis.Energy}</span>
            </p>
          </div>
        )}
        
        {schedule?.day_summary && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Day Summary:</h3>
            <p className="text-gray-600">{schedule.day_summary}</p>
          </div>
        )}
        
        {schedule?.schedule_summary && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Schedule Summary:</h3>
            <p className="text-gray-600">{schedule.schedule_summary}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700">Daily Schedule:</h3>
          
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 text-sm font-medium text-gray-700 p-3">
              <div className="col-span-2">Time</div>
              <div className="col-span-3">Activity</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2">Status</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {schedule.schedule ? (
                schedule.schedule.map((item, index) => (
                  <div key={index} className={`grid grid-cols-12 p-3 text-sm ${
                    completedActivities.includes(item.activity) ? 'bg-gray-50' : ''
                  }`}>
                    <div className="col-span-2 font-medium">
                      {formatTime(item.time)}
                    </div>
                    <div className="col-span-3">
                      {item.activity}
                    </div>
                    <div className="col-span-2">
                      {item.duration_minutes} min
                    </div>
                    <div className="col-span-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        getActivityColorClass(item.activity_type)
                      }`}>
                        {item.activity_type}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        className={`px-2 py-1 rounded text-xs ${
                          completedActivities.includes(item.activity)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleActivityCompletion(item.activity)}
                      >
                        {completedActivities.includes(item.activity) ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No schedule items available.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {schedule?.unscheduled_tasks && schedule.unscheduled_tasks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Unscheduled Tasks:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {schedule.unscheduled_tasks.map((task, index) => (
                <li key={index}>{task}</li>
              ))}
            </ul>
          </div>
        )}
        
        {schedule?.mood_based_recommendations && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Recommendations Based on Your Mood:</h3>
            
            {schedule.mood_based_recommendations.energy_management && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Energy Management:</h4>
                <p className="text-sm text-gray-600">
                  {schedule.mood_based_recommendations.energy_management}
                </p>
              </div>
            )}
            
            {schedule.mood_based_recommendations.break_activities && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Break Activities:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {schedule.mood_based_recommendations.break_activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {schedule.mood_based_recommendations.recommended_meals && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Recommended Meals:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {schedule.mood_based_recommendations.recommended_meals.map((meal, index) => (
                    <li key={index}>{meal}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {schedule.mood_based_recommendations.mindfulness_practices && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Mindfulness Practices:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {schedule.mood_based_recommendations.mindfulness_practices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {schedule?.recommendations && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">General Recommendations:</h3>
            <p className="text-gray-600">{schedule.recommendations}</p>
          </div>
        )}
        
        {schedule?.adaptability_notes && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-700">Adaptability Notes:</h3>
            <p className="text-gray-600">{schedule.adaptability_notes}</p>
          </div>
        )}
        
        {/* Adjust Schedule Form Toggle */}
        <div className="mt-8">
          <button
            type="button"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            onClick={() => setShowAdjustForm(!showAdjustForm)}
          >
            {showAdjustForm ? 'Hide Adjustment Form' : 'Adjust Your Schedule'}
          </button>
        </div>
        
        {/* Adjust Schedule Form */}
        {showAdjustForm && (
          <div className="mt-6 p-6 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium mb-4 text-gray-700">Adjust Your Schedule</h3>
            
            <form onSubmit={handleAdjustSubmit}>
              <div className="mb-6">
                <h4 className="text-base font-medium mb-2 text-gray-700">How are you feeling now?</h4>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Describe your current mood and energy level..."
                  value={newMoodText}
                  onChange={(e) => setNewMoodText(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <h4 className="text-base font-medium mb-2 text-gray-700">Add New Events</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Add any new events or commitments that have come up.
                </p>
                
                {newEvents.map((event, index) => (
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
                        id={`new-flexible-${index}`}
                        checked={event.is_flexible}
                        onChange={(e) => handleEventChange(index, 'is_flexible', e.target.checked)}
                        className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor={`new-flexible-${index}`} className="text-sm text-gray-600">
                        This event can be moved if needed
                      </label>
                      
                      <button
                        type="button"
                        className="ml-auto px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                        onClick={() => removeNewEvent(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="mt-2 px-3 py-1 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
                  onClick={addNewEvent}
                >
                  + Add Event
                </button>
              </div>
              
              <div className="mb-6">
                <h4 className="text-base font-medium mb-2 text-gray-700">Completed Activities</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Selected activities will be marked as completed in the adjusted schedule.
                </p>
                
                <div className="p-3 border border-gray-200 rounded-md">
                  <div className="max-h-60 overflow-y-auto">
                    {schedule.schedule && schedule.schedule.length > 0 ? (
                      schedule.schedule.map((item, index) => (
                        <div key={index} className="flex items-center mb-2 last:mb-0">
                          <input
                            type="checkbox"
                            id={`completion-${index}`}
                            checked={completedActivities.includes(item.activity)}
                            onChange={() => toggleActivityCompletion(item.activity)}
                            className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor={`completion-${index}`} className="text-sm text-gray-600">
                            {item.activity} ({formatTime(item.time)})
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No activities available.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  className={`w-full px-4 py-3 rounded-md text-white font-medium ${
                    adjustmentInProgress || !newMoodText.trim()
                      ? 'bg-purple-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  disabled={adjustmentInProgress || !newMoodText.trim()}
                >
                  {adjustmentInProgress ? 'Adjusting Schedule...' : 'Adjust My Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleViewer;
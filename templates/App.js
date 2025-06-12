import React, { useState, useEffect } from 'react';
import './App.css';
import MoodAnalyzer from './components/MoodAnalyzer';
import ScheduleCreator from './components/ScheduleCreator';
import CustomScheduler from './components/CustomScheduler';
import ScheduleViewer from './components/ScheduleViewer';
import Navbar from './components/Navbar';

function App() {
  const [activeTab, setActiveTab] = useState('mood');
  const [moodData, setMoodData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API config - would be in .env in a real app
  const API_URL = 'http://localhost:8000';

  const analyzeMood = async (moodText) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/analyze-mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_text: moodText })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze mood');
      }
      
      const data = await response.json();
      setMoodData(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing mood:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createSchedule = async (moodText, dailyGoals, calendarEvents, preferences) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/create-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_text: moodText,
          daily_goals: dailyGoals,
          calendar_events: calendarEvents,
          preferences: preferences
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }
      
      const data = await response.json();
      setScheduleData(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating schedule:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomSchedule = async (tasks, timeRange, fixedEvents, userPreferences, moodText) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/create-custom-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks,
          time_range: timeRange,
          fixed_events: fixedEvents,
          user_preferences: userPreferences,
          mood_text: moodText
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create custom schedule');
      }
      
      const data = await response.json();
      setScheduleData(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating custom schedule:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const adjustSchedule = async (currentSchedule, moodText, completedActivities, newEvents) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/adjust-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_schedule: currentSchedule,
          mood_text: moodText,
          completed_activities: completedActivities,
          new_events: newEvents
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to adjust schedule');
      }
      
      const data = await response.json();
      setScheduleData(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error adjusting schedule:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {activeTab === 'mood' && (
          <MoodAnalyzer 
            analyzeMood={analyzeMood} 
            moodData={moodData}
            isLoading={isLoading} 
          />
        )}
        
        {activeTab === 'schedule' && (
          <ScheduleCreator 
            createSchedule={createSchedule}
            moodData={moodData}
            isLoading={isLoading}
          />
        )}
        
        {activeTab === 'custom' && (
          <CustomScheduler 
            createCustomSchedule={createCustomSchedule}
            isLoading={isLoading}
          />
        )}
        
        {activeTab === 'view' && scheduleData && (
          <ScheduleViewer 
            scheduleData={scheduleData}
            adjustSchedule={adjustSchedule}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default App;
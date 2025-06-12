import os 
import json 
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
from tavily import TavilyClient 
from .utils import parse_json_response
from crewai import Agent, Task, Crew, Process

# load Configuration
load_dotenv()

# keys
# OPENAI_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API = os.getenv("TAVILY_API_KEY")

class Life_Scheduler:
    def __init__(self):
        self.tavily_client = TavilyClient(api_key=TAVILY_API)
        self.setup_agents()
        
    def setup_agents(self):
        self.Life_Scheduler_Agent = Agent(
            role="Life Scheduler Agent",
            goal="Create balanced daily schedules that promote productivity, mental wellbeing, and physical health",
            backstory="""You are a Life Scheduler Agent. Your goal is to create personalized daily schedules 
                       that balance productivity, mental health, and physical wellbeing for users.
                       
                       You understand how to structure a day to maximize energy and focus while preventing burnout.
                       You know that different moods and energy levels require different approaches to scheduling.
                       
                       You care about:
                       - Proper work/break balance (typically 50-60 min work followed by 10-15 min breaks)
                       - Regular meals and hydration
                       - Physical movement and exercise
                       - Mental health practices (meditation, mindfulness, relaxation)
                       - Productivity optimization based on user energy levels
                       - Buffer time between tasks to reduce stress
                       - Realistic scheduling that accounts for travel/transition time
                       """,
            allow_delegation=False,
        )
            
    def normalize_time_format(self, time_str: str) -> str:
        """
        Convert various time formats to 24-hour format (HH:MM).
        Handles formats like "9:00", "9:00 am", "9:00 AM", "9 am", etc.
        
        Args:
            time_str: Time string in various formats
            
        Returns:
            Time string in 24-hour format (HH:MM)
        """
        # Strip any whitespace
        time_str = time_str.strip()
        
        # Handle various formats using datetime
        try:
            # Check if AM/PM is in the string
            is_am_pm = any(marker in time_str.lower() for marker in ['am', 'pm'])
            
            if is_am_pm:
                # Try AM/PM formats
                for fmt in ["%I:%M %p", "%I:%M%p", "%I %p"]:
                    try:
                        parsed_time = datetime.strptime(time_str, fmt)
                        return parsed_time.strftime("%H:%M")
                    except ValueError:
                        continue
            else:
                # Already in 24-hour format, just standardize
                try:
                    parsed_time = datetime.strptime(time_str, "%H:%M")
                    return parsed_time.strftime("%H:%M")
                except ValueError:
                    pass
                    
                # Try other 24-hour variants
                try:
                    # For single-digit hour like "9:00"
                    if len(time_str.split(':')[0]) == 1:
                        parsed_time = datetime.strptime(f"0{time_str}", "%H:%M")
                        return parsed_time.strftime("%H:%M")
                except Exception:
                    pass
        except Exception as e:
            print(f"Error parsing time: {e}")
            
        # If all else fails, try our best to format it or return original
        try:
            # Simple handling for common formats
            if "am" in time_str.lower() or "a.m." in time_str.lower():
                # Extract hours and minutes using string operations
                parts = time_str.lower().replace("a.m.", "am").split("am")[0].strip()
                if ":" in parts:
                    hrs, mins = parts.split(":")
                    hrs = int(hrs)
                    mins = int(mins)
                    if hrs == 12:
                        hrs = 0
                else:
                    hrs = int(parts)
                    mins = 0
                return f"{hrs:02d}:{mins:02d}"
                
            elif "pm" in time_str.lower() or "p.m." in time_str.lower():
                # Extract hours and minutes using string operations
                parts = time_str.lower().replace("p.m.", "pm").split("pm")[0].strip()
                if ":" in parts:
                    hrs, mins = parts.split(":")
                    hrs = int(hrs)
                    mins = int(mins)
                else:
                    hrs = int(parts)
                    mins = 0
                    
                if hrs < 12:
                    hrs += 12
                    
                return f"{hrs:02d}:{mins:02d}"
                
            # Just has hours and minutes
            elif ":" in time_str:
                hrs, mins = time_str.split(":")
                return f"{int(hrs):02d}:{int(mins):02d}"
        except Exception:
            pass
            
        # If all else fails, return original and log warning
        print(f"WARNING: Could not normalize time format: {time_str}")
        return time_str
        
    def preprocess_events(self, events: List[Dict]) -> List[Dict]:
        """
        Normalize time formats in all events
        
        Args:
            events: List of event dictionaries
            
        Returns:
            List of events with normalized time formats
        """
        if not events:
            return []
            
        processed = []
        for event in events:
            # Create a copy of the event to avoid modifying the original
            processed_event = event.copy()
            
            # Normalize start and end times if present
            if "start_time" in processed_event:
                processed_event["start_time"] = self.normalize_time_format(processed_event["start_time"])
            if "end_time" in processed_event:
                processed_event["end_time"] = self.normalize_time_format(processed_event["end_time"])
                
            processed.append(processed_event)
            
        return processed
    
    def create_schedule(self, 
                       mood_data: Dict, 
                       daily_goals: Optional[List[str]] = None,
                       calendar_events: Optional[List[Dict]] = None,
                       preferences: Optional[Dict] = None) -> Dict:
        """
        Create a personalized daily schedule based on mood analysis and user preferences.
        
        Args:
            mood_data: Dictionary containing mood analysis results
            daily_goals: List of goals the user wants to accomplish today
            calendar_events: List of existing calendar events to incorporate
            preferences: Dictionary of user preferences for scheduling
            
        Returns:
            Dictionary containing the schedule and recommendations
        """
        
        # Set defaults if not provided
        if daily_goals is None:
            daily_goals = []
            
        if calendar_events is None:
            calendar_events = []
        else:
            # Normalize time formats in events
            calendar_events = self.preprocess_events(calendar_events)
            
        if preferences is None:
            preferences = {
                "work_start_time": "09:00",
                "work_end_time": "17:00",
                "preferred_break_duration": 15,  # minutes
                "preferred_meal_times": {
                    "breakfast": "08:00",
                    "lunch": "12:30",
                    "dinner": "18:30"
                },
                "exercise_duration": 30,  # minutes
                "mindfulness_duration": 10  # minutes
            }
        else:
            # Normalize time formats in preferences
            if "work_start_time" in preferences:
                preferences["work_start_time"] = self.normalize_time_format(preferences["work_start_time"])
            if "work_end_time" in preferences:
                preferences["work_end_time"] = self.normalize_time_format(preferences["work_end_time"])
            if "preferred_meal_times" in preferences:
                for meal, time in preferences["preferred_meal_times"].items():
                    preferences["preferred_meal_times"][meal] = self.normalize_time_format(time)
            
        # Create task description with all available information
        task_description = f"""
        Create a personalized daily schedule based on the following information:
        
        MOOD ANALYSIS:
        {json.dumps(mood_data, indent=2)}
        
        DAILY GOALS:
        {json.dumps(daily_goals, indent=2)}
        
        EXISTING CALENDAR EVENTS:
        {json.dumps(calendar_events, indent=2)}
        
        USER PREFERENCES:
        {json.dumps(preferences, indent=2)}
        
        Consider the user's mood, energy level, and provide a schedule that balances productivity,
        wellbeing, and necessary breaks. Include specific recommendations for meals, activities,
        and mindfulness practices based on their current mood.
        
        Important: Your schedule should cover the FULL day including both daytime and evening activities.
        Make sure to include evening activities like dinner, exercise, relaxation, and personal time.
        """
        
        task = Task(
            description=task_description,
            agent=self.Life_Scheduler_Agent,
            expected_output="""A JSON string in the format
            {
                "schedule": [
                    {
                        "time": "HH:MM",
                        "duration_minutes": 30,
                        "activity": "Activity description",
                        "activity_type": "work/break/meal/exercise/mindfulness/other",
                        "notes": "Optional notes or recommendations"
                    },
                    ...
                ],
                "day_summary": "Overall assessment of the day structure",
                "mood_based_recommendations": {
                    "energy_management": "...",
                    "break_activities": ["...", "..."],
                    "recommended_meals": ["...", "..."],
                    "mindfulness_practices": ["...", "..."]
                },
                "adaptability_notes": "Suggestions for adjusting if energy/mood changes"
            }
            """
        )
        
        crew = Crew(
            agents=[self.Life_Scheduler_Agent],
            tasks=[task],
            process=Process.sequential
        )
        
        results = crew.kickoff()
        return parse_json_response(str(results))
        
    def adjust_schedule(self, 
                      current_schedule: Dict, 
                      new_mood_data: Dict,
                      completed_activities: Optional[List[str]] = None,
                      new_events: Optional[List[Dict]] = None) -> Dict:
        """
        Adjust an existing schedule based on changed mood or new events.
        
        Args:
            current_schedule: The existing schedule dictionary
            new_mood_data: Updated mood analysis results
            completed_activities: List of activities already completed
            new_events: Any new calendar events that need to be incorporated
            
        Returns:
            Updated schedule dictionary
        """
        if completed_activities is None:
            completed_activities = []
            
        if new_events is None:
            new_events = []
        else:
            # Normalize time formats in new events
            new_events = self.preprocess_events(new_events)
            
        task_description = f"""
        Adjust the existing daily schedule based on the following changes:
        
        CURRENT SCHEDULE:
        {json.dumps(current_schedule, indent=2)}
        
        UPDATED MOOD ANALYSIS:
        {json.dumps(new_mood_data, indent=2)}
        
        COMPLETED ACTIVITIES:
        {json.dumps(completed_activities, indent=2)}
        
        NEW EVENTS TO INCORPORATE:
        {json.dumps(new_events, indent=2)}
        
        Modify the remaining schedule to account for the user's changed mood/energy
        and any new events, while ensuring they still accomplish their important goals.
        Remember to maintain a good balance between work activities and personal time,
        especially for evening activities.
        """
        
        task = Task(
            description=task_description,
            agent=self.Life_Scheduler_Agent,
            expected_output="""A JSON string with the updated schedule in the same format as the original,
            plus a change_summary field explaining the adjustments made and why.
            """
        )
        
        crew = Crew(
            agents=[self.Life_Scheduler_Agent],
            tasks=[task],
            process=Process.sequential
        )
        
        results = crew.kickoff()
        return parse_json_response(str(results))
    
    def create_custom_schedule(self, 
                         tasks: List[Dict],
                         time_range: Optional[Dict] = None,
                         fixed_events: Optional[List[Dict]] = None,
                         user_preferences: Optional[Dict] = None,
                         mood_data: Optional[Dict] = None) -> Dict:
            """
            Create a fully customized schedule based on user tasks and constraints.
            
            Args:
                tasks: List of tasks the user wants to schedule, each with at least a name and duration
                    [{"name": "Study calculus", "duration_minutes": 60, "priority": "high"}, ...]
                time_range: Optional dictionary specifying the time period to schedule
                            {"start_time": "14:00", "end_time": "20:00"}
                fixed_events: Optional list of events that cannot be moved (meetings, classes, etc.)
                user_preferences: Optional dictionary with user scheduling preferences
                mood_data: Optional dictionary with mood analysis results
                
            Returns:
                Dictionary containing the schedule
            """

if __name__ == '__main__':
    # Example usage
    l_scheduler = Life_Scheduler()
    
    # Example mood data (similar to what would come from Mood_Analyzer)
    sample_mood = {
        "Mood tags": ["happy", "excited", "energetic"],
        "Energy": "High",
        "Cravings": ["healthy food", "fresh fruits"],
        "confidence score": "High",
        "personalized tips": "Channel your positive energy into creative tasks"
    }
    
    # Sample goals and events
    sample_goals = [
        "Office",
        "Finish remaining project", 
        "Exercise", 
        "Call Family",
        "Dinner",
        "Prayer",
        "Meetings"
    ]
    
    sample_events = [
        {
            "title": "Office", 
            "start_time": "9:00 am", 
            "end_time": "6:00 pm", 
            "is_flexible": False
        },
        {
            "title": "Meetings", 
            "start_time": "9:00 am", 
            "end_time": "9:40 am", 
            "is_flexible": False
        },
        {
            "title": "Exercise", 
            "start_time": "7:30 pm", 
            "end_time": "8:30 pm", 
            "is_flexible": True
        },
        {
            "title": "Dinner", 
            "start_time": "8:45 pm", 
            "end_time": "9:30 pm", 
            "is_flexible": True
        },
        {
            "title": "Prayer", 
            "start_time": "9:45 pm", 
            "end_time": "10:15 pm", 
            "is_flexible": False
        }
    ]
    
    preferences = {
        "work_start_time": "9:00 am",
        "work_end_time": "6:00 pm",
        "preferred_break_duration": 15,
        "preferred_meal_times": {
            "breakfast": "8:00 am",
            "lunch": "1:30 pm",
            "dinner": "8:45 pm"
        },
        "exercise_duration": 60,
        "mindfulness_duration": 15
    }
    
    # Create an initial schedule
    schedule = l_scheduler.create_schedule(
        mood_data=sample_mood,
        daily_goals=sample_goals, 
        calendar_events=sample_events,
        preferences=preferences
    )
    
    print("Initial Schedule:")
    print(json.dumps(schedule, indent=2))
    
    # Later, mood changes - simulate adjustment
    new_mood = {
        "Mood tags": ["tired", "stressed"],
        "Energy": "Low",
        "Cravings": ["comfort food", "coffee"],
        "confidence score": "Medium",
        "personalized tips": "Take more frequent breaks and practice deep breathing"
    }
    
    # Update the schedule with new mood
    adjusted_schedule = l_scheduler.adjust_schedule(
        current_schedule=schedule,
        new_mood_data=new_mood,
        completed_activities=["Office", "Meetings", "Lunch break"],
        new_events=[{"title": "Unexpected Family Video Call", "start_time": "7:00 pm", "end_time": "7:45 pm", "is_flexible": False}]
    )
    
    print("\nAdjusted Schedule:")
    print(json.dumps(adjusted_schedule, indent=2))
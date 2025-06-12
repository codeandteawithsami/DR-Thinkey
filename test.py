import requests
import json
from pprint import pprint

# API endpoint (assuming running locally)
BASE_URL = "http://localhost:8000"

def test_thinky_agents():
    print("=== Testing Thinky Agents ===\n")
    
    # 1. First test just the mood analyzer
    print("STEP 1: Testing Mood Analyzer")
    mood_text = "I slept poorly last night and have an important presentation today. I'm feeling anxious but also determined to do well. I'm craving something comforting like coffee and pastries."
    
    mood_response = requests.post(
        f"{BASE_URL}/analyze-mood",
        json={"mood_text": mood_text}
    )
    
    mood_analysis = mood_response.json()
    print("\nMood Analysis Result:")
    pprint(mood_analysis)
    
    # 2. Now test the full scheduling with the mood analysis
    print("\n\nSTEP 2: Testing Life Scheduler (Initial Schedule)")
    
    daily_goals = [
        "Office",
        "Finish remaining project", 
        "Exercise", 
        "Call Family",
        "Dinner",
        "Prayer",
        "Meetings"
    ]
    
    calendar_events = [
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
    
    schedule_response = requests.post(
        f"{BASE_URL}/create-schedule",
        json={
            "mood_text": mood_text,
            "daily_goals": daily_goals,
            "calendar_events": calendar_events,
            "preferences": preferences
        }
    )
    
    schedule_result = schedule_response.json()
    print("\nInitial Schedule Result:")
    pprint(schedule_result)
    
    # 3. Later in the day, mood has changed - test schedule adjustment
    print("\n\nSTEP 3: Testing Schedule Adjustment")
    
    new_mood_text = "I'm feeling tired after work but I know I need to exercise. I'm also hungry and craving some comfort food."
    
    # We'd normally use the full schedule from step 2, but simplified here
    current_schedule = schedule_result["schedule"]
    
    completed_activities = [
        "Office", 
        "Meetings",
        "Lunch break"
    ]
    
    new_events = [
        {
            "title": "Unexpected Family Video Call",
            "start_time": "7:00 pm",
            "end_time": "7:45 pm",
            "is_flexible": False
        }
    ]
    
    adjust_response = requests.post(
        f"{BASE_URL}/adjust-schedule",
        json={
            "current_schedule": current_schedule,
            "mood_text": new_mood_text,
            "completed_activities": completed_activities,
            "new_events": new_events
        }
    )
    
    adjusted_result = adjust_response.json()
    print("\nAdjusted Schedule Result:")
    pprint(adjusted_result)

if __name__ == "__main__":
    test_thinky_agents()
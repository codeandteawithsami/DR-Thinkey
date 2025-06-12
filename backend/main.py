from pydantic import BaseModel
from typing import List, Optional, Dict
from fastapi import FastAPI, Query, Response
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from Thinky_agent.Nutritionist import Nutritionist
from Thinky_agent.Mood_Analyzer import Mood_Analyzer
from Thinky_agent.Life_Scheduler import Life_Scheduler


app = FastAPI(
    title = "Thinky Multi Crew API",
    description="Your AI-powered personal life mentor — helping you think smarter, feel better, and live fully.",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agents Initialization
mood_analyzer = Mood_Analyzer()
life_scheduler = Life_Scheduler()
nutritionist = Nutritionist()

# Request models
class MoodRequest(BaseModel):
    mood_text: str

class ScheduleRequest(BaseModel):
    mood_text: str
    daily_goals: Optional[List[str]] = None
    calendar_events: Optional[List[Dict]] = None
    preferences: Optional[Dict] = None

class ScheduleAdjustRequest(BaseModel):
    current_schedule: Dict
    mood_text: str
    completed_activities: Optional[List[str]] = None
    new_events: Optional[List[Dict]] = None
    
class CustomScheduleRequest(BaseModel):
    tasks: List[Dict]
    time_range: Optional[Dict] = None
    fixed_events: Optional[List[Dict]] = None
    user_preferences: Optional[Dict] = None
    mood_text: Optional[str] = None
    
class NutritionPlanRequest(BaseModel):
    mood_data: Dict
    medical_conditions: Optional[List[str]] = None
    dietary_preferences: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    goals: Optional[str] = None

# Routes

@app.get("/status", response_class=PlainTextResponse)
async def health_check():
    return "{Status: Live}"

@app.post("/analyze-mood")
def analyze_mood(req: MoodRequest):
    result = mood_analyzer.analyze_mood(topic=req.mood_text)
    return result

@app.post("/create-schedule")
def create_schedule(req: ScheduleRequest):
    # First analyze the mood
    mood_result = mood_analyzer.analyze_mood(topic=req.mood_text)
    
    # Then use the mood data to create a schedule
    schedule_result = life_scheduler.create_schedule(
        mood_data=mood_result,
        daily_goals=req.daily_goals,
        calendar_events=req.calendar_events,
        preferences=req.preferences
    )
    
    return {
        "mood_analysis": mood_result,
        "schedule": schedule_result
    }
    

@app.post("/adjust-schedule")
def adjust_schedule(req: ScheduleAdjustRequest):
    # First analyze the current mood
    new_mood_result = mood_analyzer.analyze_mood(topic=req.mood_text)
    
    # Then adjust the schedule based on the new mood
    adjusted_schedule = life_scheduler.adjust_schedule(
        current_schedule=req.current_schedule,
        new_mood_data=new_mood_result,
        completed_activities=req.completed_activities,
        new_events=req.new_events
    )
    
    return {
        "updated_mood_analysis": new_mood_result,
        "adjusted_schedule": adjusted_schedule
    }

@app.post("/create-custom-schedule")
def create_custom_schedule(req: CustomScheduleRequest):
    # Analyze mood if text is provided
    mood_result = None
    if req.mood_text:
        mood_result = mood_analyzer.analyze_mood(topic=req.mood_text)
    
    # Create a custom schedule
    custom_schedule = life_scheduler.create_custom_schedule(
        tasks=req.tasks,
        time_range=req.time_range,
        fixed_events=req.fixed_events,
        user_preferences=req.user_preferences,
        mood_data=mood_result
    )
    
    response = {"custom_schedule": custom_schedule}
    
    # Include mood analysis if it was requested
    if mood_result:
        response["mood_analysis"] = mood_result
        
    return response

@app.post("/nutrition-plan")
def generate_nutrition_plan(req: NutritionPlanRequest):
    # Call your agent logic here, for example:
    result = nutritionist.nutritional(
        mood_data=req.mood_data,
        medical_conditions=req.medical_conditions,
        dietary_preferences=req.dietary_preferences,
        allergies=req.allergies,
        goals=req.goals
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
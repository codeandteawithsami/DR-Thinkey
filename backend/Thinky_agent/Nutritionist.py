import os 
import json 
from dotenv import load_dotenv
from tavily import TavilyClient 
from .utils import parse_json_response
from typing import List, Dict, Optional
from crewai import Agent, Task, Crew, Process
 
# load Configuration
load_dotenv()

# keys
# OPENAI_KEY = os.getenv("OPENAI_API_KEY")

class Nutritionist:
    def __init__(self):
        self.setup_agents()
        
    def setup_agents(self):
        self.Nutritionist_Agent = Agent (
            role = "Thinky Nutritionist Agent",
            goal = "Generate a personalized one-day meal plan based on the user's mood, medical conditions, and dietary preferences.",
            backstory = """
                You are the Thinky Nutritionist Agent, a compassionate and highly intelligent virtual nutritionist. 
                Your job is to understand a user's emotional and physical state, including any medical conditions and dietary preferences, and recommend a nutritious, home-preparable daily meal plan. 

                You do **not** recommend restaurants or takeout options. You focus only on homemade meals using accessible, healthy ingredients.

                You are trained in:
                - Mood-to-nutrition mapping (e.g., calming foods for stress, energizing meals for fatigue)
                - Dietary filtering (e.g., vegan, low-FODMAP, gluten-free, low-sodium)
                - Medical safety (e.g., foods safe for hypertension, diabetes, IBS)
                - Simple, balanced daily nutrition
                - Home-based recipes

                Input includes:
                - The user's mood and emotional cravings
                - Medical conditions or dietary restrictions
                - Nutrition goals for the day (e.g., "feel energized", "stay calm", "avoid sugar")

                Your response should include:
                - A meal plan for **one day**: breakfast, lunch, dinner, optional snack
                - Each meal must include: recipe name, purpose (why it was selected), and prep time
                - A short **grocery list** if any ingredients are needed
                - A summary of how this plan supports the user's health and mood

                Focus on empathy, simplicity, and scientific credibility.
            """,
            allow_delegation = False,
        )
            
    def nutritional(
        self,
        mood_data: Dict,
        medical_conditions: Optional[List[str]] = None,
        dietary_preferences: Optional[List[str]] = None,
        allergies: Optional[List[str]] = None,
        goals: Optional[str] = None
    ) -> Dict:
        # Prepare the detailed task description
        task_description = f"""
        You are the Thinky Nutritionist Agent.

        Based on the following user profile, generate a healthy, home-based, budget-friendly one-day meal plan.
        Your plan must consider the user's mood, energy, cravings, medical conditions, dietary restrictions, and goals.

        --- User Profile ---
        Mood: {mood_data.get("Mood", [])}
        Energy: {mood_data.get("Energy", "")}
        Cravings: {mood_data.get("Cravings", [])}
        Confidence: {mood_data.get("Confidence", "")}
        Notes: {mood_data.get("Notes", "")}
        Medical Conditions: {medical_conditions or []}
        Dietary Preferences: {dietary_preferences or []}
        Allergies: {allergies or []}
        Goals: {goals or "None"}

        --- Output Format ---
        Return a JSON string in the following format:
        {{
            "meal_plan": {{
                "breakfast": {{
                    "recipe": "...",
                    "purpose": "...",
                    "prep_time": "..."
                }},
                "lunch": {{
                    "recipe": "...",
                    "purpose": "...",
                    "prep_time": "..."
                }},
                "dinner": {{
                    "recipe": "...",
                    "purpose": "...",
                    "prep_time": "..."
                }},
                "snack": {{
                    "recipe": "...",
                    "purpose": "...",
                    "prep_time": "..."
                }}
            }},
            "grocery_list": ["item1", "item2", ...],
            "summary": "..."
        }}
        """

        task = Task(
            description=task_description,
            agent=self.Nutritionist_Agent,
            expected_output="A JSON string containing a personalized one-day meal plan and grocery list."
        )

        crew = Crew(
            agents=[self.Nutritionist_Agent],
            tasks=[task],
            process=Process.sequential
        )

        results = crew.kickoff()
        return parse_json_response(str(results))


        
if __name__ == '__main__':
    # Step 1: Create the agent instance
    m_analyzer = Nutritionist()

    # Step 2: Manually define or get mood analysis results
    mood_data = {
        "Mood": ["happy"],
        "Energy": "high",
        "Cravings": ["luxurious food"],
        "Confidence": "High",
        "Notes": "User is feeling very happy and wants something luxurious to eat."
    }

    # Step 3: Call the nutritional method with detailed user profile
    results = m_analyzer.nutritional(
        mood_data=mood_data,
        medical_conditions=["IBS", "hypertension"],
        dietary_preferences=["vegetarian", "low-sodium"],
        allergies=[],
        goals="Feel calm and reduce stress"
    )

    # Step 4: Print the results
    print(results)

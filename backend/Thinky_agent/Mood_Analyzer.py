import os 
import json 
from typing import List, Dict 
from dotenv import load_dotenv
from tavily import TavilyClient 
from .utils import parse_json_response
from crewai import Agent, Task, Crew, Process
 
# load Configuration
load_dotenv()

# keys
# OPENAI_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API = os.getenv("TAVILY_API_KEY")

class Mood_Analyzer:
    def __init__(self):
        self.tavily_client = TavilyClient(api_key = TAVILY_API)
        self.setup_agents()
        
    def setup_agents(self):
        self.Mood_Analyzer_Agent = Agent (
            role = "Mood Analyzer Agent",
            goal = "Understand the user's current mood and cravings.",
            backstory = """You are a Mood Analyzer Agent. Your goal is to analyze the user's text input and identify their current emotional and mental state. 

                            Analyze the user's input and categorize their mood into one or more of the following predefined moods:
                            [
                            "happy",
                            "sad",
                            "excited",
                            "tired",
                            "anxious",
                            "angry",
                            "calm",
                            "bored",
                            "stressed",
                            "nostalgic",
                            "romantic",
                            "celebratory",
                            "craving_sweets",
                            "craving_spicy",
                            "craving_comfort_food"
                            ]""",
            allow_delegation = False,
        )
            
    def analyze_mood(self, topic : str) -> Dict:
        task = Task(
            description = f"Access the user's Mood for: {topic} return the results in JSON format",
            agent=self.Mood_Analyzer_Agent,
            expected_output="""A JSON string in the format
            {
                "Mood tags":["<mood1>","<mood2>", ...],
                "Energy":"<low/medium/High>,
                "Cravings":["spicy food", ...]
                "confidence score":"High/Low/Medium",
                "personalized tips": "..."
            }
            """
        )
        crew = Crew(
            agents = [self.Mood_Analyzer_Agent],
            tasks = [task],
            process = Process.sequential
        )
        
        results = crew.kickoff()
        return parse_json_response(str(results))
        
if __name__ == '__main__':
    m_analyzer = Mood_Analyzer()
    results = m_analyzer.analyze_mood(topic="I am feeling very happy I got my laptop today and I want to eat some good luxurious food")
    print(results)
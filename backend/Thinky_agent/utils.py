import json 
from typing import List, Dict 

def parse_json_response(response: str) -> Dict:
    """Parse JSON from the agent's response, handling potential text before/after the JSON."""
    try:
        # First try to parse the entire response as JSON
        return json.loads(response)
    except json.JSONDecodeError:
        # If that fails, try to find JSON within the response
        try:
            # Look for JSON array pattern
            if '{' in response and '}' in response:
                start = response.find('{')
                end = response.rfind('}') + 1
                json_str = response[start:end]
                return json.loads(json_str)

            # Look for JSON array pattern next
            elif '[' in response and ']' in response:
                start = response.find('[')
                end = response.rfind(']') + 1
                json_str = response[start:end]
                return json.loads(json_str)
            
            # If no valid JSON structure found
            return {"error": "No valid JSON structure found", "raw_response": response}
        
        except (json.JSONDecodeError, ValueError) as e:
            # If JSON parsing fails, return error with details
            return {
                "error": f"Failed to parse response: {str(e)}", 
                "raw_response": response
            }
    
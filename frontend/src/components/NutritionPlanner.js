import React, { useState, useEffect } from 'react';

const NutritionPlanner = ({ moodData, generateNutritionPlan, nutritionPlanData, isLoading }) => {
  const [formData, setFormData] = useState({
    medicalConditions: [''],
    dietaryPreferences: [''],
    allergies: [''],
    goals: ''
  });
  const [localNutritionPlan, setLocalNutritionPlan] = useState(nutritionPlanData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset the local nutrition plan when mood data changes
    setLocalNutritionPlan(null);
  }, [moodData]);

  useEffect(() => {
    // Update local nutrition plan when the prop changes
    setLocalNutritionPlan(nutritionPlanData);
  }, [nutritionPlanData]);

  const handleConditionChange = (index, value) => {
    const updated = [...formData.medicalConditions];
    updated[index] = value;
    setFormData(prev => ({ ...prev, medicalConditions: updated }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: [...prev.medicalConditions, '']
    }));
  };

  const removeCondition = (index) => {
    const updated = [...formData.medicalConditions];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, medicalConditions: updated }));
  };

  const handlePreferenceChange = (index, value) => {
    const updated = [...formData.dietaryPreferences];
    updated[index] = value;
    setFormData(prev => ({ ...prev, dietaryPreferences: updated }));
  };

  const addPreference = () => {
    setFormData(prev => ({
      ...prev,
      dietaryPreferences: [...prev.dietaryPreferences, '']
    }));
  };

  const removePreference = (index) => {
    const updated = [...formData.dietaryPreferences];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, dietaryPreferences: updated }));
  };

  const handleAllergyChange = (index, value) => {
    const updated = [...formData.allergies];
    updated[index] = value;
    setFormData(prev => ({ ...prev, allergies: updated }));
  };

  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, '']
    }));
  };

  const removeAllergy = (index) => {
    const updated = [...formData.allergies];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, allergies: updated }));
  };

  const handleGoalsChange = (e) => {
    setFormData(prev => ({ ...prev, goals: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!moodData) {
      setError("Please analyze your mood first before creating a nutrition plan.");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Filter out empty fields
      const filteredMedicalConditions = formData.medicalConditions.filter(item => item.trim() !== '');
      const filteredDietaryPreferences = formData.dietaryPreferences.filter(item => item.trim() !== '');
      const filteredAllergies = formData.allergies.filter(item => item.trim() !== '');
      
      const result = await generateNutritionPlan(
        moodData,
        filteredMedicalConditions,
        filteredDietaryPreferences,
        filteredAllergies,
        formData.goals
      );
      
      if (result) {
        setLocalNutritionPlan(result);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error generating nutrition plan:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">Nutrition Planner</h2>
        <p className="mb-6 text-gray-600">
          Get a personalized one-day meal plan based on your mood and dietary needs.
        </p>
        
        {!moodData && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            Please analyze your mood first to get a more personalized nutrition plan.
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
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Medical Conditions Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Medical Conditions</h3>
            <p className="text-sm text-gray-600 mb-3">
              List any medical conditions that might affect your nutrition needs.
            </p>
            
            {formData.medicalConditions.map((condition, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Condition ${index + 1} (e.g., diabetes, hypertension)`}
                  value={condition}
                  onChange={(e) => handleConditionChange(index, e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                  onClick={() => removeCondition(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 px-3 py-1 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
              onClick={addCondition}
            >
              + Add Medical Condition
            </button>
          </div>
          
          {/* Dietary Preferences Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Dietary Preferences</h3>
            <p className="text-sm text-gray-600 mb-3">
              List your dietary preferences or restrictions.
            </p>
            
            {formData.dietaryPreferences.map((preference, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Preference ${index + 1} (e.g., vegetarian, low-carb)`}
                  value={preference}
                  onChange={(e) => handlePreferenceChange(index, e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                  onClick={() => removePreference(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 px-3 py-1 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
              onClick={addPreference}
            >
              + Add Dietary Preference
            </button>
          </div>
          
          {/* Allergies Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Food Allergies</h3>
            <p className="text-sm text-gray-600 mb-3">
              List any food allergies or intolerances.
            </p>
            
            {formData.allergies.map((allergy, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={`Allergy ${index + 1} (e.g., peanuts, shellfish)`}
                  value={allergy}
                  onChange={(e) => handleAllergyChange(index, e.target.value)}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                  onClick={() => removeAllergy(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              className="mt-2 px-3 py-1 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
              onClick={addAllergy}
            >
              + Add Allergy
            </button>
          </div>
          
          {/* Nutrition Goals Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Nutrition Goals</h3>
            <p className="text-sm text-gray-600 mb-3">
              What are your nutrition or health goals for today?
            </p>
            
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="E.g., boost energy, reduce stress, maintain healthy blood sugar levels, etc."
              value={formData.goals}
              onChange={handleGoalsChange}
            ></textarea>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className={`w-full px-4 py-3 rounded-md text-white font-medium ${
                submitting || isLoading || !moodData
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              disabled={submitting || isLoading || !moodData}
            >
              {submitting ? 'Generating Plan...' : 'Create Nutrition Plan'}
            </button>
          </div>
        </form>
      </div>
      
      {localNutritionPlan && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700">Your One-Day Meal Plan</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-purple-600">Breakfast</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-2">
                <span className="font-medium text-gray-700">Recipe:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.breakfast?.recipe || "Not specified"}</span>
              </div>
              <div className="mb-2">
                <span className="font-medium text-gray-700">Purpose:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.breakfast?.purpose || "Not specified"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prep Time:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.breakfast?.prep_time || "Not specified"}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-purple-600">Lunch</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-2">
                <span className="font-medium text-gray-700">Recipe:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.lunch?.recipe || "Not specified"}</span>
              </div>
              <div className="mb-2">
                <span className="font-medium text-gray-700">Purpose:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.lunch?.purpose || "Not specified"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prep Time:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.lunch?.prep_time || "Not specified"}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-purple-600">Dinner</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-2">
                <span className="font-medium text-gray-700">Recipe:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.dinner?.recipe || "Not specified"}</span>
              </div>
              <div className="mb-2">
                <span className="font-medium text-gray-700">Purpose:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.dinner?.purpose || "Not specified"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prep Time:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.dinner?.prep_time || "Not specified"}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-purple-600">Snack</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-2">
                <span className="font-medium text-gray-700">Recipe:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.snack?.recipe || "Not specified"}</span>
              </div>
              <div className="mb-2">
                <span className="font-medium text-gray-700">Purpose:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.snack?.purpose || "Not specified"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prep Time:</span>{" "}
                <span className="text-gray-600">{localNutritionPlan.meal_plan?.snack?.prep_time || "Not specified"}</span>
              </div>
            </div>
          </div>
          
          {localNutritionPlan.grocery_list && localNutritionPlan.grocery_list.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-purple-600">Grocery List</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <ul className="list-disc list-inside text-gray-600">
                  {localNutritionPlan.grocery_list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {localNutritionPlan.summary && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3 text-purple-600">Summary</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-gray-600">{localNutritionPlan.summary}</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Print Meal Plan
            </button>
            <button
              onClick={() => setLocalNutritionPlan(null)}
              className="px-4 py-2 border border-purple-500 text-purple-500 rounded-md hover:bg-purple-50"
            >
              Create New Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPlanner;
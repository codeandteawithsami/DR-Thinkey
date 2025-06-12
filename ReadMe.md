# Thinky Life Scheduler - Setup Guide

This guide will help you set up the complete Thinky Life Scheduler application with both backend and frontend components.

## Project Structure

```
thinky-project/
├── backend/                      # FastAPI backend
│   ├── Thinky_agent/             # Agent modules
│   │   ├── __init__.py
│   │   ├── Life_Scheduler.py     # Life Scheduler agent
│   │   ├── Mood_Analyzer.py      # Mood Analyzer agent
│   │   └── utils.py              # Utility functions
│   ├── main.py                   # FastAPI application
│   └── requirements.txt          # Backend dependencies
└── frontend/                     # React frontend
    ├── public/
    ├── src/
    │   ├── components/           # React components
    │   │   ├── CustomScheduler.js
    │   │   ├── MoodAnalyzer.js
    │   │   ├── Navbar.js
    │   │   ├── ScheduleCreator.js
    │   │   └── ScheduleViewer.js
    │   ├── App.css               # Custom styles
    │   ├── App.js                # Main React component
    │   └── index.js              # React entry point
    ├── package.json              # Frontend dependencies
    └── tailwind.config.js        # Tailwind CSS configuration
```

## Backend Setup

1. Create a Python virtual environment:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:

   ```bash
   pip install fastapi uvicorn pydantic crewai python-dotenv tavily
   ```
3. Create a `.env` file in the backend directory with your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```
4. Start the backend server:

   ```bash
   uvicorn main:app --reload
   ```

## Frontend Setup

1. Create a new React application:

   ```bash
   npx create-react-app frontend
   cd frontend
   ```
2. Install additional dependencies:

   ```bash
   npm install tailwindcss postcss autoprefixer
   ```
3. Initialize Tailwind CSS:

   ```bash
   npx tailwindcss init -p
   ```
4. Copy the files you created into the appropriate locations:

   - Copy `App.js` to `src/App.js`
   - Copy `App.css` to `src/App.css`
   - Create a `components` folder in `src` and copy all component files there
   - Copy `tailwind.config.js` to the root directory
5. Configure your Tailwind CSS by updating the content array in `tailwind.config.js`
6. Start the development server:

   ```bash
   npm start
   ```

## Integration

1. Ensure the backend API is running on `http://localhost:8000`
2. The frontend by default will run on `http://localhost:3000`
3. If you need to change the API URL in the frontend, modify the `API_URL` constant in `App.js`

## Adding More Agents

To add more agents to the system:

1. Create a new agent file in the `Thinky_agent` directory
2. Update the `main.py` file to include endpoints for the new agent
3. Create a new component in the frontend to interact with the agent
4. Update the `App.js` and navigation to include the new component

## Deployment

For production deployment:

### Backend

1. Install Gunicorn:

   ```bash
   pip install gunicorn
   ```
2. Create a `Procfile` for Heroku or other platforms:

   ```
   web: gunicorn -k uvicorn.workers.UvicornWorker main:app
   ```
3. Set environment variables for your production environment

### Frontend

1. Build the React application:

   ```bash
   npm run build
   ```
2. Serve the static files from the `build` directory using Nginx, Vercel, Netlify, or similar

## Customization

### Adding New Features

The architecture is designed to be modular and expandable:

1. **New Agent Types**: Create additional agent files in the backend's `Thinky_agent` directory
2. **New API Endpoints**: Add new routes to `main.py` to support the new functionality
3. **New UI Components**: Create new React components in the frontend's `components` directory
4. **Styling Changes**: Modify `App.css` or extend the Tailwind configuration

### Authentication

For user-specific schedules and settings:

1. Implement authentication in the FastAPI backend using:

   ```bash
   pip install fastapi-users
   ```
2. Create user models and authentication routes
3. Add login/signup components to the frontend
4. Store JWT tokens in localStorage or HTTP-only cookies

## Troubleshooting

### Backend Issues

- **API Key Errors**: Ensure `.env` file is properly loaded and API keys are correct
- **CORS Errors**: Check the CORS middleware configuration in `main.py`
- **CrewAI Errors**: Make sure you're using the latest version of CrewAI

### Frontend Issues

- **API Connection**: Verify the backend URL is correct in `App.js`
- **React Component Errors**: Check the browser console for specific error messages
- **Styling Issues**: Ensure Tailwind is properly configured

## Future Enhancements

Here are some ideas to further enhance the application:

1. **Calendar Integration**: Add Google Calendar or other calendar API integration
2. **Data Persistence**: Add a database to store schedules and user preferences
3. **Mobile App**: Convert to a mobile app using React Native
4. **Schedule Templates**: Allow users to save and reuse schedule templates
5. **Analytics Dashboard**: Add visualizations of productivity and mood trends
6. **Multi-language Support**: Add internationalization using i18next
7. **Notifications**: Implement push notifications or email reminders
8. **Speech Recognition**: Add voice input for mood analysis

## Contributing

Feel free to expand upon this project! Some areas that could use improvement:

1. Test coverage for both frontend and backend
2. Improved error handling and user feedback
3. More sophisticated schedule optimization algorithms
4. Additional agent types for specific domains or use cases

## License

This project is licensed under the MIT License.

ArenaFlow – Full Stack Tournament Management System
Team Members
1. Reem Nemr 202404869
2. Shahd Qaddoura - 202400829
3. Rawad Hachem - 202306730

Project Overview
ArenaFlow is a volleyball tournament management system that allows users to create, manage, and participate in tournaments.
In Phase 2, the frontend developed in Phase 1 was integrated with a backend API, database, and authentication system to create a fully functional full-stack application.

Backend Tech Stack:
- Node.js
- Express.js
- Database
- MongoDB with Mongoose
- Authentication
- JSON Web Tokens (JWT)
- bcrypt

Deployment
Backend: Render / Cyclic / Heroku
Frontend: Vercel
Live Links
Frontend: https://arena-flow-coral.vercel.app/
Backend API: [Add your deployed backend link]

Running the Project Locally
1. Clone the repositories
git clone https://github.com/reemnii/ArenaFlow/
git clone https://github.com/reemnii/ArenaFlow-Backend

2. Backend Setup
- cd backend
- npm install
- Create a .env file:
    PORT=5000
    MONGO_URI=your_mongodb_connection
    JWT_SECRET=your_secret_key
    CLIENT_URL=http://localhost:5000
- Run the backend server: npm run dev

3. Frontend Setup
- cd frontend
- npm install
- npm run dev

Authentication
Users can register and log in
Passwords are hashed using bcrypt before storage
A JWT token is issued upon login
Protected routes require a valid token

Authorization header format:
Authorization: Bearer <token>
Main Entities
User
- username
- email
- password (hashed)

Tournament
- name
- type
- location
- date
- status
- registrationStatus
- prize
- maxTeams
- description
- createdBy

Team
- name
- coachName
- players
- tournamentId

API Documentation
1. Authentication Routes
- Register: POST /api/auth/register
{
  "username": "reem",
  "email": "reem@email.com",
  "password": "123456"
}

- Login: POST /api/auth/login

2. Tournament Routes
- Get all tournaments: GET /api/tournaments
- Get one tournament: GET /api/tournaments/:id
- Create tournament (protected): POST /api/tournaments
- Update tournament (protected): PUT /api/tournaments/:id
- Delete tournament (protected): DELETE /api/tournaments/:id
Only the creator or an authorized user can update or delete a tournament.

3. Team Routes
- Get all teams: GET /api/teams
- Get team by ID: GET /api/teams/:id
- Get teams for a tournament: GET /api/tournaments/:id/teams

4. Error Handling
- All API responses follow a consistent format:
{
  "success": false,
  "message": "Error message"
}

- Common status codes:
400: Validation error
401: Unauthorized
404: Resource not found
500: Server error

Full-Stack Integration
- Frontend components fetch data from the backend API
- Mock data has been replaced with real API calls
- Forms send requests to backend endpoints
- Application state updates dynamically based on API responses
- User feedback is provided through loading and error messages

Testing
The API was tested using Thunder Client.
Tested scenarios include:
- User registration and login
- Viewing tournaments
- Creating a tournament
- Updating and deleting owned tournaments
- Viewing teams

Deployment
- Backend deployed to a cloud service
- Frontend deployed separately
- CORS configured to allow communication between frontend and backend
- Environment variables are used for sensitive configuration

Team Contributions
1. Reem Nemr
Backend structure and architecture
Database design and models
Tournament CRUD operations
Authorization logic
Error handling

2. Shahd Qaddoura
Authentication system
JWT middleware
Login and registration integration
Protected routes

3. Rawad Hachem
Team routes implementation
Frontend integration
Deployment setup
Final testing and quality assurance

Challenges
- Ensuring consistency between frontend and backend field names
- Implementing secure authentication using JWT
- Handling protected routes and authorization logic
- Integrating frontend with backend API
- Coordinating API structure across team members

Notes
The API follows RESTful design principles
The backend is structured into routes, controllers, models, and middleware
All responses follow a consistent JSON format

Screenshots / Demo
Add screenshots or a GIF demonstrating the final application here.


# Task Management API

A comprehensive task management system built with Django REST Framework, featuring user authentication, task CRUD operations, and a modern web interface.

## Project Overview

This project implements a Task Management API that allows users to create, read, update, and delete tasks with full user authentication and authorization. Each user can manage their own tasks securely with no access to other users' data.

## Features Implemented

### Core Requirements ✅

#### Task Management (CRUD)

- ✅ Create, Read, Update, Delete tasks
- ✅ Task attributes: Title, Description, Due Date, Priority Level (Low/Medium/High), Status (Pending/Completed)
- ✅ Due date validation (must be in future)
- ✅ Priority level restrictions
- ✅ Proper status updates

#### User Management (CRUD)

- ✅ User registration and authentication
- ✅ Unique Username, Email, Password
- ✅ User isolation - each user manages only their own tasks
- ✅ Token-based authentication

#### Task Completion Management

- ✅ Endpoint to mark tasks complete/incomplete
- ✅ Completed tasks cannot be edited unless reverted to incomplete
- ✅ Completion timestamp tracking

#### Task Filtering and Sorting

- ✅ Filter by Status (Pending/Completed)
- ✅ Filter by Priority Level
- ✅ Filter by Due Date
- ✅ Sort by Due Date
- ✅ Sort by Priority Level
- ✅ Search functionality

### Technical Implementation ✅

#### Database

- ✅ Django ORM with SQLite
- ✅ Task and User models with proper relationships
- ✅ User-specific task access only

#### Authentication

- ✅ Django's built-in authentication system
- ✅ Token-based authentication for API access
- ✅ Login required for task management

#### API Design

- ✅ Django REST Framework implementation
- ✅ RESTful design principles
- ✅ Proper HTTP methods (GET, POST, PUT, DELETE)
- ✅ Appropriate HTTP status codes
- ✅ Error handling

#### Task Ownership

- ✅ Tasks accessible only to creators
- ✅ Permission checks prevent unauthorized access

### Stretch Goals Implemented ✅

#### Task Categories

- ✅ User-specific categories (Work, Personal, Health, Learning, Shopping)
- ✅ Category assignment for tasks
- ✅ Category-based filtering

## Technology Stack

- **Backend**: Django 5.2.5, Django REST Framework
- **Database**: SQLite
- **Authentication**: Token-based authentication
- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Styling**: Modern CSS with custom properties and responsive design

## API Endpoints

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration

### Tasks

- `GET /api/tasks/` - List user's tasks (with filtering and search)
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/{id}/` - Retrieve specific task
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `PATCH /api/tasks/{id}/toggle/` - Toggle task completion

### Categories

- `GET /api/categories/` - List user's categories
- `POST /api/categories/` - Create new category
- `GET /api/categories/{id}/` - Retrieve specific category
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

## Installation and Setup

### Prerequisites

- Python 3.8+
- pip

### Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd Task-Management
```

2. **Create virtual environment**

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install django djangorestframework python-decouple
```

4. **Apply migrations**

```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser (optional)**

```bash
python manage.py createsuperuser
```

6. **Run development server**

```bash
python manage.py runserver
```

7. **Access the application**

- API: http://localhost:8000/api/
- Frontend: Open `frontend/index.html` in browser
- Admin: http://localhost:8000/admin/

## Usage

### API Usage

#### Authentication

```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'
```

#### Task Management

```bash
# Create task (with authentication token)
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete project", "description": "Finish the task management API", "priority": "high"}'

# List tasks with filters
curl -X GET "http://localhost:8000/api/tasks/?priority=high&completed=false" \
  -H "Authorization: Token YOUR_TOKEN"

# Toggle task completion
curl -X PATCH http://localhost:8000/api/tasks/1/toggle/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### Frontend Usage

1. Open `frontend/index.html` in a web browser
2. Register a new account or login with existing credentials
3. Create categories for better task organization
4. Add tasks with titles, descriptions, due dates, and priorities
5. Use search and filters to find specific tasks
6. Mark tasks as complete/incomplete
7. Edit or delete tasks as needed

## Project Structure

```
Task-Management/
├── task_management/          # Django project settings
├── tasks/                    # Main app
│   ├── models.py            # Task and Category models
│   ├── serializers.py       # API serializers
│   ├── views.py             # API views
│   └── urls.py              # URL routing
├── frontend/                # Frontend interface
│   ├── index.html           # Main HTML file
│   ├── css/                 # Stylesheets
│   └── js/                  # JavaScript files
├── db.sqlite3               # SQLite database
└── manage.py                # Django management script
```

## Security Features

- Token-based authentication
- User isolation (users can only access their own tasks)
- Input validation and sanitization
- CORS handling for frontend integration
- Secure password handling with Django's built-in authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is developed as part of the ALX Software Engineering Program.

## Contact

For questions or support, please contact the development team.

# VoiceUp India - Community Concerns Platform

A comprehensive multimedia platform for community concerns and public empowerment in India. This platform allows citizens to raise their voice against issues in society and government by posting photos, videos, and voice recordings as evidence.

## Features

### Core Features
- **User Authentication**: JWT-based authentication with registration and login
- **Issue Reporting**: Create issues with multimedia evidence (photos, videos, audio)
- **Location-based Organization**: Issues organized by city, district, and state levels
- **Voting System**: Upvote/downvote issues and comments
- **Comments & Discussion**: Engage with issues through comments and replies
- **Anonymous Posting**: Option to post issues and comments anonymously
- **Hashtags/Tags**: Categorize issues with tags for better discoverability
- **Search & Filter**: Search issues and filter by location, category, scope, and more
- **Trending Algorithm**: Issues ranked by trending score based on engagement and recency

### Technical Features
- **Django REST Framework**: Comprehensive backend API
- **React + TypeScript**: Modern frontend with type safety
- **File Upload**: Support for images, videos, and audio files
- **Real-time Updates**: Dynamic voting and engagement metrics
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Project Structure

```
vox/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # API utilities and helpers
│   │   └── hooks/        # Custom React hooks
│   └── package.json
├── vox_backend/       # Django project settings
├── core/              # Django app with models, views, serializers
│   ├── models.py      # Database models
│   ├── views.py       # API viewsets
│   ├── serializers.py # DRF serializers
│   └── urls.py        # URL routing
├── manage.py          # Django management script
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm/yarn
- PostgreSQL (optional, SQLite used by default)

### Backend Setup

1. **Install Python dependencies**:
```bash
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt pillow python-decouple
```

2. **Run migrations**:
```bash
python manage.py migrate
```

3. **Populate initial data** (states, districts, cities, categories):
```bash
python manage.py populate_initial_data
```

4. **Create superuser** (optional, for admin access):
```bash
python manage.py createsuperuser
```

5. **Run development server**:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
```

3. **Create environment file** (optional):
Create a `.env` file in the frontend directory:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

4. **Run development server**:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/refresh/` - Refresh JWT token

### Issues
- `GET /api/issues/` - List all issues (with filters)
- `GET /api/issues/{id}/` - Get issue details
- `POST /api/issues/` - Create new issue
- `POST /api/issues/{id}/vote/` - Vote on issue
- `POST /api/issues/{id}/view/` - Track issue view
- `GET /api/issues/{id}/comments/` - Get issue comments

### Comments
- `GET /api/comments/` - List comments
- `POST /api/comments/` - Create comment
- `POST /api/comments/{id}/vote/` - Vote on comment

### Location
- `GET /api/states/` - List all states
- `GET /api/districts/?state={id}` - List districts by state
- `GET /api/cities/?district={id}` - List cities by district

### Categories & Tags
- `GET /api/categories/` - List all categories
- `GET /api/tags/` - List all tags

### Search
- `GET /api/search/?q={query}` - Search issues and tags

## Usage

1. **Register/Login**: Create an account or login to start posting issues
2. **Create Issue**: Click "Create Issue" to report a concern with evidence
3. **Browse Feed**: View issues filtered by location, category, or scope
4. **Engage**: Vote, comment, and share issues to bring attention to important matters
5. **Search**: Use the search functionality to find specific issues or topics

## Development

### Backend Development
- Models are in `core/models.py`
- API views are in `core/views.py`
- Serializers are in `core/serializers.py`
- Admin interface available at `/admin/`

### Frontend Development
- Components use shadcn/ui for consistent styling
- API calls are centralized in `src/lib/api.ts`
- State management uses React hooks and React Query

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the repository.


# Quick Start Guide

## Backend Setup (5 minutes)

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run migrations**:
```bash
python manage.py migrate
```

3. **Populate initial data**:
```bash
python manage.py populate_initial_data
```

4. **Start server**:
```bash
python manage.py runserver
```

Backend will run on `http://localhost:8000`

## Frontend Setup (3 minutes)

1. **Navigate to frontend**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

Frontend will run on `http://localhost:8080`

## First Steps

1. **Create an account**: Go to `/signup` and register
2. **Create an issue**: Click "Post Issue" and fill in the form
3. **Browse issues**: Go to `/feed` to see all issues
4. **Engage**: Vote, comment, and share issues

## Testing the Platform

### Create a Test Issue:
1. Login or signup
2. Click "Post Issue"
3. Fill in:
   - Title: "Test Issue"
   - Description: "This is a test issue"
   - Category: Select any category
   - Location: Select State, District, City
   - Upload a photo (optional)
   - Click "Post Issue"

### Test Features:
- ✅ Vote on issues (upvote/downvote)
- ✅ Comment on issues
- ✅ Filter by location, category, scope
- ✅ Search for issues
- ✅ View issue details with media
- ✅ Post anonymously

## Admin Access

Create a superuser to access Django admin:
```bash
python manage.py createsuperuser
```

Then visit `http://localhost:8000/admin/`

## Troubleshooting

### Backend Issues:
- **Port already in use**: Change port with `python manage.py runserver 8001`
- **Migration errors**: Run `python manage.py migrate --run-syncdb`
- **Import errors**: Make sure all dependencies are installed

### Frontend Issues:
- **API connection errors**: Check that backend is running on port 8000
- **CORS errors**: Backend CORS is configured for localhost:8080
- **Build errors**: Delete `node_modules` and reinstall

## Environment Variables (Optional)

Create `.env` file in frontend directory:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Next Steps

- Customize categories in Django admin
- Add more states/districts/cities using the management command
- Configure email settings for notifications
- Set up production database (PostgreSQL recommended)
- Configure static file serving for production


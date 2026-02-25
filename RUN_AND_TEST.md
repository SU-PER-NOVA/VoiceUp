# Run and Test Guide — VoiceUp Platform

Everything is connected: the frontend (port **8080**) talks to the backend API (port **8000**). Use this guide to run and test the app end-to-end.

---

## 1. Prerequisites

- **Python 3.8+** (with `pip`)
- **Node.js 16+** (with `npm` or `yarn`)

---

## 2. Backend — Run and Prepare

Open a terminal in the project root (`vox`).

### Install dependencies (first time only)

```bash
pip install -r requirements.txt
```

### Apply migrations (first time, or after model changes)

```bash
python manage.py migrate
```

### Load initial data (first time only)

```bash
python manage.py populate_initial_data
```

This creates states, districts, cities, and categories.

### Populate assignment categories (first time, after createsuperuser)

```bash
python manage.py populate_assignment_categories
```

This creates 5 assignment buckets and links issue categories to initiator admins. New grievances are auto-assigned to the initiator of their category.

### Create an admin user (for admin panel and staff access)

```bash
python manage.py createsuperuser
```

- Enter username, email, and password.
- Superusers have `is_staff=True`, so they can use the **Admin** dashboard at `/admin`.

### Start the backend server

```bash
python manage.py runserver
```

- API: **http://localhost:8000/api/**
- Django admin: **http://localhost:8000/admin/** (optional, for backend management)

Leave this terminal running.

---

## 3. Frontend — Run

Open a **second** terminal in the project root.

### Install dependencies (first time only)

```bash
cd frontend
npm install
```

### Start the frontend dev server

```bash
npm run dev
```

- App: **http://localhost:8080** (or the port shown in the terminal)

Leave this terminal running.

### Optional: custom API URL

If the backend is not on `localhost:8000`, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://YOUR_BACKEND_HOST:8000/api
```

Then restart `npm run dev`.

---

## 4. Test Completely

### A. Public flow (no login)

1. Open **http://localhost:8080**.
2. **Home**: Click “Explore Issues” → should open Feed.
3. **Feed**: You should see issues (or “No issues found” if the DB is empty). Use filters (category, state, sort).
4. **Search**: Use the navbar search and submit → Feed with search param.
5. **Issue detail**: Click an issue title → detail page with description, media, comments (if any).

### B. Auth and posting (logged-in user)

1. **Sign up**: Click “Sign up” (or go to `/signup`). Register with email, name, password.
2. **Login**: If you already have an account, go to `/login` and sign in.
3. **Create issue**: Click “Post Issue” (or go to `/create`). Fill title, description, category, state/district/city, optionally tags and media (photo/video/audio). Submit.
4. **Feed**: You should see your new issue. Open it and test **upvote/downvote**.
5. **Comment**: On the issue detail page, add a comment (and optionally “Post Anonymously”). Check that it appears and you can vote on it.

### C. Admin flow (staff user only)

1. **Make a user staff** (if you didn’t use `createsuperuser`):
   - Django shell: `python manage.py shell`
   - Then:
     ```python
     from django.contrib.auth.models import User
     u = User.objects.get(username='YOUR_USERNAME')
     u.is_staff = True
     u.save()
     exit()
     ```
2. **Log in** as that user in the frontend.
3. **Admin entry**: In the navbar user menu you should see **Admin**. Click it (or go to **http://localhost:8080/admin**).
4. **Dashboard**: You should see total grievances, pending count, last 7 days, resolved count, and “By status”.
5. **Grievances list**: Click “Grievances” (or go to `/admin/grievances`). You should see a table of all issues. Use **search** and **status** filter.
6. **Grievance detail**: Click a row’s link to open an issue. You should be able to:
   - Change **Status** (Pending → Under review → In progress → Resolved / Rejected).
   - Toggle **Featured** and **Verified**.
   - Add **Admin notes** (Internal or Public response) and see the list update.
   - Open “View on public site” to see the same issue on the public feed.

### D. Quick connectivity check

- Backend: **http://localhost:8000/api/categories/** → JSON list of categories.
- Frontend: **http://localhost:8080** → home page; after login, Feed and Create Issue should load data from the API.

---

## 5. Summary: Is Everything Connected?

| Piece            | Role                                      | Status        |
|------------------|-------------------------------------------|---------------|
| Backend (8000)   | Serves API + media, CORS for 8080        | ✅ Connected  |
| Frontend (8080)  | Uses `VITE_API_BASE_URL` or localhost:8000| ✅ Connected  |
| Auth             | JWT login/register, `/auth/me` for staff | ✅ Connected  |
| Admin            | Staff-only routes + `/api/admin/*`       | ✅ Connected  |

If anything fails:

- Confirm **both** servers are running (backend on 8000, frontend on 8080).
- Confirm you ran **migrate** and **populate_initial_data**.
- For admin: confirm the user has **is_staff=True** (e.g. created with `createsuperuser` or set in shell).
- Check the browser **Network** tab for failed requests and the backend terminal for errors.

You can use this as your single reference to **run and test completely**.

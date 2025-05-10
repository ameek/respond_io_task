# Respond.io Task

This project is a backend application for managing notes with features like versioning, optimistic locking, full-text search, authentication, and refresh token mechanisms. The application is built using Node.js, Express, Sequelize, and Redis.

---

## Features Implemented
1. **Authentication**:
   - User registration and login.
   - Access token and refresh token mechanism.
   - Logout functionality with refresh token revocation.

2. **Notes Management**:
   - Create, update, delete (soft delete), and retrieve notes.
   - Versioning system for notes with optimistic locking.
   - Revert notes to a previous version.
   - Full-text search for notes by title or content.

3. **Caching**:
   - Frequently accessed endpoints are cached using Redis.
   - Cache invalidation on updates or deletions.

4. **Dockerized Setup**:
   - Dockerfile and `docker-compose.yml` provided for containerized deployment.

---

## Pending Features
### 1. **Share Notes with Permissions**
   - **Objective**: Allow users to share notes with specific permissions (e.g., read-only, edit).
   - **Work Plan**:
     1. Add a `SharedNotes` table to manage shared notes and permissions.
     2. Create API endpoints:
        - Share a note with another user.
        - Retrieve notes shared with the user.
        - Update sharing permissions.
        - Remove sharing.
     3. Implement middleware to enforce permissions (e.g., `read`, `edit`).
     4. Update the `README.md` with usage instructions.

### 2. **Multimedia Attachments**
   - **Objective**: Allow users to upload multimedia files (e.g., images, videos) as part of their notes.
   - **Work Plan**:
     1. Add a file storage solution (e.g., AWS S3, local storage).
     2. Update the `Notes` table to include a field for file URLs.
     3. Create endpoints for uploading and retrieving multimedia files.
     4. Implement file validation (e.g., size, type).


### 3. **Test Cases**
   - **Objective**: Write unit and integration tests for all implemented features.
   - **Work Plan**:
     1. Use a testing framework like Jest or Mocha.
     2. Write test cases for:
        - Authentication (register, login, refresh token, logout).
        - Notes management (CRUD, versioning, revert, search).
        - Caching and Redis integration.
     3. Add a test script in `package.json`.

---

## Environment Variables
Create a `.env` file in the root directory with the following configuration:

```env
# Server Configuration
PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=86400 # 1 day in seconds

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=respond_io_task
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```
## How to start the application
```
git clone <repository_url>
cd respond_io_task
```
install Dependencies 
```
npm install
```
create a Environment Variable in root directory

### run the application
```
docker-compose up --build
```
### 5. **Access the Application**
- API Base URL: `http://localhost:3000`
- Health Check: `GET /`

---

## API Endpoints

### **Authentication**
- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/v1/auth/login`: Login and receive access and refresh tokens.
- `POST /api/v1/auth/refresh-token`: Refresh access and refresh tokens.
- `POST /api/v1/auth/logout`: Logout and revoke the refresh token.

### **Notes**
- `POST /api/v1/notes`: Create a new note.
- `GET /api/v1/notes`: Retrieve all notes.
- `GET /api/v1/notes/search?keyword=<keyword>`: Search notes by keyword.
- `GET /api/v1/notes/:id`: Retrieve a specific note.
- `PUT /api/v1/notes/:id`: Update a note.
- `DELETE /api/v1/notes/:id`: Soft delete a note.
- `POST /api/v1/notes/:id/revert`: Revert a note to a previous version.
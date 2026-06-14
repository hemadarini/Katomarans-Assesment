# Katomarn Authentication & URL Shortener - API Documentation

Base URL: `http://localhost:5000`

---

## 🔒 Authentication Flow
This API implements a secure double-token JWT authentication flow:
1. **Access Token**: Short-lived (15 minutes). Exchanged in the response JSON and must be sent in the `Authorization: Bearer <access_token>` header for protected routes.
2. **Refresh Token**: Long-lived (7 days). Set automatically by the server inside an HTTP-only, secure, `SameSite: Lax` cookie. Verified against the database for rotation/revocation.

---

## 🔑 Authentication Endpoints

### 1. User Signup
Registers a new user account, hashes credentials, and starts a session.
* **URL**: `/api/auth/signup`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-06-14T17:42:30.000Z"
    }
  }
  ```

### 2. User Login
Authenticates user and retrieves access token while setting refresh cookie.
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-06-14T17:42:30.000Z"
    }
  }
  ```

### 3. Refresh Access Token
Issues a new Access Token using the cookie-bound Refresh Token.
* **URL**: `/api/auth/refresh`
* **Method**: `POST`
* **Credentials**: `include` (Requires refresh cookie to be sent automatically)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### 4. Logout Session
Clears client refresh token cookie and invalidates it in the database.
* **URL**: `/api/auth/logout`
* **Method**: `POST`
* **Credentials**: `include`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### 5. Get User Profile (Protected)
Retrieves the logged-in user profile info.
* **URL**: `/api/auth/profile`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-06-14T17:42:30.000Z"
    }
  }
  ```

---

## 🔗 URL Shortening Endpoints

### 1. Shorten URL (Protected)
Creates a unique short code for a long URL, sets an optional expiry date, and registers it to the user's account.
* **URL**: `/api/urls/shorten`
* **Method**: `POST`
* **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`
* **Body**:
  ```json
  {
    "originalUrl": "https://www.google.com/search?q=fullstack+developer+jobs+near+me",
    "expiresAt": "2026-06-20T23:59:00.000Z"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "URL shortened successfully",
    "data": {
      "id": 15,
      "originalUrl": "https://www.google.com/search?q=fullstack+developer+jobs+near+me",
      "shortCode": "a3b8cd",
      "shortUrl": "http://localhost:5000/s/a3b8cd",
      "clicks": 0,
      "expiresAt": "2026-06-20T23:59:00.000Z",
      "createdAt": "2026-06-14T23:25:00.000Z"
    }
  }
  ```

### 2. Get All User URLs (Protected)
Retrieves all URLs shortened by the current logged-in user.
* **URL**: `/api/urls`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "urls": [
      {
        "id": 15,
        "originalUrl": "https://www.google.com/search?q=fullstack+developer+jobs+near+me",
        "shortCode": "a3b8cd",
        "shortUrl": "http://localhost:5000/s/a3b8cd",
        "clicks": 14,
        "createdAt": "2026-06-14T23:25:00.000Z"
      }
    ]
  }
  ```

### 3. Delete Shortened URL (Protected)
Deletes a shortened URL from the user's dashboard.
* **URL**: `/api/urls/:id`
* **Method**: `DELETE`
* **Headers**: `Authorization: Bearer <access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Shortened URL deleted successfully"
  }
  ```

### 4. Redirect Short URL (Public)
Public endpoint that intercepts short URL requests, increments click analytics, and redirects the client to the original long URL.
* **URL**: `/s/:shortCode`
* **Method**: `GET`
* **Headers**: None
* **Action**: Returns a `302 Found` redirect response header.

### 5. Get Short URL Analytics (Protected)
Retrieves granular analytics details for a specific shortened URL, including click trends, user-agent profiling, and complete redirection history.
* **URL**: `/api/urls/:id/analytics`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <access_token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 15,
      "originalUrl": "https://www.google.com/search?q=fullstack+developer+jobs+near+me",
      "shortCode": "a3b8cd",
      "shortUrl": "http://localhost:5000/s/a3b8cd",
      "createdAt": "2026-06-14T23:25:00.000Z",
      "expiresAt": "2026-06-20T23:59:00.000Z",
      "totalClicks": 14,
      "lastVisited": "2026-06-14T23:33:00.000Z",
      "recentVisits": [
        {
          "clickedAt": "2026-06-14T23:33:00.000Z",
          "browser": "Chrome",
          "device": "Mobile"
        },
        {
          "clickedAt": "2026-06-14T23:30:15.000Z",
          "browser": "Safari",
          "device": "Mobile"
        }
      ],
      "browserStats": [
        { "browser": "Chrome", "count": 10 },
        { "browser": "Safari", "count": 4 }
      ],
      "deviceStats": [
        { "device": "Mobile", "count": 14 },
        { "device": "Desktop", "count": 0 }
      ]
    }
  }
  ```


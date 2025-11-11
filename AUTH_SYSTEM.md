# 🔐 Authentication System Documentation

## Overview

The AI Accountant now includes a complete user authentication system with JWT tokens, allowing users to create accounts and securely save their financial data.

## Backend Implementation

### New Components

#### 1. **User Model** (`app/models.py`)
```python
class User(Base):
    id: Primary key
    email: Unique email address
    hashed_password: Bcrypt hashed password
    full_name: User's full name
    account_type: 'individual' or 'company'
    company_name: Company name (for business accounts)
    is_active: Account status
    created_at: Registration timestamp
    updated_at: Last update timestamp
```

#### 2. **Authentication Module** (`app/auth.py`)
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Tokens**: 7-day expiration
- **Token Verification**: Middleware for protected routes
- **User Authentication**: Email/password validation

#### 3. **Auth Router** (`app/routers/auth.py`)

**Endpoints:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - Logout (client-side token deletion)

### Security Features

1. **Password Hashing**
   - Bcrypt algorithm
   - Automatic salt generation
   - Secure password verification

2. **JWT Tokens**
   - HS256 algorithm
   - 7-day expiration
   - Includes user email in payload
   - Bearer token authentication

3. **Protected Routes**
   - All transaction endpoints require authentication
   - User-specific data isolation
   - Automatic user_id filtering

### Database Changes

#### Updated Transaction Model
```python
class Transaction(Base):
    user_id: Foreign key to users table (NEW)
    # ... other fields
```

All transactions are now linked to specific users, ensuring data privacy and isolation.

### API Authentication Flow

1. **Registration**
   ```
   POST /api/auth/signup
   Body: {
     "email": "user@example.com",
     "password": "securepassword",
     "full_name": "John Doe",
     "account_type": "individual"
   }
   Response: {
     "access_token": "jwt_token_here",
     "token_type": "bearer",
     "user": { user_details }
   }
   ```

2. **Login**
   ```
   POST /api/auth/login
   Body: {
     "username": "user@example.com",  # OAuth2 uses 'username'
     "password": "securepassword"
   }
   Response: {
     "access_token": "jwt_token_here",
     "token_type": "bearer",
     "user": { user_details }
   }
   ```

3. **Authenticated Requests**
   ```
   GET /api/transactions
   Headers: {
     "Authorization": "Bearer jwt_token_here"
   }
   ```

### Protected Endpoints

All these endpoints now require authentication:
- `GET /api/transactions` - List user's transactions
- `POST /api/upload` - Upload documents
- `GET /api/reports/*` - All reports
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### User Data Isolation

- Each user can only access their own data
- Transactions filtered by `user_id`
- Reports calculated per user
- Documents stored per user

## Frontend Integration (To Be Implemented)

### Required Components

1. **Login Page**
   - Email/password form
   - Error handling
   - Redirect after login

2. **Signup Page**
   - Registration form
   - Account type selection
   - Password validation

3. **Auth Context**
   - Store JWT token
   - Manage user state
   - Handle logout

4. **Protected Routes**
   - Check authentication
   - Redirect to login
   - Token refresh

5. **API Client Updates**
   - Add Authorization header
   - Handle 401 errors
   - Token storage (localStorage)

### Token Storage

```javascript
// Store token after login/signup
localStorage.setItem('token', response.access_token)
localStorage.setItem('user', JSON.stringify(response.user))

// Add to API requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

// Clear on logout
localStorage.removeItem('token')
localStorage.removeItem('user')
```

## Environment Variables

Add to `.env`:
```bash
SECRET_KEY=your-secret-key-here  # Generate with: openssl rand -hex 32
```

## Database Migration

The database schema has changed. To update:

1. **Option 1: Fresh Start** (Development)
   ```bash
   rm accounting.db
   # Database will be recreated automatically
   ```

2. **Option 2: Migration** (Production)
   ```bash
   # Use Alembic for migrations
   alembic revision --autogenerate -m "Add user authentication"
   alembic upgrade head
   ```

## Security Best Practices

### Implemented
✅ Password hashing with Bcrypt
✅ JWT token authentication
✅ User data isolation
✅ Secure password storage
✅ Token expiration (7 days)

### Recommended
- [ ] HTTPS in production
- [ ] Rate limiting on auth endpoints
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Session management
- [ ] Account lockout after failed attempts

## Testing Authentication

### 1. Register a New User
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User",
    "account_type": "individual"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123"
```

### 3. Access Protected Endpoint
```bash
curl -X GET http://localhost:8000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Error Handling

### Common Errors

**401 Unauthorized**
- Token missing or invalid
- Token expired
- User not found

**400 Bad Request**
- Email already registered
- Invalid email format
- Weak password

**404 Not Found**
- Transaction doesn't belong to user
- User not found

## Next Steps

1. **Restart Backend Server**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Build Frontend Auth UI**
   - Login component
   - Signup component
   - Auth context provider
   - Protected route wrapper

3. **Update API Client**
   - Add token to requests
   - Handle auth errors
   - Implement logout

4. **Test Complete Flow**
   - Register → Login → Upload → View Data → Logout

## API Documentation

Full API documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Support

For issues or questions:
1. Check API documentation
2. Review error messages
3. Verify token is valid
4. Ensure database is up to date

---

**Status**: ✅ Backend Complete | ⏳ Frontend Pending
**Version**: 2.1.0
**Last Updated**: November 2025

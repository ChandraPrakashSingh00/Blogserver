# Medium-like Blogging Platform

A full-stack blogging platform inspired by Medium, built with Node.js, Express, Sequelize, and React.

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Article Management**: Create, read, update, and delete articles with rich text editing
- **Comments System**: Nested comments on articles
- **Like System**: Like/unlike articles
- **Follow System**: Follow other users
- **Tags**: Organize articles with tags
- **User Profiles**: View user profiles with their articles
- **Responsive Design**: Medium-inspired clean and modern UI

## Tech Stack

### Backend
- Node.js & Express
- Sequelize ORM with PostgreSQL
- JWT for authentication
- bcryptjs for password hashing
- Security: Helmet, CORS, Rate Limiting
- Input validation with express-validator

### Frontend
- React 19
- React Router for navigation
- Context API for state management
- React Quill for rich text editing
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medium_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

4. Create PostgreSQL database:
```bash
createdb medium_db
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
Medium_node/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── articleController.js
│   │   ├── commentController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Article.js
│   │   ├── Comment.js
│   │   ├── Like.js
│   │   ├── Follow.js
│   │   ├── Tag.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── articles.js
│   │   ├── comments.js
│   │   └── users.js
│   ├── utils/
│   │   └── jwt.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Articles
- `GET /api/articles` - Get all articles (with pagination, filtering)
- `GET /api/articles/:slug` - Get single article
- `POST /api/articles` - Create article (auth required)
- `PUT /api/articles/:slug` - Update article (auth required, author only)
- `DELETE /api/articles/:slug` - Delete article (auth required, author only)
- `POST /api/articles/:slug/like` - Like/unlike article (auth required)

### Comments
- `GET /api/comments/:slug` - Get comments for article
- `POST /api/comments/:slug` - Create comment (auth required)
- `PUT /api/comments/:id` - Update comment (auth required, author only)
- `DELETE /api/comments/:id` - Delete comment (auth required, author only)

### Users
- `GET /api/users/:username` - Get user profile
- `POST /api/users/:username/follow` - Follow/unfollow user (auth required)
- `PUT /api/users/profile` - Update profile (auth required)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet for security headers
- SQL injection protection (Sequelize ORM)

## Deployment

### Backend
1. Set production environment variables
2. Use a process manager like PM2
3. Set up reverse proxy (nginx)
4. Configure SSL/HTTPS

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Serve the `dist` folder with a web server or CDN

## License

ISC


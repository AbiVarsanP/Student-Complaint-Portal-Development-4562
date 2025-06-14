# STD-Campuz - Student Complaint Management System

A modern, real-time student complaint management system with Neon PostgreSQL database backend.

## 🚀 Features

- **Neon PostgreSQL Database**: Cloud-hosted PostgreSQL database for persistent data storage
- **Multi-User Access**: Multiple users can access and view complaints simultaneously
- **Real-time Updates**: Automatic data refresh every 30 seconds
- **Support/Upvote System**: Students can support complaints with heart-based voting
- **Public Comments**: Anonymous commenting system with timestamps
- **Multiple Image Upload**: Up to 3 images per complaint with automatic compression
- **Location Tagging**: 14+ predefined campus locations (optional field)
- **Admin Dashboard**: Comprehensive management interface with analytics
- **Mobile PWA**: Progressive Web App with "Add to Home Screen" functionality
- **Responsive Design**: Perfect experience on all devices

## 🏗️ Architecture

### Backend (Node.js + Express + Neon PostgreSQL)
- **Database**: Neon PostgreSQL with proper relationships and foreign keys
- **API**: RESTful endpoints for all CRUD operations
- **Real-time**: Polling-based updates for multi-user synchronization
- **Security**: Input validation, parameterized queries, and error handling
- **Cloud Ready**: Environment-based configuration for deployment

### Frontend (React + Vite)
- **Modern React**: Hooks, Context API, and functional components
- **State Management**: Context API for global state
- **UI Framework**: Tailwind CSS for responsive design
- **Animations**: Framer Motion for smooth interactions
- **Charts**: ECharts for admin dashboard analytics

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Neon PostgreSQL database (already configured)

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   The `.env` file is already configured with your Neon database:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_fXr2A4IVDZoz@ep-empty-feather-a5sgxz8x-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   PORT=3001
   NODE_ENV=development
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   This command starts both:
   - Backend server on `http://localhost:3001`
   - Frontend development server on `http://localhost:5173`

4. **Access the Application**
   - **Public Portal**: `http://localhost:5173`
   - **Admin Login**: Username: `Campuz`, Password: `Campuz@001`
   - **API Endpoints**: `http://localhost:3001/api`

### Individual Commands

```bash
# Start only backend server
npm run server

# Start only frontend
npm run client

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🗄️ Database Structure

The system uses Neon PostgreSQL with the following tables:

- **complaints**: Main complaint data with UUID primary keys
- **categories**: Complaint categories (Campus, Hostel, etc.)
- **locations**: Campus locations (Hostel A, Block B, etc.)
- **images**: Base64 encoded images for complaints
- **comments**: Public comments on complaints
- **support**: User support/upvote tracking with unique constraints

## 🌐 API Endpoints

### Health Check
- `GET /api/health` - Check server and database status

### Complaints
- `GET /api/complaints` - Get all complaints with images and comments
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id/status` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint

### Support System
- `POST /api/complaints/:id/support` - Toggle support
- `GET /api/complaints/:id/support/:userIdentifier` - Check user support

### Comments
- `POST /api/complaints/:id/comments` - Add comment

### Categories & Locations
- `GET/POST/DELETE /api/categories` - Manage categories
- `GET/POST/DELETE /api/locations` - Manage locations

### Admin
- `POST /api/admin/login` - Admin authentication (Campuz/Campuz@001)
- `GET /api/stats` - Dashboard statistics

## 🔧 Configuration

### Environment Variables
The following environment variables are configured:

```env
DATABASE_URL=postgresql://neondb_owner:npg_fXr2A4IVDZoz@ep-empty-feather-a5sgxz8x-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

### Database Features
- **Connection Pooling**: Optimized for concurrent connections
- **SSL Security**: Secure connections to Neon database
- **Auto-initialization**: Tables and default data created automatically
- **Foreign Key Constraints**: Data integrity maintained
- **Transaction Support**: ACID compliance for critical operations

## 🚀 Deployment

### Production Environment Variables
For production deployment, update the CORS_ORIGINS:

```env
DATABASE_URL=postgresql://neondb_owner:npg_fXr2A4IVDZoz@ep-empty-feather-a5sgxz8x-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Deploy Backend
1. Deploy to any Node.js hosting service (Vercel, Railway, Render, etc.)
2. Set environment variables in your hosting platform
3. The database will auto-initialize on first connection

### Deploy Frontend
1. Build the frontend: `npm run build`
2. Deploy the `dist/` folder to any static hosting service
3. Update API_BASE URL in production if needed

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Basic offline functionality with service worker
- **App-like Experience**: Runs in standalone mode when installed
- **Fast Loading**: Optimized caching and performance

## 🔒 Security Features

- **SQL Injection Protection**: Parameterized queries with pg library
- **Input Validation**: Server-side validation for all inputs
- **XSS Prevention**: Proper data sanitization
- **CORS Configuration**: Controlled cross-origin access
- **SSL/TLS**: Secure database connections
- **Environment Variables**: Sensitive data in environment configuration

## 📊 Admin Features

- **Dashboard Analytics**: Visual charts and statistics
- **Complaint Management**: View, update, and delete complaints
- **Category Management**: Add/remove complaint categories
- **Location Management**: Add/remove campus locations
- **Real-time Monitoring**: Live updates of complaint status
- **Database Health**: Connection status monitoring

## 🎯 User Features

- **Anonymous Submissions**: Optional name and email fields
- **Image Upload**: Multiple images with automatic compression
- **Location Tagging**: Select specific campus locations (optional)
- **Community Support**: Upvote complaints you care about
- **Public Comments**: Engage in discussions about complaints
- **Real-time Updates**: See new complaints and updates immediately

## 🛠️ Technical Stack

**Backend:**
- Node.js + Express.js
- Neon PostgreSQL (cloud-hosted)
- pg (PostgreSQL client)
- UUID for unique identifiers
- CORS for cross-origin requests
- dotenv for environment configuration

**Frontend:**
- React 18 with Hooks
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- ECharts for data visualization
- React Toastify for notifications

**Development:**
- Vite for fast development
- ESLint for code quality
- Concurrently for multi-process development
- PostCSS + Autoprefixer

## 📞 Support

For issues or questions:
1. Check the console logs for error messages
2. Verify backend server is running on port 3001
3. Test database connection via `/api/health` endpoint
4. Check network connectivity between frontend and backend
5. Verify environment variables are correctly set

## 🔄 Data Persistence

- **Cloud Database**: All data stored in Neon PostgreSQL
- **Automatic Backups**: Neon provides automatic backups
- **High Availability**: Cloud-hosted with redundancy
- **Multi-user**: Supports concurrent access from multiple systems
- **ACID Compliance**: Full transaction support

## 🌟 Neon Database Benefits

- **Serverless**: Auto-scaling based on usage
- **Branching**: Database branching for development
- **Global**: Low-latency access worldwide
- **Monitoring**: Built-in monitoring and analytics
- **Security**: Enterprise-grade security features

The system is now ready for production use with a robust cloud database backend and multi-user access!
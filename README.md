# STD-Campuz - Student Complaint Management System

A modern, real-time student complaint management system with database backend support.

## 🚀 Features

- **Real Database**: SQLite database for persistent data storage
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

### Backend (Node.js + Express + SQLite)
- **Database**: SQLite with proper relationships and foreign keys
- **API**: RESTful endpoints for all CRUD operations
- **Real-time**: Polling-based updates for multi-user synchronization
- **Security**: Input validation and error handling

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

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

   This command starts both:
   - Backend server on `http://localhost:3001`
   - Frontend development server on `http://localhost:5173`

3. **Access the Application**
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

The system uses SQLite with the following tables:

- **complaints**: Main complaint data
- **categories**: Complaint categories (Campus, Hostel, etc.)
- **locations**: Campus locations (Hostel A, Block B, etc.)
- **images**: Base64 encoded images for complaints
- **comments**: Public comments on complaints
- **support**: User support/upvote tracking

## 🌐 API Endpoints

### Complaints
- `GET /api/complaints` - Get all complaints
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
- `POST /api/admin/login` - Admin authentication
- `GET /api/stats` - Dashboard statistics

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production configuration:

```env
PORT=3001
NODE_ENV=production
DB_PATH=./server/campuz.db
```

### Database Location
The SQLite database file is created at `server/campuz.db`

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy Backend
1. Copy `server/` folder to your server
2. Install production dependencies: `npm install --production`
3. Start server: `node server/index.js`

### Deploy Frontend
1. Build the frontend: `npm run build`
2. Serve the `dist/` folder with any static file server
3. Configure API proxy to point to your backend server

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Basic offline functionality with service worker
- **App-like Experience**: Runs in standalone mode when installed
- **Fast Loading**: Optimized caching and performance

## 🔒 Security Features

- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Proper data sanitization
- **CORS Configuration**: Controlled cross-origin access
- **Error Handling**: Comprehensive error management

## 📊 Admin Features

- **Dashboard Analytics**: Visual charts and statistics
- **Complaint Management**: View, update, and delete complaints
- **Category Management**: Add/remove complaint categories
- **Location Management**: Add/remove campus locations
- **Real-time Monitoring**: Live updates of complaint status

## 🎯 User Features

- **Anonymous Submissions**: Optional name and email fields
- **Image Upload**: Multiple images with automatic compression
- **Location Tagging**: Select specific campus locations
- **Community Support**: Upvote complaints you care about
- **Public Comments**: Engage in discussions about complaints
- **Real-time Updates**: See new complaints and updates immediately

## 🛠️ Technical Stack

**Backend:**
- Node.js + Express.js
- SQLite3 database
- UUID for unique identifiers
- CORS for cross-origin requests

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
3. Ensure database file permissions are correct
4. Check network connectivity between frontend and backend

## 🔄 Data Persistence

- **Database**: All data stored in SQLite database file
- **Backup**: Regular database backups recommended
- **Migration**: Easy to migrate to PostgreSQL/MySQL if needed
- **Multi-user**: Supports concurrent access from multiple systems

The system is now ready for production use with real database persistence and multi-user access!
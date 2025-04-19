# MagicBricks Clone

A full-stack real estate property management system built with MERN stack.

## Setup Instructions

1. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env` in the server directory
- Update the following variables:
  ```
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  CLOUDINARY_CLOUD_NAME=your_cloudinary_name
  CLOUDINARY_API_KEY=your_cloudinary_key
  CLOUDINARY_API_SECRET=your_cloudinary_secret
  ```

3. Start the development servers:
```bash
# Start server (http://localhost:5000)
cd server
npm run dev

# Start client (http://localhost:5173)
cd ../client
npm run dev
```

## Functionality Checklist

### Authentication
- [ ] User Registration
  - Create new account with email/password
  - Verify all fields are required
  - Check password confirmation matches
  - Test duplicate email handling

- [ ] User Login
  - Login with email/password
  - Verify token is stored
  - Check invalid credentials handling
  - Test protected route access

### Property Management
- [ ] Property Listing
  - View all properties
  - Check pagination works
  - Verify filter functionality
  - Test search feature
  - Confirm sorting options

- [ ] Property Details
  - View individual property details
  - Check image gallery works
  - Verify all property info displays
  - Test contact form

- [ ] Property Creation
  - Create new property listing
  - Upload multiple images
  - Verify required fields
  - Check validation
  - Test image optimization

- [ ] Property Updates
  - Edit existing properties
  - Update images
  - Verify changes persist
  - Test authorization

### User Features
- [ ] Favorites
  - Add/remove properties
  - Check favorites count
  - Verify persistence
  - Test multiple users

- [ ] Profile Management
  - View profile details
  - Update profile info
  - Check saved properties
  - Test role-based access

### Admin Features
- [ ] Property Management
  - Approve/reject listings
  - Feature properties
  - Delete properties
  - Verify admin-only access

### General
- [ ] API Security
  - Test authentication
  - Verify CORS
  - Check rate limiting
  - Test input validation

- [ ] Performance
  - Image optimization
  - API response times
  - Client-side caching
  - State management

## Common Issues & Solutions

1. Image Upload Issues
   - Check Cloudinary credentials
   - Verify file size limits
   - Ensure proper file types

2. Authentication Errors
   - Clear local storage
   - Check token expiration
   - Verify API endpoints

3. Database Connection
   - Verify MongoDB URI
   - Check network access
   - Ensure proper credentials

## Development Notes

- Use Node.js v16+ and npm v8+
- Run tests before submitting PRs
- Follow existing code style
- Update documentation when adding features

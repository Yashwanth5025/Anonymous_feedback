# Setup Instructions

## Tech Stack

- **Next.js 16.0.10** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **MongoDB** - Database (via Mongoose)
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Zustand** - Client-side state management (still used for some UI state)

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- npm or pnpm package manager

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up MongoDB:**
   - Create a MongoDB database (use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud or install locally)
   - Get your MongoDB connection string

3. **Configure environment variables:**
   - Create a `.env.local` file in the root directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=your_mongodb_connection_string_here
     ```
   - Example for MongoDB Atlas:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
     ```
   - Example for local MongoDB:
     ```
     MONGODB_URI=mongodb://localhost:27017/feedback-app
     ```
   
   - **For Private Forms (Email functionality):**
     - Add email configuration for sending access tokens:
     ```
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     NEXT_PUBLIC_BASE_URL=http://localhost:3000
     ```
     - **Gmail Setup:**
       1. Go to your Google Account settings
       2. Enable 2-Step Verification
       3. Generate an App Password: https://support.google.com/accounts/answer/185833
       4. Use the generated App Password as `EMAIL_PASSWORD`
     - **Note:** For production, update `NEXT_PUBLIC_BASE_URL` to your domain

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

## How to Use

### For Users:
1. Visit the home page to see all available feedback forms (public and private)
2. **Public Forms:** Click directly to provide feedback
3. **Private Forms:** 
   - Click on the form
   - Enter your access token (received via email)
   - Once validated, access the form
4. Answer all questions (MCQ or text)
5. Submit your feedback
6. Once submitted, you cannot submit again (tracked via localStorage)

### For Admins:
1. Navigate to `/admin` to access the admin dashboard
2. Click "Create Form" to add a new feedback form
3. Fill in form details:
   - Title and description
   - Form type (Public or Private)
   - **For Private Forms:** Enter Gmail addresses (comma-separated) of users who should have access
   - Add questions (MCQ or Text)
4. When creating a private form:
   - System generates unique access tokens for each email
   - Tokens are sent via email automatically
   - Each token can only be used once
5. View all forms and their responses in the admin dashboard

## Features Implemented

✅ **Public Forms** - Forms visible to everyone
✅ **Private Forms** - Forms with email-based access control
✅ **Access Tokens** - Unique UIDs generated and sent via email
✅ **Form Creation** - Admins can create forms with questions
✅ **Question Types** - Support for MCQ and Text questions
✅ **Response Submission** - Users can submit anonymous feedback
✅ **Duplicate Prevention** - localStorage prevents multiple submissions
✅ **Token Validation** - One-time use access tokens
✅ **Admin Dashboard** - View all forms and responses with statistics
✅ **MongoDB Integration** - All data stored in MongoDB
✅ **Email Integration** - Automated email sending for access tokens

## API Endpoints

- `GET /api/forms` - Get all forms (optionally filter by `?type=public`)
- `GET /api/forms/[id]` - Get a specific form by ID
- `POST /api/forms` - Create a new form
- `POST /api/forms/generate-tokens` - Generate access tokens for private forms
- `POST /api/forms/validate-token` - Validate an access token
- `GET /api/responses` - Get all responses (optionally filter by `?formId=...`)
- `POST /api/responses` - Submit a new response

## Database Schema

### Form Collection
```typescript
{
  title: string
  description: string
  questions: Array<{
    id: string
    type: "mcq" | "text"
    question: string
    options?: string[]
  }>
  type: "public" | "private"
  createdAt: Date
}
```

### Response Collection
```typescript
{
  formId: string
  answers: Record<string, string> // questionId -> answer
  submittedAt: Date
}
```

### AccessToken Collection
```typescript
{
  formId: string
  email: string
  uid: string // Unique access token
  used: boolean
  usedAt?: Date
  createdAt: Date
}
```

## Private Forms Workflow

1. **Admin creates private form:**
   - Selects "Private" form type
   - Enters comma-separated Gmail addresses
   - System generates unique UID for each email
   - Emails are sent automatically with access tokens

2. **User receives email:**
   - Contains form title and access token
   - Link to the form

3. **User accesses form:**
   - Clicks on private form from home page
   - Enters access token
   - Token is validated (must be unused)
   - Access granted and stored in localStorage
   - Token marked as used (cannot be reused)

4. **User submits feedback:**
   - Completes form questions
   - Submits feedback
   - Cannot submit again (localStorage check)


# Complete Codebase Explanation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [API Routes](#api-routes)
6. [Frontend Pages](#frontend-pages)
7. [Key Features & Workflows](#key-features--workflows)
8. [Data Flow](#data-flow)
9. [Security & Access Control](#security--access-control)
10. [How Everything Works Together](#how-everything-works-together)

---

## 🎯 Project Overview

This is an **Anonymous Feedback System** built with Next.js that allows administrators to create feedback forms and collect anonymous responses. The system supports two types of forms:

1. **Public Forms**: Anyone can access and submit feedback
2. **Private Forms**: Only users with valid access tokens (sent via email) can access

### Main Use Cases:
- Course feedback collection
- Anonymous surveys
- Private feedback for specific groups
- One-time submission per user (prevented via localStorage)

---

## 🛠 Tech Stack

### Frontend:
- **Next.js 16** (App Router) - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library (shadcn/ui)
- **Zustand** - State management (legacy, not actively used - data comes from MongoDB)

### Backend:
- **Next.js API Routes** - Server-side endpoints
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Nodemailer** - Email sending

### Infrastructure:
- **MongoDB Atlas** or local MongoDB
- **Gmail SMTP** - For sending access tokens

---

## 📁 Project Structure

```
anonymous/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin pages
│   │   ├── create/page.tsx      # Form creation page
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── forms/                # Form endpoints
│   │   │   ├── [id]/route.ts    # Get single form
│   │   │   ├── generate-tokens/ # Generate access tokens
│   │   │   ├── validate-token/  # Validate access token
│   │   │   └── route.ts          # Get all / Create form
│   │   └── responses/route.ts    # Get all / Create response
│   ├── feedback/[id]/page.tsx   # Feedback form page
│   ├── page.tsx                  # Home page
│   └── layout.tsx                # Root layout
├── components/                    # React components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utility functions
│   ├── mongodb.ts                # Database connection
│   ├── email.ts                  # Email utilities
│   └── store.ts                   # Zustand store (legacy)
├── models/                       # Mongoose models
│   ├── Form.ts                   # Form schema
│   ├── Response.ts               # Response schema
│   └── AccessToken.ts            # Access token schema
└── public/                       # Static assets
```

---

## 🗄 Database Architecture

### MongoDB Collections

#### 1. **Forms Collection** (`Form` model)

Stores all feedback forms created by admins.

**Schema:**
```typescript
{
  title: string              // Form title (e.g., "CS101 Feedback")
  description: string        // Form description
  questions: [               // Array of questions
    {
      id: string             // Unique question ID
      type: "mcq" | "text"   // Question type
      question: string        // Question text
      options?: string[]      // Options (only for MCQ)
    }
  ]
  type: "public" | "private"  // Form visibility type
  createdAt: Date            // Creation timestamp
}
```

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Introduction to Computer Science",
  "description": "Help us improve CS101",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "How would you rate the course?",
      "options": ["Excellent", "Good", "Average", "Poor"]
    },
    {
      "id": "q2",
      "type": "text",
      "question": "What improvements would you suggest?"
    }
  ],
  "type": "public",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### 2. **Responses Collection** (`Response` model)

Stores all submitted feedback responses.

**Schema:**
```typescript
{
  formId: string                    // Reference to form
  answers: Record<string, string>   // questionId -> answer mapping
  submittedAt: Date                 // Submission timestamp
}
```

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "formId": "507f1f77bcf86cd799439011",
  "answers": {
    "q1": "Excellent",
    "q2": "More practical examples would help"
  },
  "submittedAt": "2024-01-16T14:20:00Z"
}
```

#### 3. **AccessTokens Collection** (`AccessToken` model)

Stores access tokens for private forms (one-time use).

**Schema:**
```typescript
{
  formId: string      // Reference to form
  email: string       // Recipient email
  uid: string         // Unique 12-character access token
  used: boolean       // Whether token has been used
  usedAt?: Date       // When token was used
  createdAt: Date     // Creation timestamp
}
```

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "formId": "507f1f77bcf86cd799439011",
  "email": "student@example.com",
  "uid": "aB3dEf9hIjKl",
  "used": false,
  "createdAt": "2024-01-15T10:35:00Z"
}
```

**Indexes:**
- `formId` - Indexed for fast lookups
- `uid` - Unique index to prevent duplicates

---

## 🔌 API Routes

### Forms API (`/api/forms`)

#### `GET /api/forms`
- **Purpose**: Fetch all forms (or filter by type)
- **Query Params**: `?type=public` (optional)
- **Returns**: Array of form objects
- **Used by**: Home page, Admin dashboard

#### `POST /api/forms`
- **Purpose**: Create a new form
- **Body**: `{ title, description, questions, type }`
- **Returns**: Created form object
- **Used by**: Admin create form page

#### `GET /api/forms/[id]`
- **Purpose**: Get a specific form by ID
- **Returns**: Single form object
- **Used by**: Feedback form page

#### `POST /api/forms/generate-tokens`
- **Purpose**: Generate and send access tokens for private forms
- **Body**: `{ formId, emails[], formTitle }`
- **Process**:
  1. Generates unique 12-character UID for each email
  2. Creates AccessToken records in database
  3. Sends email to each recipient with their token
- **Returns**: Success/failure status for each email
- **Used by**: Admin create form page (when creating private form)

#### `POST /api/forms/validate-token`
- **Purpose**: Validate and consume an access token
- **Body**: `{ formId, uid }`
- **Process**:
  1. Finds token in database
  2. Checks if already used
  3. Marks as used if valid
- **Returns**: Success/error message
- **Used by**: Feedback form page (for private forms)

### Responses API (`/api/responses`)

#### `GET /api/responses`
- **Purpose**: Fetch all responses (or filter by form)
- **Query Params**: `?formId=xxx` (optional)
- **Returns**: Array of response objects
- **Used by**: Admin dashboard

#### `POST /api/responses`
- **Purpose**: Submit a new feedback response
- **Body**: `{ formId, answers }`
- **Returns**: Created response object
- **Used by**: Feedback form page

---

## 🖥 Frontend Pages

### 1. **Home Page** (`/app/page.tsx`)

**Purpose**: Display all available feedback forms

**Features:**
- Fetches all forms from `/api/forms`
- Displays forms in a responsive grid (2-3 columns)
- Shows form title, description, question count
- Indicates private forms with lock icon
- Clicking a form navigates to `/feedback/[id]`

**Key Code Flow:**
```typescript
1. useEffect fetches forms on mount
2. Maps forms to Card components
3. Each card is a Link to /feedback/[id]
4. Shows loading/empty states
```

**No Admin Access**: Admin button removed - only accessible via direct URL

---

### 2. **Feedback Form Page** (`/app/feedback/[id]/page.tsx`)

**Purpose**: Display and submit feedback for a specific form

**Features:**
- Fetches form by ID
- Handles public/private form access
- Token validation for private forms
- Form submission with validation
- Prevents duplicate submissions (localStorage)

**State Management:**
- `form` - Form data
- `hasAccess` - Whether user can access (public = true, private = validated)
- `hasSubmitted` - Whether user already submitted
- `answers` - User's answers (questionId -> answer)
- `accessToken` - Token input for private forms

**Access Flow for Private Forms:**
```
1. Check localStorage for existing access
2. If no access → Show token input form
3. User enters token → Validate via API
4. If valid → Store in localStorage, grant access
5. If invalid → Show error
```

**Submission Flow:**
```
1. Validate all questions answered
2. POST to /api/responses
3. Store formId in localStorage (prevents resubmission)
4. Show success message
```

**Key Features:**
- **MCQ Questions**: Radio buttons with options
- **Text Questions**: Textarea for free-form answers
- **Validation**: All questions required
- **Duplicate Prevention**: localStorage tracks submitted forms

---

### 3. **Admin Dashboard** (`/app/admin/page.tsx`)

**Purpose**: View all forms and their responses

**Features:**
- Statistics cards (total forms, responses, average)
- Grid layout of forms (similar to home page)
- Click form to view detailed responses
- Response analytics:
  - **MCQ**: Shows percentage bars for each option
  - **Text**: Lists all text responses (expandable)

**State Management:**
- `forms` - All forms
- `responses` - All responses
- `selectedFormId` - Currently viewed form
- `expandedTextQuestions` - Which text questions are expanded

**Analytics Calculation:**
```typescript
// For MCQ questions:
1. Get all responses for the form
2. Count answers for each option
3. Calculate percentage: (count / total) * 100
4. Display as progress bars

// For Text questions:
1. Get all text responses
2. Display first 5, expand to show all
```

**Layout:**
- Grid of form cards (3 columns on large screens)
- Hover effects: shadow + border highlight (no color change)
- Click card to view responses

---

### 4. **Create Form Page** (`/app/admin/create/page.tsx`)

**Purpose**: Build and create new feedback forms

**Features:**
- Form builder interface
- Add/remove questions dynamically
- Support for MCQ and Text questions
- Add/remove MCQ options
- Form type selection (public/private)
- Email input for private forms
- Validation before submission

**Form Creation Flow:**
```
1. User fills form details (title, description, type)
2. Adds questions (MCQ or Text)
3. For MCQ: Adds options
4. If private: Enters comma-separated emails
5. Submits → POST /api/forms
6. If private → POST /api/forms/generate-tokens
7. Redirects to admin dashboard
```

**Question Management:**
- Each question has unique ID (timestamp-based)
- Can change question type (MCQ ↔ Text)
- MCQ requires at least 2 options
- Can remove questions (minimum 1 required)

**Validation:**
- Title and description required
- At least one valid question required
- For private forms: Valid email addresses required
- MCQ questions need at least 2 options

---

## 🔐 Security & Access Control

### Public Forms
- No authentication required
- Anyone can access via URL
- Duplicate prevention via localStorage (client-side only)

### Private Forms
- **Token Generation**: 12-character alphanumeric UID
- **Uniqueness**: Database check ensures no duplicates
- **One-Time Use**: Token marked as `used` after validation
- **Email Delivery**: Tokens sent via Gmail SMTP
- **Access Storage**: Validated tokens stored in localStorage
- **Token Validation**: Server-side check before granting access

### Duplicate Submission Prevention
- **Method**: localStorage tracking
- **Key**: `submittedForms` array
- **Limitation**: Client-side only (can be cleared)
- **Process**: Form ID added to array after successful submission

---

## 🔄 Data Flow

### Creating a Public Form

```
Admin → /admin/create
  ↓
Fills form details
  ↓
POST /api/forms
  ↓
MongoDB: Create Form document
  ↓
Returns form data
  ↓
Redirect to /admin
```

### Creating a Private Form

```
Admin → /admin/create
  ↓
Fills form + emails
  ↓
POST /api/forms → Create form
  ↓
POST /api/forms/generate-tokens
  ↓
For each email:
  - Generate unique UID
  - Create AccessToken document
  - Send email via Nodemailer
  ↓
Redirect to /admin
```

### Submitting Feedback (Public Form)

```
User → /feedback/[id]
  ↓
GET /api/forms/[id] → Fetch form
  ↓
User fills answers
  ↓
POST /api/responses → Submit
  ↓
MongoDB: Create Response document
  ↓
localStorage: Add formId to submittedForms
  ↓
Show success message
```

### Submitting Feedback (Private Form)

```
User → /feedback/[id]
  ↓
GET /api/forms/[id] → Fetch form (type: private)
  ↓
Check localStorage for access
  ↓
If no access:
  - Show token input
  - User enters token
  - POST /api/forms/validate-token
  - If valid: Mark token as used, store access
  ↓
User fills answers
  ↓
POST /api/responses → Submit
  ↓
MongoDB: Create Response document
  ↓
localStorage: Add formId to submittedForms
  ↓
Show success message
```

### Viewing Responses (Admin)

```
Admin → /admin
  ↓
GET /api/forms → Fetch all forms
GET /api/responses → Fetch all responses
  ↓
Display statistics and form grid
  ↓
Click form → Filter responses by formId
  ↓
Calculate analytics:
  - MCQ: Count and percentage per option
  - Text: List all responses
  ↓
Display in cards with charts
```

---

## 🎯 Key Features & Workflows

### 1. **Form Types**

#### Public Forms
- Visible to everyone on home page
- No authentication required
- Direct access via URL

#### Private Forms
- Visible on home page but locked
- Requires access token
- Tokens sent via email
- One-time use tokens

### 2. **Question Types**

#### MCQ (Multiple Choice)
- Radio button selection
- Minimum 2 options required
- Admin can add/remove options
- Analytics show percentage distribution

#### Text Response
- Free-form text input
- Textarea component
- All responses displayed in admin view
- Expandable list (shows 5 initially)

### 3. **Email System**

**Configuration:**
- Uses Gmail SMTP
- Requires App Password (not regular password)
- Environment variables: `EMAIL_USER`, `EMAIL_PASSWORD`

**Email Content:**
- Form title
- Access token (12 characters)
- Direct link to form
- Instructions for use

**Error Handling:**
- Token created even if email fails
- User can still access with token
- Errors logged for debugging

### 4. **Database Connection**

**Connection Strategy:**
- Cached connection (prevents multiple connections)
- Global variable for connection reuse
- Mongoose connection pooling
- Error handling and reconnection

**Environment:**
- `MONGODB_URI` required
- Supports MongoDB Atlas (cloud) or local MongoDB

---

## 🔧 How Everything Works Together

### Complete User Journey: Private Form

1. **Admin Creates Form**
   ```
   Admin → Create Form Page
   → Enters title, description, selects "Private"
   → Enters emails: "user1@gmail.com, user2@gmail.com"
   → Adds questions
   → Submits
   ```

2. **System Processes**
   ```
   → Form saved to MongoDB
   → For each email:
     - Generate unique UID
     - Save AccessToken to MongoDB
     - Send email with token
   → Redirect to admin dashboard
   ```

3. **User Receives Email**
   ```
   → Email arrives with:
     - Form title
     - Access token: "aB3dEf9hIjKl"
     - Link to form
   ```

4. **User Accesses Form**
   ```
   → Visits home page
   → Sees private form (with lock icon)
   → Clicks form
   → Sees token input screen
   → Enters token from email
   → System validates token
   → Token marked as used
   → Access granted (stored in localStorage)
   ```

5. **User Submits Feedback**
   ```
   → Fills all questions
   → Submits
   → Response saved to MongoDB
   → Form ID added to localStorage (prevents resubmission)
   → Success message shown
   ```

6. **Admin Views Responses**
   ```
   → Admin dashboard
   → Clicks form card
   → Sees all responses
   → MCQ: Percentage bars
   → Text: List of responses
   ```

### Complete User Journey: Public Form

1. **Admin Creates Form**
   ```
   → Same as private, but selects "Public"
   → No email step needed
   ```

2. **User Accesses Form**
   ```
   → Visits home page
   → Sees public form
   → Clicks directly
   → No token needed
   → Form loads immediately
   ```

3. **User Submits Feedback**
   ```
   → Same as private form submission
   ```

---

## 📊 State Management

### Client-Side State (React useState)
- Form data
- User answers
- Loading states
- Error states
- Access tokens

### Persistent State (localStorage)
- `submittedForms`: Array of form IDs already submitted
- `formAccess`: Object mapping formId → hasAccess (for private forms)

### Server-Side State (MongoDB)
- All forms
- All responses
- All access tokens

---

## 🎨 UI/UX Features

### Design System
- **shadcn/ui** components (Radix UI based)
- **Tailwind CSS** for styling
- **Dark/Light mode** support (via theme provider)
- **Responsive design** (mobile, tablet, desktop)

### User Experience
- Loading states with spinners
- Error messages for validation
- Success confirmations
- Smooth transitions and hover effects
- Grid layouts for better organization
- Card-based design for clarity

### Accessibility
- Semantic HTML
- ARIA labels (via Radix UI)
- Keyboard navigation
- Focus states

---

## 🚀 Deployment Considerations

### Environment Variables Required
```bash
MONGODB_URI=mongodb+srv://...
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Build Process
```bash
npm run build  # Creates optimized production build
npm start      # Runs production server
```

### Database Setup
- MongoDB Atlas (recommended for production)
- Or local MongoDB instance
- Ensure IP whitelisting for Atlas

### Email Setup
- Gmail account with 2-Step Verification
- App Password generated
- SMTP configuration via Nodemailer

---

## 🔍 Key Code Patterns

### 1. **API Route Pattern**
```typescript
export async function GET/POST(request: NextRequest) {
  try {
    await connectDB()
    // ... logic
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '...' }, { status: 500 })
  }
}
```

### 2. **Form Validation Pattern**
```typescript
// Client-side validation before API call
const errors = {}
if (!field) errors.field = true
if (Object.keys(errors).length > 0) {
  setErrors(errors)
  return
}
// Then make API call
```

### 3. **localStorage Pattern**
```typescript
// Read
const data = JSON.parse(localStorage.getItem('key') || '[]')
// Write
localStorage.setItem('key', JSON.stringify(data))
```

### 4. **MongoDB Model Pattern**
```typescript
// Define schema
const Schema = new Schema({ ... })
// Export model (with Next.js compatibility)
export default mongoose.models.Model || mongoose.model('Model', Schema)
```

---

## 🐛 Common Issues & Solutions

### Issue: Email Not Sending
- **Solution**: Check Gmail App Password, not regular password
- **Solution**: Verify 2-Step Verification is enabled
- **Solution**: Check environment variables

### Issue: MongoDB Connection Failed
- **Solution**: Verify MONGODB_URI is correct
- **Solution**: Check IP whitelist (for Atlas)
- **Solution**: Ensure MongoDB is running (local)

### Issue: Token Already Used
- **Solution**: Each token is one-time use only
- **Solution**: Admin needs to generate new tokens

### Issue: Duplicate Submission
- **Solution**: Clear localStorage (developer tools)
- **Note**: This is client-side only, not server-side validation

---

## 📝 Summary

This is a **full-stack anonymous feedback system** with:

✅ **Public and Private Forms**
✅ **Email-based Access Control**
✅ **One-Time Use Tokens**
✅ **MCQ and Text Questions**
✅ **Response Analytics**
✅ **Duplicate Prevention**
✅ **Modern UI/UX**
✅ **MongoDB Backend**
✅ **Next.js App Router**

The system is designed for **course feedback collection** but can be adapted for any anonymous survey use case. All data is stored in MongoDB, and the system uses a combination of server-side validation (for tokens) and client-side tracking (for duplicate prevention).


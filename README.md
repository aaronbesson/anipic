# Studio Anim - AI Video Generator

Convert static images into animated videos using AI. Upload an image, add a text prompt, and generate impressive AI-powered animations.

## Project Overview
Studio Anim is a web application that allows users to generate AI-powered videos from static images. Users can sign in, purchase credits, upload images, and transform them into animated videos using AI technology.

## Features
- 🎬 **AI Video Generation**: Transform static images into dynamic videos
- 🔐 **User Authentication**: Google sign-in integration
- 💳 **Credit System**: Purchase credits to generate videos
- 🖼️ **Image Upload**: Simple drag-and-drop image upload
- 📱 **Responsive Design**: Works on mobile and desktop

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI components
- **Stripe**: Payment processing

### Backend
- **Next.js API Routes**: Serverless functions for API endpoints
- **Firebase**: Authentication & database
- **Replicate API**: AI video generation

### Development & Deployment
- **Vercel**: Hosting and deployment

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── check-video-status/   # Status checking endpoint
│   │   ├── create-payment-intent/# Stripe payment API
│   │   ├── generate-video/       # Video generation API
│   │   └── webhook/              # Stripe webhook handler
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── auth-provider.tsx         # Firebase auth context
│   ├── google-auth-button.tsx    # Google sign-in button
│   ├── image-uploader.tsx        # Image upload component
│   ├── stripe-payment-form.tsx   # Stripe payment processing
│   ├── theme-provider.tsx        # Theme context
│   ├── video-generator.tsx       # Video generation form
│   ├── video-player.tsx          # Video player component
│   └── ui/                       # UI components
│       ├── button.tsx            # Button component
│       ├── card.tsx              # Card component
│       ├── toast.tsx             # Toast notification component
│       ├── toaster.tsx           # Toast manager
│       └── ...                   # Other UI components
│
├── hooks/                        # Custom React hooks
│   └── use-toast.ts              # Toast notification hook
│
├── lib/                          # Utility functions
│   ├── firebase.ts               # Firebase initialization
│   ├── userService.ts            # User data management
│   └── utils.ts                  # Utility functions
│
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── package.json                  # Project dependencies
└── tsconfig.json                 # TypeScript configuration
```

## Core Components & Features

### Authentication (components/auth-provider.tsx)
- Firebase Authentication for user management
- Google Sign-in integration
- User context provider with authentication state

### Video Generation (components/video-generator.tsx)
- Image upload interface
- Prompt-based AI video generation
- Credit system integration
- Status polling for video generation progress

### Payment Processing (components/stripe-payment-form.tsx)
- Stripe Elements integration for card payments
- Client-side credit addition for reliable transaction handling
- Success feedback with toast notifications

### User Data Management (lib/userService.ts)
- Firebase Firestore for user data storage
- Credit tracking and management
- User profile information

## API Endpoints

### `/api/generate-video`
- **Method**: POST
- **Purpose**: Initiates video generation via Replicate API
- **Parameters**: prompt, start_image_url, duration, aspect_ratio, loop
- **Returns**: Prediction ID and status

### `/api/check-video-status`
- **Method**: POST
- **Purpose**: Polls for video generation status
- **Parameters**: predictionId
- **Returns**: Current status and output URL when complete

### `/api/create-payment-intent`
- **Method**: POST
- **Purpose**: Creates Stripe payment intent
- **Parameters**: userId, userEmail
- **Returns**: Client secret for Stripe Elements

### `/api/webhook`
- **Method**: POST
- **Purpose**: Handles Stripe webhook events
- **Events**: payment_intent.succeeded, charge.succeeded, checkout.session.completed

## Application Flow

### User Authentication Flow
1. User visits the site and clicks "Sign in with Google"
2. Firebase Authentication handles the OAuth flow
3. Upon successful login, user data is fetched/created in Firestore
4. User is presented with the video generation interface

### Credit Purchase Flow
1. User clicks "Buy Credits" button
2. Stripe Elements form loads for payment details
3. User enters payment information and submits
4. On successful payment:
   - Credits are directly added to the user's account in Firestore
   - User sees success notification
   - UI updates to show new credit balance

### Video Generation Flow
1. User uploads an image
2. User enters a prompt and selects video options
3. User clicks "Generate Video" which consumes one credit
4. Application:
   - Deducts credit from user's account
   - Sends generation request to Replicate API
   - Polls for status updates
   - Displays progress to user
5. When generation completes, video is shown in the player

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase account
- Stripe account
- Replicate API account

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studio-anim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=

   # Replicate API
   REPLICATE_API_TOKEN=

   # Stripe Keys
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=

   # App URL for webhook callbacks
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Firebase Setup**
   - Create a new Firebase project in the Firebase console
   - Enable Google Authentication in the Auth section
   - Create a Firestore database
   - Get your Firebase configuration from Project Settings

5. **Stripe Setup**
   - Create a Stripe account
   - Get your API keys from the Developers section
   - Set up a webhook endpoint to `https://your-domain.com/api/webhook`
   - Add these events to the webhook: `payment_intent.succeeded`, `charge.succeeded`, `checkout.session.completed`

6. **Replicate API Setup**
   - Create a Replicate account
   - Get your API token from your account settings

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Test Stripe webhooks locally**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

### Production Deployment

1. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

2. **Set environment variables in Vercel**
   Add all environment variables from your `.env.local` file to your Vercel project

3. **Update Stripe webhook URL**
   Update your Stripe webhook endpoint to point to your production URL:
   ```
   https://your-production-domain.com/api/webhook
   ```

## Security Considerations

1. **Firebase Rules**
   Set up proper Firestore security rules to protect user data:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, update: if request.auth != null && request.auth.uid == userId;
         allow create: if request.auth != null;
       }
     }
   }
   ```

2. **Stripe Webhook Signature Verification**
   The webhook endpoint verifies Stripe signatures to prevent unauthorized requests

3. **Client-side Credit Management**
   - Credits are managed client-side to ensure reliable transactions
   - The user must be authenticated to update their credits
   - Atomic operations are used to prevent race conditions

## Troubleshooting

### Webhook Issues
- Ensure webhook URL is correct (`/api/webhook`)
- Verify webhook secret matches between Stripe and your environment
- Check server logs for webhook processing errors

### Payment Problems
- Verify Stripe keys are correct
- Check browser console for payment form errors
- Test with Stripe test cards in development mode

### Video Generation Failures
- Verify Replicate API token is valid
- Check image upload format and size
- Inspect server logs for API response errors

## License
MIT

## Created by
[Aaron Besson](https://github.com/aaronbesson)

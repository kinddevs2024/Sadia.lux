# API Configuration Setup

## Backend Connection

The frontend is configured to connect to the production backend at:
**https://sadia-backend.vercel.app/api**

## Environment Variables

### For Local Development

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### For Production Deployment (Vercel)

Set the environment variable in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://sadia-backend.vercel.app/api`
   - **Environment:** Production, Preview, Development

### Automatic Configuration

The application automatically uses:
- **Production:** `https://sadia-backend.vercel.app/api` (when built for production)
- **Development:** `http://localhost:3000/api` (when running `npm run dev`)

If you set `VITE_API_URL` environment variable, it will override the default.

## Current Configuration

The API URL is configured in `src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://sadia-backend.vercel.app/api'
    : 'http://localhost:3000/api');
```

## Testing the Connection

1. Start the frontend: `npm run dev`
2. Check browser console for any API errors
3. Try logging in or fetching products to verify the connection

## Backend URL

Production Backend: **https://sadia-backend.vercel.app**
API Base URL: **https://sadia-backend.vercel.app/api**


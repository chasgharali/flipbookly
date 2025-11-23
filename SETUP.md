# Quick Setup Guide

Follow these steps to get FlipBookly running locally:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Copy `env.example` to `.env` and fill in your values:

```bash
# Create .env file
cp env.example .env
```

Then edit `.env` with your actual values:

```env
DATABASE_URL="your_mongodb_connection_string"
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 3. Get Cloudinary Credentials

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up or log in (free tier available)
3. Go to your Dashboard
4. Navigate to Settings → Security
5. Copy your `Cloud Name`, `API Key`, and `API Secret`
6. Add these to your `.env` file

## 4. Set Up MongoDB

### Option A: MongoDB Atlas (Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string and add it to `.env`

### Option B: Local MongoDB

1. Install MongoDB locally
2. Use connection string: `mongodb://localhost:27017/flipbookly`

## 5. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

## 6. Run Development Server

```bash
npm run dev
```

## 7. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Testing

1. Upload a PDF file from the homepage
2. Wait for processing (may take a few seconds)
3. View your flipbook!
4. Check the dashboard to see all your flipbooks

## Common Issues

### Canvas/PDF.js Errors

If you see errors related to `canvas` or `pdfjs-dist`:

- Make sure you're using Node.js 18+
- Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

### Cloudinary Errors

- Verify your API keys are correct (Cloud Name, API Key, API Secret)
- Check that your Cloudinary account is active
- Ensure file size is under 100MB
- Verify you have sufficient storage quota in your Cloudinary account

### Database Connection Errors

- Verify your MongoDB connection string
- Check that your IP is whitelisted (for Atlas)
- Ensure MongoDB is running (for local)

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Deploy to Vercel for production use
- Customize the UI and branding


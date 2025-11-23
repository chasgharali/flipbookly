# FlipBookly - Interactive PDF Flipbooks

A full-stack Next.js application that converts PDFs into beautiful, interactive flipbooks with shareable links. Built with Next.js 14, TypeScript, TailwindCSS, MongoDB, Prisma, and UploadThing.

## Features

- 📄 **PDF Upload** - Upload PDFs up to 100MB
- 🖼️ **PDF to Image Conversion** - Automatically converts each PDF page to high-quality images
- 📖 **Interactive Flipbook Viewer** - Beautiful page-turning animations using react-pageflip
- 🔗 **Shareable Links** - Unique URLs for each flipbook
- 📊 **Dashboard** - View and manage all your flipbooks
- 🎨 **Modern UI** - Clean, responsive design with dark mode support
- ⚡ **Fast & Scalable** - Built with Next.js App Router for optimal performance

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** MongoDB
- **ORM:** Prisma
- **File Storage:** Cloudinary
- **PDF Processing:** pdfjs-dist + canvas
- **Flipbook Library:** react-pageflip

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- MongoDB database (local or Atlas)
- Cloudinary account (free tier available)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd SimpleBooklet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and fill in your values:
   ```bash
   cp env.example .env
   ```
   
   Then edit `.env` with your actual credentials:
   ```env
   # Database
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/flipbookly?retryWrites=true&w=majority"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   
   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up Cloudinary**
   
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Go to your Dashboard
   - Copy your `Cloud Name`, `API Key`, and `API Secret` from Settings → Security
   - Add these to your `.env` file

5. **Set up MongoDB**
   
   - Create a MongoDB database (local or use MongoDB Atlas)
   - Copy your connection string to `DATABASE_URL` in `.env`

6. **Initialize Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── books/
│   │   │   ├── route.ts          # Create and list flipbooks
│   │   │   └── [slug]/route.ts   # Get flipbook by slug
│   │   └── upload/
│   │       └── route.ts          # Cloudinary upload API route
│   ├── book/
│   │   └── [slug]/
│   │       └── page.tsx          # Flipbook viewer page
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── FlipbookViewer.tsx        # Flipbook viewer component
│   └── PDFUploader.tsx           # PDF upload component
├── lib/
│   ├── db.ts                     # Prisma client
│   ├── pdfToImages.ts            # PDF to image conversion
│   └── cloudinary.ts             # Cloudinary configuration
└── prisma/
    └── schema.prisma             # Database schema
```

## Usage

### Uploading a PDF

1. Go to the homepage or dashboard
2. Optionally enter a title for your flipbook
3. Click "Upload PDF" and select your PDF file
4. Wait for the upload and processing to complete
5. You'll be redirected to your new flipbook!

### Viewing a Flipbook

- Navigate to `/book/[slug]` where `[slug]` is your flipbook's unique identifier
- Use the controls to:
  - Navigate between pages
  - Zoom in/out
  - Enter fullscreen mode
  - View page numbers

### Sharing a Flipbook

- Copy the shareable link from the dashboard
- Share it with anyone - no login required!

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add environment variables**
   - Add all variables from your `.env` file
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

4. **Deploy**
   - Vercel will automatically deploy your app
   - Your app will be live at `https://your-project.vercel.app`

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

- `DATABASE_URL` - Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://your-project.vercel.app`)

### MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP (or use `0.0.0.0/0` for Vercel)
4. Get your connection string
5. Add it to your environment variables

## API Routes

### POST `/api/books`

Create a new flipbook from a PDF URL.

**Request Body:**
```json
{
  "pdfUrl": "https://...",
  "title": "My Flipbook" // optional
}
```

**Response:**
```json
{
  "success": true,
  "flipbook": {
    "id": "...",
    "slug": "...",
    "pages": ["url1", "url2", ...],
    "createdAt": "...",
    "title": "..."
  }
}
```

### GET `/api/books`

Get all flipbooks.

**Response:**
```json
{
  "flipbooks": [...]
}
```

### GET `/api/books/[slug]`

Get a flipbook by slug.

**Response:**
```json
{
  "flipbook": {
    "id": "...",
    "slug": "...",
    "pdfUrl": "...",
    "pages": ["url1", "url2", ...],
    "createdAt": "...",
    "title": "..."
  }
}
```

## Troubleshooting

### PDF Conversion Issues

- Ensure your PDF is not password-protected
- Check that the PDF is not corrupted
- Large PDFs may take longer to process
- **Note:** The `canvas` package requires native dependencies. For Vercel deployment, you may need to:
  - Use Vercel's Node.js runtime (not Edge)
  - Or consider using a different PDF conversion service for serverless environments

### Cloudinary Issues

- Verify your API keys are correct
- Check your Cloudinary dashboard for usage limits
- Ensure your file size is under 100MB
- Make sure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set correctly
- Verify your Cloudinary account has sufficient storage quota

### Database Issues

- Verify your MongoDB connection string
- Ensure your IP is whitelisted (for MongoDB Atlas)
- Run `npx prisma db push` to sync your schema
- For Vercel, whitelist `0.0.0.0/0` in MongoDB Atlas to allow all IPs

### Serverless Deployment (Vercel)

- The PDF conversion uses `canvas` which requires native dependencies
- Vercel automatically handles this, but if you encounter issues:
  1. Ensure you're using Node.js runtime (not Edge)
  2. Check Vercel function logs for errors
  3. Consider increasing function timeout in `vercel.json`
  4. For very large PDFs, consider using a background job queue

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ using Next.js


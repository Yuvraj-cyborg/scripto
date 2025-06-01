# AI Chatbot

A modern AI chatbot application built with Go (Gin) backend and Next.js frontend, powered by Google's Gemini AI.

## Features

- 🤖 AI-powered conversations using Google Gemini
- 💬 Real-time chat interface
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Fast Go backend with Gin framework
- 🔄 Automatic message timestamps
- 📱 Mobile-friendly design
- 🚀 Environment-based configuration

## Tech Stack

### Backend
- **Go 1.23.3**
- **Gin** - HTTP web framework
- **Google Generative AI** - Gemini API integration
- **godotenv** - Environment variables

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Axios** - HTTP client

## Setup Instructions

### Prerequisites
- Go 1.23.3 or later
- Node.js 18 or later
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8080
   ```

3. Install dependencies:
   ```bash
   go mod tidy
   ```

4. Run the backend:
   ```bash
   go run main.go
   ```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (optional):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:3000`

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## Project Structure

```
scripto/
├── backend/
│   ├── main.go          # Main server file
│   ├── go.mod           # Go module dependencies
│   ├── go.sum           # Go module checksums
│   └── .env.example     # Environment variables template
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx      # Main chat interface
│   │       ├── layout.tsx    # App layout
│   │       └── globals.css   # Global styles
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.ts    # Tailwind configuration
│   └── .env.local.example    # Frontend environment template
└── README.md
```

## API Endpoints

### Backend Endpoints

- `GET /health` - Health check endpoint
- `POST /api/chat` - Send message to AI
  ```json
  {
    "message": "Your message here"
  }
  ```

## Configuration

### Environment Variables

#### Backend (.env)
- `GEMINI_API_KEY` - Your Google Gemini API key (required)
- `PORT` - Server port (default: 8080)

#### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8080)

## Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY environment variable is required"**
   - Ensure your `.env` file exists in the backend directory
   - Verify your API key is correct

2. **"Cannot connect to the server"**
   - Make sure the backend is running on port 8080
   - Check if there are any firewall restrictions

3. **Frontend build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (should be 18+)

4. **CORS errors**
   - The backend is configured to allow localhost origins
   - If using different ports, update the CORS configuration

### Development Tips

- The backend includes request validation (max 1000 characters)
- Frontend includes timeout handling (30 seconds)
- Both include comprehensive error handling
- Messages include timestamps for better UX

## Production Deployment

### Backend
1. Build the binary: `go build -o chatbot main.go`
2. Set environment variables on your server
3. Run the binary: `./chatbot`

### Frontend
1. Build the app: `npm run build`
2. Start the production server: `npm start`
3. Or deploy to platforms like Vercel, Netlify, etc.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. 
# AfroChinaTrade Backend

Express.js + TypeScript + MongoDB backend for the AfroChinaTrade e-commerce application.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Configure other environment variables as needed

4. Ensure MongoDB is running locally or accessible via your connection string

## Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## Production

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server and database status

## Database Connection

The application includes:
- Automatic connection retry logic (5 attempts with 5-second delays)
- Connection status logging
- Graceful shutdown handling
- Connection event monitoring

## Environment Variables

See `.env.example` for all available configuration options.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts      # Database configuration and connection
│   └── index.ts             # Main application entry point
├── dist/                    # Compiled JavaScript (generated)
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment variables template
├── package.json
└── tsconfig.json
```

## Next Steps

- Implement Mongoose schemas and models
- Create authentication middleware
- Build REST API endpoints
- Add validation and error handling
- Implement file upload functionality

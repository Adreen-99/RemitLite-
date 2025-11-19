# RemitLite - International Money Remittance App

A production-style full-stack application simulating international money transfers with real-time FX conversion.

## Project Links

Frontend Application: http://localhost:5173/

Backend API: http://127.0.0.1:5000/

Project Management: https://trello.com/b/YEG1rS8X/remit-lite


## Project Overview

RemitLite is a single-page React application that enables users to send money from one currency to another with real-time conversion, consuming data from a Python Flask backend API.

## Features

- **Sender Information**: Capture sender name and country
- **Recipient Information**: Capture recipient name and destination country  
- **Amount Entry**: Enter send amount and select destination currency
- **FX Conversion**: Real-time conversion using exchangerate.host API
- **Transfer Estimates**: Simulated transfer fees and delivery times
- **Transfer Creation**: Sandbox API integration via Python backend
- **Transfer History**: Local storage and display of transfer history

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React with functional components and hooks
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React hooks and context
- **HTTP Client**: Axios

### Backend (Python Flask)
- **Framework**: Flask with RESTful API
- **Testing**: Pytest
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Ready for Render/Railway

## Project Structure

```
RemitLite/
├── frontend/          # React frontend application
├── backend/           # Flask backend API
├── docs/             # Documentation
├── .github/          # CI/CD workflows
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## API Endpoints

- `GET /api/rates` - Get FX rates
- `POST /api/transfers` - Create transfer
- `GET /api/transfers` - Get transfer history
- `GET /api/countries` - Get supported countries

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

## Deployment

### Frontend
Deployed to Vercel/Netlify

### Backend
Deployed to Render/Railway

## License

MIT License

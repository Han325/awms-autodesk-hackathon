# Alert and Work Order Management System

(DEMO) Middleware for sensor data processing with tiered notifications and work order generation.

## Specs

- Fetches data from multiple sensor APIs (temperature, humidity, light, door, conveyor)
- Rule-based evaluation with tiered notifications (INFO/WARNING/CRITICAL)
- Automatic work order generation for critical issues
- Real-time dashboard with React + Tailwind CSS
- Category and reasoning tracking for future ML integration

## Project Structure

```
awms-autodesk-hackathon/
├── server/          # Express backend
├── client/          # React frontend
└── docs/           # API documentation
```

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

## Running

### Development Mode (both server and client)

From root directory:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

### Production Mode

1. Build the client:
```bash
cd client
npm run build
```

2. Start the server:
```bash
cd ../server
npm start
```

Visit http://localhost:3000

## API Endpoints

- `GET /api/sensors` - Current sensor data
- `GET /api/notifications` - All notifications (optional `?tier=CRITICAL`)
- `POST /api/notifications/:id/acknowledge` - Acknowledge notification
- `GET /api/work-orders` - All work orders (optional `?status=open`)
- `PATCH /api/work-orders/:id` - Update work order status

## How It Works

1. Backend polls sensor APIs every 5 seconds
2. Rule engine evaluates sensor data against thresholds
3. Notifications are generated with tier, category, and reasoning
4. Critical issues automatically create work orders
5. Frontend polls API every 3 seconds for real-time updates

## Notification Tiers

- **INFO**: Informational messages (e.g., light off)
- **WARNING**: Conditions approaching critical thresholds
- **CRITICAL**: Immediate action required (auto-generates work orders)

Each notification includes:
- Category (TEMPERATURE_THRESHOLD, HUMIDITY_THRESHOLD, EQUIPMENT_STATE)
- Reasoning (explanation for future ML training)
- Device and sensor information

## Future ML Integration

The system is designed with ML integration in mind:
- Categories and reasoning strings provide training data structure
- Thresholds can be learned from historical patterns
- Notification routing can be optimized with ML
- Predictive maintenance can be added to work order generation

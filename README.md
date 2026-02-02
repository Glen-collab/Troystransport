# Troy's Transport Dispatch Board 🚛

A drag-and-drop dispatch management tool for trucking operations. Assign truckers to payloads, track delivery status, and manage your fleet visually.

![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Visual Dispatch Board** - Payloads on the left, truckers on the right
- **Drag & Drop Assignment** - Click or drag truckers onto payloads to assign
- **Availability Tracking** - Green = available, Red = assigned to active load
- **Status Workflow** - Unassigned → Assigned → In Transit → Completed
- **Full CRUD** - Add, edit, delete truckers and payloads
- **Filtering** - View active, unassigned, in progress, or completed loads
- **Persistent Storage** - Data saves to localStorage automatically

## Payload Information

Each payload tracks:
- Description
- Origin & Destination
- Pickup Date & Time
- Delivery Date
- Assigned Trucker
- Status

## Trucker Information

Each trucker card shows:
- Name
- Phone
- Truck ID/Name
- Current assignment (if any)
- Availability status (green/red indicator)

## Usage

### Assigning a Trucker to a Payload

**Method 1 - Click:**
1. Click on an available trucker (green dot)
2. Click on an unassigned payload
3. Trucker is now assigned

**Method 2 - Drag:**
1. Drag an available trucker card
2. Drop it on an unassigned payload card

### Managing Deliveries

1. Once a trucker is assigned, click **"In Transit"** when they depart
2. Click **"Complete"** when the delivery is finished
3. Completed loads fade out and the trucker becomes available again

### Removing an Assignment

Click the **"Unassign"** button on any payload to free up the trucker.

## Installation

This is a React component. To use it:

1. Copy `dispatch-board.jsx` into your React project
2. Import and render the component:

```jsx
import TruckingDispatchBoard from './dispatch-board';

function App() {
  return <TruckingDispatchBoard />;
}
```

3. The component uses inline styles (no additional CSS needed)
4. Data persists via localStorage

## Tech Stack

- React 18 with Hooks
- localStorage for persistence
- No external dependencies (just React)

## License

MIT - Feel free to modify for your trucking operations!

---

Built for Troy's Transport 🚚

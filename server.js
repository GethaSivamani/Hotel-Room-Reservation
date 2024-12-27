const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock Data
let rooms = [];
const floors = 10;
const roomsPerFloor = 10;

// Initialize rooms
const initializeRooms = () => {
  rooms = [];
  for (let floor = 1; floor <= floors; floor++) {
    const roomCount = floor === 10 ? 7 : roomsPerFloor;
    for (let num = 1; num <= roomCount; num++) {
      rooms.push({
        id: `${floor * 100 + num}`,
        floor,
        isOccupied: false,
      });
    }
  }
};
initializeRooms();

// Get all rooms
app.get('/rooms', (req, res) => {
  res.json(rooms);
});

// Calculate travel time between rooms
const calculateTravelTime = (selectedRooms) => {
  if (selectedRooms.length <= 1) return 0;

  selectedRooms.sort((a, b) => parseInt(a.id) - parseInt(b.id)); // Sort rooms by ID
  let totalTime = 0;
  let prevRoom = selectedRooms[0];

  for (let i = 1; i < selectedRooms.length; i++) {
    const currRoom = selectedRooms[i];

    if (prevRoom.floor === currRoom.floor) {
      // Horizontal travel on the same floor
      totalTime += Math.abs(parseInt(prevRoom.id) - parseInt(currRoom.id));
    } else {
      // Vertical travel between floors
      totalTime += Math.abs(currRoom.floor - prevRoom.floor) * 2;
    }

    prevRoom = currRoom;
  }

  return totalTime;
};

// Book selected rooms
app.post('/book', (req, res) => {
  const { roomIds } = req.body;
  if (!roomIds || roomIds.length === 0) {
    return res.status(400).json({ message: 'No rooms selected.' });
  }
  if (roomIds.length > 5) {
    return res.status(400).json({ message: 'Cannot book more than 5 rooms at a time.' });
  }

  const booking = [];
  for (const roomId of roomIds) {
    const room = rooms.find(r => r.id === roomId && !r.isOccupied);
    if (room) {
      room.isOccupied = true;
      booking.push(room);
    }
  }

  if (booking.length === roomIds.length) {
    const travelTime = calculateTravelTime(booking);
    return res.json({
      message: 'Rooms booked successfully!',
      bookedRooms: booking,
      travelTime,
    });
  }

  res.status(400).json({ message: 'Some selected rooms are already occupied or invalid.' });
});

// Reset all rooms
app.post('/reset', (req, res) => {
  initializeRooms();
  res.json({ message: 'All bookings reset.' });
});

// Randomize room occupancy
app.post('/randomize', (req, res) => {
  rooms.forEach(room => {
    room.isOccupied = Math.random() < 0.5;
  });
  res.json({ message: 'Rooms randomized.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

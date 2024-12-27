const API_URL = 'https://your-backend-url.onrender.com';
let selectedRooms = []; // To store selected room IDs

// Load rooms and render them floor-wise
const loadRooms = async () => {
  try {
    const res = await fetch(`${API_URL}/rooms`);
    const rooms = await res.json();
    const grid = document.getElementById('roomGrid');
    grid.innerHTML = ''; // Clear existing content

    const floors = {};
    // Group rooms by floors
    rooms.forEach(room => {
      if (!floors[room.floor]) floors[room.floor] = [];
      floors[room.floor].push(room);
    });

    // Sort floors in descending order (10th floor on top)
    const sortedFloors = Object.keys(floors).sort((a, b) => b - a);

    // Render rooms floor-wise
    sortedFloors.forEach(floor => {
      const floorContainer = document.createElement('div');
      floorContainer.className = 'floor-container';

      const floorTitle = document.createElement('h2');
      floorTitle.textContent = `Floor ${floor}`;
      floorContainer.appendChild(floorTitle);

      const roomRow = document.createElement('div');
      roomRow.className = 'room-row';

      floors[floor].forEach(room => {
        const roomDiv = document.createElement('div');
        roomDiv.textContent = room.id;
        roomDiv.className = `room ${room.isOccupied ? 'occupied' : 'available'}`;
        if (!room.isOccupied) {
          roomDiv.onclick = () => toggleRoomSelection(room.id);
        }
        roomRow.appendChild(roomDiv);
      });

      floorContainer.appendChild(roomRow);
      grid.appendChild(floorContainer);
    });
  } catch (error) {
    console.error('Error loading rooms:', error);
  }
};

// Toggle room selection
const toggleRoomSelection = (roomId) => {
  if (selectedRooms.includes(roomId)) {
    selectedRooms = selectedRooms.filter(id => id !== roomId);
  } else if (selectedRooms.length < 5) {
    selectedRooms.push(roomId);
  } else {
    displayMessage('You can select up to 5 rooms only.', 'error');
  }
  updateRoomSelection();
};

// Update room selection visually
const updateRoomSelection = () => {
  const grid = document.getElementById('roomGrid');
  const roomDivs = grid.querySelectorAll('.room');
  roomDivs.forEach(div => {
    if (selectedRooms.includes(div.textContent)) {
      div.classList.add('selected');
    } else {
      div.classList.remove('selected');
    }
  });
};

// Display messages in a visual box
const displayMessage = (message, type) => {
  const messageBox = document.getElementById('messageBox');
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
};

// Book selected rooms
const bookSelectedRooms = async () => {
  if (selectedRooms.length === 0) {
    return displayMessage('No rooms selected.', 'error');
  }
  try {
    const res = await fetch(`${API_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomIds: selectedRooms })
    });
    const data = await res.json();
    if (res.status === 200) {
      displayMessage(`Rooms booked successfully! Travel Time: ${data.travelTime} minutes.`, 'success');
      selectedRooms = []; // Clear selection
      loadRooms(); // Refresh room display
    } else {
      displayMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Error booking rooms:', error);
    displayMessage('An error occurred while booking rooms.', 'error');
  }
};

// Reset rooms
const resetRooms = async () => {
  try {
    await fetch(`${API_URL}/reset`, { method: 'POST' });
    loadRooms();
    displayMessage('All bookings have been reset.', 'success');
  } catch (error) {
    console.error('Error resetting rooms:', error);
    displayMessage('An error occurred while resetting rooms.', 'error');
  }
};

// Randomize room occupancy
const randomizeRooms = async () => {
  try {
    await fetch(`${API_URL}/randomize`, { method: 'POST' });
    loadRooms();
    displayMessage('Room availability randomized.', 'success');
  } catch (error) {
    console.error('Error randomizing rooms:', error);
    displayMessage('An error occurred while randomizing rooms.', 'error');
  }
};

// Load initial room data
loadRooms();

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ApiService from '../../service/APIService';
import RoomResult from '../common/RoomResult';

const RoomSearchPage = () => {

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [roomType, setRoomType] = useState('');
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState('');

  // States for room results
  // Full rooms 
  const [rooms, setRooms] = useState([]);
  // Rooms filtered based on search
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Fetch room types from API when component loads for the first time
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(types);
      } catch (err) {
        console.error('Error fetching room types:', err.message);
      }
    };
    fetchRoomTypes();
  }, []); // Empty dependency array ensures it runs once on mount


  const showError = (message, timeout = 5000) => {
    setError(message);
    setTimeout(() => setError(''), timeout);
  };

  // Handle the search button click
  const handleSearch = async () => {
    if (!startDate || !endDate || !roomType) {
      showError('Please select all the fields');
      return;
    }

    try {
      // Format dates to YYYY-MM-DD for API
      const formattedStartDate = startDate.toLocaleDateString('en-CA');
      const formattedEndDate = endDate.toLocaleDateString('en-CA');

      // Fetch available rooms using check-in date, check-out date, and room type from API
      const response = await ApiService.getAvailableRoomsByDateAndType(
        formattedStartDate,
        formattedEndDate,
        roomType
      );

      // Handles no room 
      if (!response?.rooms || response.rooms.length === 0) {
        showError('No rooms available for this date range and room type.');
        setRooms([]);
        setFilteredRooms([]);
        return;
      }

      // Update room state with results
      setRooms(response.rooms);
      setFilteredRooms(response.rooms);
      setError('');
    }
    catch (err) {
      console.error('Error fetching available rooms:', err);
      const message = err?.response?.data?.message || err?.message || 'An unknown error occurred.';
      showError('Error: ' + message);
    }
  };


  return (
    <div className="room-search-page">
      <h2>Search Rooms</h2>

      {/* Search Filters */}
      <div className="search-container">
        <div className="search-field">
          <label>Check-in Date</label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select Check-in Date"
          />
        </div>

        <div className="search-field">
          <label>Check-out Date</label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select Check-out Date"
          />
        </div>

        <div className="search-field">
          <label>Room Type</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option disabled value="">
              Select Room Type
            </option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button className="home-search-button" onClick={handleSearch}>
          Search Rooms
        </button>
      </div>

      {/* Display error messages */}
      {error && <p className="error-message">{error}</p>}

      {/* Display search results */}
      <RoomResult roomSearchResults={filteredRooms} />

    </div>
  );
};

export default RoomSearchPage;

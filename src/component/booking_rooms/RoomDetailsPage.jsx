import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/APIService';
import DatePicker from 'react-datepicker';


const RoomDetailsPage = () => {

  const navigate = useNavigate();

  // State Variables
  const { roomId } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch room details and logged-in user info whenever roomId change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails(response.room);
        const userProfile = await ApiService.getUserProfile();
        setUserId(userProfile.user.id);
      }
      catch (error) {
        setError(error.response?.data?.message || error.message);
      }
      finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId]);


  // Proceed Booking and calculate total price and total guests
  const handleProceedBooking = async () => {
    // Validate that check-in and check-out dates are selected
    if (!checkInDate || !checkOutDate) {
      setErrorMessage('Please select check-in and check-out dates');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    // Validate adults and children counts
    if (isNaN(numAdults) || numAdults < 1 || isNaN(numChildren) || numChildren < 0) {
      setErrorMessage('Please enter valid count for adults and children');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    // Calculate total days of stay
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const totalDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;

    // Calculate total guests and total price
    const totalGuests = numAdults + numChildren;
    const roomPricePerNight = roomDetails.roomPrice;
    const totalPrice = roomPricePerNight * (totalDays-1);

    setTotalPrice(totalPrice);
    setTotalGuests(totalGuests);
  };

  // Confirm and finalize booking  
  const confirmBooking = async () => {
    try {

      // Ensure dates are Date objects
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      console.log("Original Check-in Date:", startDate);
      console.log("Original Check-out Date:", endDate);

      // Convert dates to YYYY-MM-DD format
      const formattedCheckInDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const formattedCheckOutDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      console.log("Formated Check-in Date:", formattedCheckInDate);
      console.log("Formated Check-out Date:", formattedCheckOutDate);

      // Create booking object
      const booking = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        adultCount: numAdults,
        childCount: numChildren,
        guestTotal: totalGuests
      };
      console.log(booking)

      // Make booking API Call
      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate('/rooms');
        }, 10000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };


  // Handle loading and error states
  if (isLoading) {
    return <p className='room-detail-loading'>Loading room details...</p>;
  }

  if (error) {
    return <p className='room-detail-loading'>{error}</p>;
  }

  if (!roomDetails) {
    return <p className='room-detail-loading'>Room not found</p>;
  }

  const { roomType, roomPrice, roomDescription} = roomDetails;

  return (
    <div className="room-details-booking">
      {/* Show booking success message */}
      {showMessage && (
        <p className="booking-success-message">
          Booking successful! Here is your confirmation code: {confirmationCode}.
        </p>
      )}

      {/* Show error message */}
      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}

      {/* Show Room Details */}
      <h2>Room Details</h2>
      <br />
      <div className="room-details-info">
        <h3>Room Type: {roomType}</h3>
        <p>Room Price: ${roomPrice} / night</p>
        <p>Room Description: {roomDescription}</p>
      </div>

      <div className="booking-info">
        <button className="book-now-button" onClick={() => setShowDatePicker(true)}>Book Now</button>
        {showDatePicker && (
          <div className="date-picker-container">
            <DatePicker
              className="detail-search-field"
              selected={checkInDate}
              onChange={(date) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              placeholderText="Check-in Date"
              dateFormat="MM/dd/yyyy"
            />
            <DatePicker
              className="detail-search-field"
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate}
              placeholderText="Check-out Date"
              dateFormat="MM/dd/yyyy"
            />

            <div className='guest-container'>
              <div className="guest-div">
                <label>Adults:</label>
                <input
                  type="number"
                  min="1"
                  value={numAdults}
                  onChange={(e) => setNumAdults(parseInt(e.target.value))}
                />
              </div>
              <div className="guest-div">
                <label>Children:</label>
                <input
                  type="number"
                  min="0"
                  value={numChildren}
                  onChange={(e) => setNumChildren(parseInt(e.target.value))}
                />
              </div>
              <button className="confirm-booking" onClick={handleProceedBooking}>Proceed</button>
            </div>
          </div>
        )}

        {/* Show calculated total price and confirm booking button */}
        {totalPrice > 0 && (
          <div className="total-price">
            <p>Total Price: ${totalPrice}</p>
            <p>Total Guests: {totalGuests}</p>
            <button onClick={confirmBooking} className="accept-booking">Confirm Booking</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
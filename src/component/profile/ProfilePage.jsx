import { useState, useEffect } from 'react';
import ApiService from '../../service/APIService';

const ProfilePage = () => {

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  // Load user info and bookings
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await ApiService.getUserProfile();
        const userPlusBookings = await ApiService.getUserBookings(response.user.id);
        setUser(userPlusBookings.user);
      }
      catch (error) {
        setError(error.response?.data?.message || error.message);
      }
    };

    fetchUserProfile();
  }, []);

  // Search booking by confirmation code
  const handleSearch = async () => {

    // If input is empty, reset bookings details and display all the bookings
    if (!confirmationCode.trim()) {
      setBookingDetails(null);
      setError(null);
      return;
    }

    // Booking confirmation code is provided, then search that booking
    try {
      const response = await ApiService.getBookingByConfirmationCode(confirmationCode);
      setBookingDetails(response.booking);
      setError(null);
    }
    catch (error) {
      setBookingDetails(null);  // no specific booking to show
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="profile-page">

      {user && <h2>Welcome, {user.name}</h2>}

      {error && <p className="error-message">{error}</p>}

      {/* User Personal Info */}
      {user && (
        <div className="profile-details">
          <h3>User Info</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
        </div>
      )}

      {/* Booking Search Section */}
      <div className="bookings-section">
        <h3>Booking History</h3>

        <div className="search-container">
          <input
            className="input-field"
            type="text"
            placeholder="Enter your booking confirmation code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Show Only searched booking */}
        {bookingDetails && (
          <div className="booking-details">
            <h3>Booking Details</h3>
            <p><strong>Confirmation Code:</strong> {bookingDetails.bookingConfirmationCode}</p>
            <p><strong>Check-in Date:</strong> {bookingDetails.checkInDate}</p>
            <p><strong>Check-out Date:</strong> {bookingDetails.checkOutDate}</p>
            <p><strong>Num Of Adults:</strong> {bookingDetails.adultCount}</p>
            <p><strong>Num Of Children:</strong> {bookingDetails.childCount}</p>
            {bookingDetails.totalPrice && (
              <p><strong>Total Price Paid:</strong> ${parseFloat(bookingDetails.totalPrice).toFixed(2)}</p>
            )}

            <hr />
            <h3>User Details</h3>
            <p><strong>Name:</strong> {bookingDetails.user.name}</p>
            <p><strong>Email:</strong> {bookingDetails.user.email}</p>
            <p><strong>Phone Number:</strong> {bookingDetails.user.phoneNumber}</p>

            <hr />
            <h3>Room Details</h3>
            <p><strong>Room Type:</strong> {bookingDetails.room.roomType}</p>
          </div>
        )}

        {/* Show all the bookings when booking confirmation is not provided*/}
        {!bookingDetails && (
          <div className="booking-container">
            {user && user.bookings.length > 0 ? (
              <ul className="booking-list">
                {user.bookings.map((booking) => (
                  <div key={booking.id} className="booking-item">
                    <ul>
                      <li><strong>Booking Code:</strong> {booking.bookingConfirmationCode}</li>
                      <li><strong>Check-in Date:</strong> {booking.checkInDate}</li>
                      <li><strong>Check-out Date:</strong> {booking.checkOutDate}</li>
                      <li><strong>Total Guests:</strong> {booking.guestTotal}</li>
                      <li><strong>Room Type:</strong> {booking.room.roomType}</li>
                      {booking.totalPrice && (
                        <li><strong>Total Price Paid:</strong> ${parseFloat(booking.totalPrice).toFixed(2)}</li>
                      )}
                    </ul>
                  </div>
                ))}
              </ul>
            ) : (
              <p>No bookings found</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;

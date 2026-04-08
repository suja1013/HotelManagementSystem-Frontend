import { useState, useEffect } from 'react';
import ApiService from '../../service/APIService';

const ProfilePage = () => {

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);

  // Cancellation state
  const [cancelPreview, setCancelPreview]       = useState(null);   // { bookingId, message, refund }
  const [cancelSuccess, setCancelSuccess]       = useState('');
  const [cancelLoading, setCancelLoading]       = useState(false);

  // ── Reload user profile (called after cancellation to refresh the list) ──
  const loadUserProfile = async () => {
    try {
      const response = await ApiService.getUserProfile();
      const userPlusBookings = await ApiService.getUserBookings(response.user.id);
      setUser(userPlusBookings.user);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Load user info and bookings on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Search booking by confirmation code
  const handleSearch = async () => {
    if (!confirmationCode.trim()) {
      setBookingDetails(null);
      setError(null);
      return;
    }
    try {
      const response = await ApiService.getBookingByConfirmationCode(confirmationCode);
      setBookingDetails(response.booking);
      setError(null);
    } catch (error) {
      setBookingDetails(null);
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Step 1 — fetch refund preview and show confirmation dialog
  const handleCancelClick = async (bookingId) => {
    try {
      setCancelLoading(true);
      const response = await ApiService.previewCancellation(bookingId);
      if (response.statusCode === 200) {
        setCancelPreview({
          bookingId,
          message: response.message,
          refund: response.cancellationRefund,
        });
      } else {
        setError(response.message);
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setCancelLoading(false);
    }
  };

  // Step 2 — user confirmed cancellation
  const handleConfirmCancel = async () => {
    if (!cancelPreview) return;
    try {
      setCancelLoading(true);
      const response = await ApiService.cancelBooking(cancelPreview.bookingId);
      if (response.statusCode === 200) {
        setCancelSuccess(response.message);
        setCancelPreview(null);
        await loadUserProfile();           // refresh booking list
        setTimeout(() => setCancelSuccess(''), 6000);
      } else {
        setError(response.message);
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setCancelLoading(false);
    }
  };

  // Dismiss the preview dialog without cancelling
  const handleDismissPreview = () => setCancelPreview(null);

  return (
    <div className="profile-page">

      {user && <h2>Welcome, {user.name}</h2>}

      {error && <p className="error-message">{error}</p>}

      {/* Cancellation success message */}
      {cancelSuccess && (
        <div className="cancel-success-message">
          ✅ {cancelSuccess}
        </div>
      )}

      {/* ── Cancellation Confirmation Dialog ── */}
      {cancelPreview && (
        <div className="cancel-overlay">
          <div className="cancel-dialog">
            <h3>Cancel Booking?</h3>
            <p className="cancel-dialog-message">{cancelPreview.message}</p>

            {parseFloat(cancelPreview.refund) > 0 ? (
              <div className="cancel-refund-badge refund-positive">
                💰 Refund: <strong>${parseFloat(cancelPreview.refund).toFixed(2)}</strong>
              </div>
            ) : (
              <div className="cancel-refund-badge refund-zero">
                ⚠️ No refund applicable for this cancellation.
              </div>
            )}

            <div className="cancel-dialog-actions">
              <button
                className="cancel-confirm-btn"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
              <button
                className="cancel-dismiss-btn"
                onClick={handleDismissPreview}
                disabled={cancelLoading}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Show only searched booking */}
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

        {/* Show all bookings when no confirmation code is searched */}
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

                    {/* Cancel button — only show if check-in is in the future */}
                    {new Date(booking.checkInDate) > new Date() && (
                      <button
                        className="cancel-booking-btn"
                        onClick={() => handleCancelClick(booking.id)}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? 'Loading...' : '✕ Cancel Booking'}
                      </button>
                    )}
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

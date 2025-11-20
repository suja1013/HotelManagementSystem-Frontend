import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/APIService'; 

const EditBookingPage = () => {
    const navigate = useNavigate();
    const { bookingCode } = useParams();
    const [bookingDetails, setBookingDetails] = useState(null); 
    const [error, setError] = useState(null); 
    const [success, setSuccess] = useState(null); 

    // Fetch booking details when bookingCode changes
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                // API call to get booking details by confirmation code
                const response = await ApiService.getBookingByConfirmationCode(bookingCode);
                setBookingDetails(response.booking);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchBookingDetails();
    }, [bookingCode]); // Dependency array ensures fetch runs when bookingCode changes


     // Function to delete a booking
    const deleteBooking = async (bookingId) => {
        // Confirm before deleting
        if (!window.confirm('Are you sure you want to delete this booking?')) {
            return; 
        }

        try {
            // API call to delete booking by ID
            const response = await ApiService.deleteBooking(bookingId);
            if (response.statusCode === 200) {
                setSuccess("Booking deleted successfully")
                
                setTimeout(() => {
                    setSuccess('');
                    navigate('/admin/manage-bookings');
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="find-booking-page">
            <h2>Booking Detail</h2>
            {/* Display error or success messages */}
            {error && <p className='error-message'>{error}</p>}
            {success && <p className='success-message'>{success}</p>}

            {/* Display booking details if available */}
            {bookingDetails && (
                <div className="booking-details">
                    <h3>Booking Details</h3>
                    <p>Confirmation Code: {bookingDetails.bookingConfirmationCode}</p>
                    <p>Check-in Date: {bookingDetails.checkInDate}</p>
                    <p>Check-out Date: {bookingDetails.checkOutDate}</p>

                    <hr />

                    <h3>User Details</h3>
                    <div>
                        <p> Name: {bookingDetails.user.name}</p>
                        <p> Email: {bookingDetails.user.email}</p>
                        <p> Phone Number: {bookingDetails.user.phoneNumber}</p>
                    </div>

                    <hr />
                    <h3>Room Details</h3>
                    <div>
                        <p> Room Type: {bookingDetails.room.roomType}</p>
                        <p> Room Price: ${bookingDetails.room.roomPrice}</p>
                        <p> Room Description: {bookingDetails.room.roomDescription}</p>
                    </div>

                    {/* Delete booking button */}
                    <button
                        className="delete-booking"
                        onClick={() => deleteBooking(bookingDetails.id)}>Delete Booking
                    </button>
                </div>
            )}
        </div>
    );
};

export default EditBookingPage;
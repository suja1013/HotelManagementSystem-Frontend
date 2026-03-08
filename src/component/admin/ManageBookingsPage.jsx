import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/APIService';


const ManageBookingsPage = () => {

    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch all bookings on component mount
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // Call API to get all bookings
                const response = await ApiService.getAllBookings();
                // Fallback to empty array if response has no bookings
                const allBookings = response.bookings || [];
                setBookings(allBookings);
                setFilteredBookings(allBookings);
            }
            catch (error) {
                console.error('Error fetching bookings:', error.message);
                setBookings([]);
                setFilteredBookings([]);
            }
            finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Re-filter bookings whenever search term or bookings change
    useEffect(() => {
        filterBookings(searchTerm);
    }, [searchTerm, bookings]);

    // Function to filter bookings based on search term (booking confimation code)
    const filterBookings = (term) => {
        if (!term) {
            // No search term: show all bookings
            setFilteredBookings(bookings);
        } else {
            // Update bookings based on booking code filter
            const filtered = bookings.filter((booking) =>
                booking.bookingConfirmationCode?.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredBookings(filtered);
        }
    };

    // Handle input change in search box
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className='bookings-container'>
            <h2>All Bookings</h2>
            
            {/* Search box for filtering bookings by booking confirmation code */}
            <div className='search-div'>
                <label>Filter by Booking Number:</label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Enter booking confirmation code"
                />
            </div>

            {/* Conditional rendering based on loading state and filtered results */}
            {loading ? (
                <p>Loading the bookings...</p>
            ) : filteredBookings.length === 0 ? (
                <p>No bookings found</p>
            ) : (
                <>
                    <div className="booking-results">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="booking-result-item">
                                <p><strong>Booking Code:</strong> {booking.bookingConfirmationCode}</p>
                                <p><strong>Check In Date:</strong> {booking.checkInDate}</p>
                                <p><strong>Check Out Date:</strong> {booking.checkOutDate}</p>
                                <p><strong>Total Guests:</strong> {booking.guestTotal}</p>
                                {booking.totalPrice && (
                                  <p><strong>Total Price:</strong> ${parseFloat(booking.totalPrice).toFixed(2)}</p>
                                )}
                                <button
                                    className="edit-room-button"
                                    onClick={() => navigate(`/admin/edit-booking/${booking.bookingConfirmationCode}`)}
                                >
                                    Manage Booking
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );


};

export default ManageBookingsPage;

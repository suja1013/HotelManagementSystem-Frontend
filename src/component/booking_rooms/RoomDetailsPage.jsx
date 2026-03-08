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

  // Dynamic pricing state
  const [dynamicPricing, setDynamicPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

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


  // Fetch dynamic price whenever check-in date changes
  useEffect(() => {
    const fetchDynamicPrice = async () => {
      if (!checkInDate || !roomId) return;

      // Format date to YYYY-MM-DD
      const formatted = new Date(checkInDate.getTime() - (checkInDate.getTimezoneOffset() * 60000))
        .toISOString().split('T')[0];

      try {
        setPricingLoading(true);
        const result = await ApiService.getDynamicPrice(roomId, formatted);
        setDynamicPricing(result);
      } catch (err) {
        // Silently ignore pricing fetch errors — fallback to base price
        setDynamicPricing(null);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchDynamicPrice();
  }, [checkInDate, roomId]);


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
    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const totalDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;

    // Calculate total guests and total price
    const totalGuests = numAdults + numChildren;

    // Use dynamic price per night if available, otherwise fall back to base price
    const pricePerNight = dynamicPricing ? dynamicPricing.dynamicPrice : roomDetails.roomPrice;
    const totalPrice = pricePerNight * (totalDays - 1);

    setTotalPrice(totalPrice);
    setTotalGuests(totalGuests);
  };

  // Confirm and finalize booking  
  const confirmBooking = async () => {
    try {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      console.log("Original Check-in Date:", startDate);
      console.log("Original Check-out Date:", endDate);

      const formattedCheckInDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const formattedCheckOutDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      console.log("Formated Check-in Date:", formattedCheckInDate);
      console.log("Formated Check-out Date:", formattedCheckOutDate);

      const booking = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        adultCount: numAdults,
        childCount: numChildren,
        guestTotal: totalGuests
      };
      console.log(booking)

      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate('/rooms');
        }, 5000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };


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

            {/* Dynamic Pricing Breakdown — shown as soon as check-in date is picked */}
            {checkInDate && (
              <div className="dynamic-pricing-box">
                <h4 className="dynamic-pricing-title">
                  💰 Dynamic Pricing Breakdown
                </h4>

                {pricingLoading ? (
                  <p className="dynamic-pricing-loading">Calculating price...</p>
                ) : dynamicPricing ? (
                  <div className="dynamic-pricing-details">

                    {/* Demand insight */}
                    <div className={`pricing-insight ${dynamicPricing.demandFactor > 1 ? 'insight-high' : dynamicPricing.demandFactor < 1 ? 'insight-low' : 'insight-neutral'}`}>
                      <span className="insight-icon">📊</span>
                      <div className="insight-body">
                        <span className="insight-text">
                          {dynamicPricing.demandFactor >= 1.30
                            ? "Rooms are filling up fast — very high demand right now."
                            : dynamicPricing.demandFactor >= 1.15
                            ? "High demand — most rooms are already booked."
                            : dynamicPricing.demandFactor <= 0.90
                            ? "Plenty of rooms available — you're getting a good deal."
                            : "Demand is normal at the moment."}
                        </span>
                        {dynamicPricing.demandFactor !== 1.0 && (
                          <span className="insight-amount">
                            ${dynamicPricing.baseRate} × {dynamicPricing.demandFactor.toFixed(2)} = <strong>${(dynamicPricing.baseRate * dynamicPricing.demandFactor).toFixed(2)}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time/booking window insight */}
                    <div className={`pricing-insight ${dynamicPricing.timeFactor > 1 ? 'insight-high' : dynamicPricing.timeFactor < 1 ? 'insight-low' : 'insight-neutral'}`}>
                      <span className="insight-icon">⏰</span>
                      <div className="insight-body">
                        <span className="insight-text">
                          {dynamicPricing.timeFactor >= 1.20
                            ? "Last-minute booking — prices are higher for same-day or next-day stays."
                            : dynamicPricing.timeFactor >= 1.10
                            ? "Booking within the week — near-term stays carry a small premium."
                            : dynamicPricing.timeFactor <= 0.90
                            ? "Great timing! Booking well in advance earns you an early-bird discount."
                            : "Standard booking window — no time-based adjustment."}
                        </span>
                        {dynamicPricing.timeFactor !== 1.0 && (
                          <span className="insight-amount">
                            ${dynamicPricing.baseRate} × {dynamicPricing.timeFactor.toFixed(2)} = <strong>${(dynamicPricing.baseRate * dynamicPricing.timeFactor).toFixed(2)}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Weather insight */}
                    <div className={`pricing-insight ${dynamicPricing.weatherFactor > 1 ? 'insight-high' : dynamicPricing.weatherFactor < 1 ? 'insight-low' : 'insight-neutral'}`}>
                      <span className="insight-icon">🌤</span>
                      <div className="insight-body">
                        <span className="insight-text">
                          {dynamicPricing.weatherFactor >= 1.15
                            ? "Sunny and clear skies — great weather drives higher demand."
                            : dynamicPricing.weatherFactor >= 1.05
                            ? "Cloudy weather expected — slightly elevated demand."
                            : dynamicPricing.weatherFactor <= 0.80
                            ? "Severe weather conditions — prices are reduced to reflect lower demand."
                            : dynamicPricing.weatherFactor <= 0.90
                            ? "Rainy weather ahead — prices are slightly reduced."
                            : "Weather conditions are neutral today."}
                        </span>
                        {dynamicPricing.weatherFactor !== 1.0 && (
                          <span className="insight-amount">
                            ${dynamicPricing.baseRate} × {dynamicPricing.weatherFactor.toFixed(2)} = <strong>${(dynamicPricing.baseRate * dynamicPricing.weatherFactor).toFixed(2)}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Final price with formula breakdown */}
                    <div className="pricing-row pricing-row-final">
                      <span className="pricing-label">Price / night</span>
                      <div className="pricing-final-block">
                        <span className="pricing-formula">
                          ${dynamicPricing.baseRate} × {dynamicPricing.demandFactor.toFixed(2)} × {dynamicPricing.timeFactor.toFixed(2)} × {dynamicPricing.weatherFactor.toFixed(2)}
                        </span>
                        <span className="pricing-value-final">${dynamicPricing.dynamicPrice}</span>
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="dynamic-pricing-loading">Using base rate (pricing service unavailable)</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Show calculated total price and confirm booking button */}
        {totalPrice > 0 && (
          <div className="total-price">
            <p>Total Price: ${totalPrice.toFixed(2)}</p>
            <p>Total Guests: {totalGuests}</p>
            <button onClick={confirmBooking} className="accept-booking">Confirm Booking</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;

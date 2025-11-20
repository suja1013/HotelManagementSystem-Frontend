import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/APIService';

const RoomResult = ({ roomSearchResults }) => {
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();
    return (
        <section className="room-results">
            {/* Render rooms only if there are search results */}
            {roomSearchResults && roomSearchResults.length > 0 && (
                <div className="room-list">
                    {roomSearchResults.map(room => (
                        <div key={room.id} className="room-list-item">
                            <div className="room-details">
                                <h3>{room.roomType}</h3>
                                <p>Price: ${room.roomPrice} / night</p>
                                <p>Description: {room.roomDescription}</p>
                                <button
                                    className="book-now-button"
                                    onClick={() => navigate(`/room-details-book/${room.id}`)} // Navigate to book room with room ID
                                >
                                    View/Book Room
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default RoomResult;
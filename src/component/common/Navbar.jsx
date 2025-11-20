import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../../service/APIService';


// Navigation bar providing links based on user role and authentication status
function Navbar() {

    // Check if user is logged in and their role
    const isAuthenticated = ApiService.isAuthenticated();
    // Check if user is admin
    const isAdmin = ApiService.isAdmin();
    // Check if the user is normal user
    const isUser = ApiService.isUser();
    const navigate = useNavigate();
    const location = useLocation();

    // Handles user logout
    const handleLogout = () => {
    const isLogout = window.confirm('Are you sure you want to logout?');
    if (!isLogout) {
        // User clicked Cancel → do nothing
        // return - Prevents any further code from running, so user stays on the page.
        return;
    }

    // Only logout if user confirmed
    ApiService.logout(); 
    navigate('/home'); // or wherever you want
};

    return (
        <nav className="navbar">
            <ul className="navbar-ul">
                {/* Public navigation links */}
                <li><NavLink to="/home" activeclassname="active">Home</NavLink></li>
                

                {/* User-specific links */}
                {isUser && <li><NavLink to="/rooms" activeclassname="active">Rooms</NavLink></li>}
                {isUser && <li><NavLink to="/find-booking" activeclassname="active">View my Bookings</NavLink></li>}
                {isUser && <li><NavLink to="/profile" activeclassname="active">User</NavLink></li>}
                

                {/* Admin-specific link */}
                {isAdmin && <li><NavLink to="/admin" activeclassname="active">Admin</NavLink></li>}

                {/* Auth links */}
                {!isAuthenticated &&<li><NavLink to="/login" activeclassname="active">Login</NavLink></li>}
                {!isAuthenticated &&<li><NavLink to="/register" activeclassname="active">Register</NavLink></li>}

                {/* Logout link for authenticated users */}
                {isAuthenticated && (
                    <li>
                        <span
                            className={`navlink-style ${location.pathname === '/logout' ? 'active' : ''}`}
                            onClick={handleLogout}
                        >
                            Logout
                        </span>
                    </li>
                )}
            </ul>        
        </nav>
    );
}

export default Navbar;
// Import React Router and app components
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './component/common/Navbar';
import FooterComponent from './component/common/Footer';
import LoginPage from './component/auth/LoginPage';
import RegisterPage from './component/auth/RegisterPage';
import HomePage from './component/home/HomePage';
import RoomDetailsBookingPage from './component/booking_rooms/RoomDetailsPage';
import AdminPage from './component/admin/AdminPage';
import ManageRoomPage from './component/admin/ManageRoomPage';
import EditRoomPage from './component/admin/EditRoomPage';
import AddRoomPage from './component/admin/AddRoomPage';
import ManageBookingsPage from './component/admin/ManageBookingsPage';
import EditBookingPage from './component/admin/EditBookingPage';
import ProfilePage from './component/profile/ProfilePage';
import { ProtectedRoute, AdminRoute } from './service/guard';
import RoomSearch from './component/common/RoomSearch';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            {/* Public Routes accessed without login */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            

            {/* Protected Routes (only for logged-in users) */}
            <Route
              path="/room-details-book/:roomId"
              element={
                <ProtectedRoute>
                  <RoomSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room-details-book/:roomId"
              element={
                <ProtectedRoute>
                  <RoomDetailsBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            

            {/* Only Role: Admin can access these Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/manage-rooms"
              element={
                <AdminRoute>
                  <ManageRoomPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/edit-room/:roomId"
              element={
                <AdminRoute>
                  <EditRoomPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-room"
              element={
                <AdminRoute>
                  <AddRoomPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/manage-bookings"
              element={
                <AdminRoute>
                  <ManageBookingsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/edit-booking/:bookingCode"
              element={
                <AdminRoute>
                  <EditBookingPage />
                </AdminRoute>
              }
            />


            {/* Fallback Route — redirects unknown paths to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
        <FooterComponent />
      </div>
    </BrowserRouter>
  );
}

export default App;
import axios from "axios"

export default class APIService {

    // Base URL of the backend API
    static BASE_URL = "http://localhost:1008"

    // Helper method to generate authorization headers for secured requests
    static getHeader() {
        const token = localStorage.getItem("token");
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    }

    // AUTHENTICATION

     // Registers a new user with the backend
    static async registerUser(registration) {
        const response = await axios.post(`${this.BASE_URL}/auth/register`, registration)
        return response.data
    }

    // Logs in a registered user and retrieves the authentication token
    static async loginUser(loginDetails) {
        const response = await axios.post(`${this.BASE_URL}/auth/login`, loginDetails)
        return response.data
    }

    // USER MANAGEMENT 


    // Retrieves the currently logged-in user’s profile
    static async getUserProfile() {
        const response = await axios.get(`${this.BASE_URL}/users/get-logged-in-profile-info`, {
            headers: this.getHeader()
        })
        return response.data
    }

    // Retrieves all bookings made by a specific user
    static async getUserBookings(userId) {
        const response = await axios.get(`${this.BASE_URL}/users/get-user-bookings/${userId}`, {
            headers: this.getHeader()
        })
        return response.data
    }


    // ROOM MANAGEMENT 


    // Adds a new room
    static async addRoom(formData) {
        const result = await axios.post(`${this.BASE_URL}/rooms/add`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }

    // Retrieves available rooms filtered by date range and room type
    static async getAvailableRoomsByDateAndType(checkInDate, checkOutDate, roomType) {
        const result = await axios.get(
            `${this.BASE_URL}/rooms/available-rooms-by-date-and-type?checkInDate=${checkInDate}
		&checkOutDate=${checkOutDate}&roomType=${roomType}`
        )
        return result.data
    }

    // Retrieves all room types
    static async getRoomTypes() {
        const response = await axios.get(`${this.BASE_URL}/rooms/types`)
        return response.data
    }

    // Retrieves all rooms
    static async getAllRooms() {
        const result = await axios.get(`${this.BASE_URL}/rooms/all`)
        return result.data
    }

    // Retrieves details of a specific room by ID
    static async getRoomById(roomId) {
        const result = await axios.get(`${this.BASE_URL}/rooms/room-by-id/${roomId}`)
        return result.data
    }

    // Deletes a room by ID
    static async deleteRoom(roomId) {
        const result = await axios.delete(`${this.BASE_URL}/rooms/delete/${roomId}`, {
            headers: this.getHeader()
        })
        return result.data
    }

    // Updates room details
    static async updateRoom(roomId, formData) {
        const result = await axios.put(`${this.BASE_URL}/rooms/update/${roomId}`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return result.data;
    }


    // BOOKING MANAGEMENT 


    // Creates a new booking for a specific user and room
    static async bookRoom(roomId, userId, booking) {

        console.log("USER ID IS: " + userId)

        const response = await axios.post(`${this.BASE_URL}/bookings/book-room/${roomId}/${userId}`, booking, {
            headers: this.getHeader()
        })
        return response.data
    }

    // Retrieves all bookings
    static async getAllBookings() {
        const result = await axios.get(`${this.BASE_URL}/bookings/all`, {
            headers: this.getHeader()
        })
        return result.data
    }

    // Retrieves booking details by confirmation code
    static async getBookingByConfirmationCode(bookingCode) {
        const result = await axios.get(`${this.BASE_URL}/bookings/get-by-confirmation-code/${bookingCode}`)
        return result.data
    }

    // Deletes a booking by ID
    static async deleteBooking(bookingId) {
        const result = await axios.delete(`${this.BASE_URL}/bookings/delete/${bookingId}`, {
            headers: this.getHeader()
        })
        return result.data
    }

    //DYNAMIC PRICING

    // Fetches dynamic price breakdown for a room and check-in date
    static async getDynamicPrice(roomId, checkInDate) {
        const result = await axios.get(
            `${this.BASE_URL}/pricing/calculate?roomId=${roomId}&checkInDate=${checkInDate}`
        )
        return result.data
    }

    //AUTHENTICATION HELPERS 


    // Logs out the user by clearing stored token and role
    static logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
    }

    // Checks if the user is authenticated (has a valid token)
    static isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    }

    // Checks if the logged-in user has an admin role
    static isAdmin() {
        const role = localStorage.getItem('role')
        return role === 'ADMIN'
    }

    // Checks if the logged-in user has user role
    static isUser() {
        const role = localStorage.getItem('role')
        return role === 'USER'
    }
}

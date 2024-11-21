
async function loadAdminLocations() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/locations', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const locations = await response.json();
        if (response.ok) {
            const locationsContainer = document.getElementById('locations-list');
            locationsContainer.innerHTML = '';
            locations.forEach(location => {
                const locationItem = document.createElement('div');
                locationItem.className = 'location-item';
                locationItem.innerHTML = `
                    <h3>${location.location_name}</h3>
                    <p>City: ${location.city}</p>
                    <p>Sport: ${location.sport}</p>
                    <p>Price per 3 hours: ${location.price_per_3_hours}</p>
                    <p>Maximum Capacity: ${location.max_capacity}</p>
                    <button onclick="viewLocationBookings(${location.location_id})">View Bookings</button>
                    <button onclick="showUpdateLocationForm(${location.location_id}, ${location.price_per_3_hours})">Update</button>
                    <button onclick="deleteLocation(${location.location_id})">Delete</button>
                    <div class="update-form" id="update-form-${location.location_id}"></div>
                    <div class="location-booking-form" id="location-booking-form-${location.location_id}"></div>
                `;
                locationsContainer.appendChild(locationItem);
            });
        } else {
            console.error('Failed to load locations:', locations.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
async function allAdminBookings() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/bookings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const bookings = await response.json();
        if (response.ok) {
            const bookingsContainer = document.getElementById('bookings-list');
            bookingsContainer.innerHTML = ''; // Clear previous content

            bookings.forEach(booking => {
                const bookingItem = document.createElement('div');
                bookingItem.className = 'booking-item';
                bookingItem.innerHTML = `
                    <h3>Booking ID: ${booking.booking_id}</h3>
                    <p>Location: ${booking.location_name}</p>
                    <p>User Name: ${booking.username}</p>
                    <p>Date: ${booking.date}</p>
                    <p>Slots: ${booking.slots}</p>
                    <p>Location Fee: ${booking.location_fee}</p>
                `;
                bookingsContainer.appendChild(bookingItem); // Append to the correct container
            });
        } else {
            console.error('Failed to load bookings:', bookings.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function showUpdateLocationForm(locationId, currentPrice) {
    const updateContainer = document.getElementById(`update-form-${locationId}`);

    if (updateContainer.innerHTML === '') {
        updateContainer.innerHTML = `
            <h3>Update Price for Location ID: ${locationId}</h3>
            <p>Current Price per 3 hours: ${currentPrice}</p>
            <label for="new-price-${locationId}">New Price per 3 hours:</label>
            <input type="number" id="new-price-${locationId}" required value="${currentPrice}"><br>
            <button onclick="saveUpdatedPrice(${locationId})">Save changes</button>
        `;
    }
}

async function saveUpdatedPrice(locationId) {
    const newPrice = document.getElementById(`new-price-${locationId}`).value;
    if (!newPrice) {
        alert("Please enter a valid price.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/admin/locations/${locationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ price_per_3_hours: newPrice })
        });

        if (response.ok) {
            alert('Location price updated successfully');
            document.getElementById(`update-form-${locationId}`).innerHTML = '';
            loadAdminLocations();
        } else {
            const data = await response.json();
            alert(`Failed to update location: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the location price.');
    }
}

async function viewLocationBookings(locationId) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/locations/${locationId}/bookings`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const bookings = await response.json();
        if (response.ok) {
            displayBookingsForLocation(bookings, locationId);
        } else {
            console.error('Failed to load bookings');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayBookingsForLocation(bookings, locationId) {
    const bookingsContainer = document.getElementById(`location-booking-form-${locationId}`);
    bookingsContainer.innerHTML = ''; // Clear previous content

    if (bookings.length === 0) {
        bookingsContainer.innerHTML = `<p>No bookings available for this location.</p>`;
        return;
    }

    bookings.forEach((booking, index) => {
        const bookingItem = document.createElement('div');
        bookingItem.className = 'booking-item';
        bookingItem.innerHTML = `
            <h6>Booking ${index +1}</h6>
            <p><strong>User Name:</strong> ${booking.user_name}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Slots:</strong> ${booking.slots}</p>
            <p><strong>Location Fee:</strong> ${booking.location_fee}</p>
        `;
        bookingsContainer.appendChild(bookingItem);
    });
}

async function deleteLocation(locationId) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/locations/${locationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            alert('Location deleted successfully');
            loadAdminLocations();
        } else {
            console.error('Failed to delete location');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
async function loadTotalRevenue() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/total-revenue', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await response.json();
        
        if (response.ok) {
            const totalRevenueContainer = document.getElementById('total');
            totalRevenueContainer.textContent = ` Rs. ${data.totalRevenue}`;
        } else {
            console.error('Failed to load total revenue:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
async function addLocation() {
    const location_name = document.getElementById('location_name').value;
    const city = document.getElementById('city').value;
    const sport = document.getElementById('sport').value;
    const price_per_3_hours = parseFloat(document.getElementById('price_per_3_hours').value);
    const max_capacity = parseInt(document.getElementById('max_capacity').value);

    // Ensure the input values are valid
    if (!location_name || !city || !sport || isNaN(price_per_3_hours) || isNaN(max_capacity)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    try {
        // Make the request to the backend API
        const response = await fetch('http://localhost:3000/api/admin/locations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                location_name,
                city,
                sport,
                price_per_3_hours,
                max_capacity
            })
        });

        // Process the response
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            alert('Location added successfully!');
            document.getElementById('add-location-form').reset(); // Clear form fields
            loadAdminLocations(); // Refresh the locations list
        } else {
            console.error('Failed to add location:', data.error);
            alert(`Failed to add location: ${data.error}`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        alert('An unexpected error occurred while adding the location.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAdminLocations();
});
document.addEventListener('DOMContentLoaded', () => {
    loadTotalRevenue();
});
document.addEventListener('DOMContentLoaded', () => {
    allAdminBookings();
});
document.getElementById('add-location-form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    addLocation();
});


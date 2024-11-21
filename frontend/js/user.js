async function loadUserBookings() {
    try {
        const response = await fetch('http://localhost:3000/api/bookings/user', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const data = await response.json();
        const bookingsContainer = document.getElementById('user-bookings');
        bookingsContainer.innerHTML = '';

        if (response.ok) {
            bookingsContainer.innerHTML = '<h3>Past Bookings</h3>';
            if (Array.isArray(data) && data.length > 0) {
                // If there are bookings, display each booking
                data.forEach(booking => {
                    const bookingItem = document.createElement('div');
                    bookingItem.className = 'booking-item';
                    bookingItem.innerHTML = `
                        <h3>${booking.location_name}</h3>
                        <p>City: ${booking.city}</p>
                        <p>Sport: ${booking.sport}</p>
                        <p>Date: ${booking.date}</p>
                        <p>Slots: ${booking.slots}</p>
                        <p>Amount: ${booking.total_price}</p>
                    `;
                    bookingsContainer.appendChild(bookingItem);
                });
            } else {
                // No bookings found
                bookingsContainer.innerHTML = `<p>No bookings found for this user.</p>`;
            }
        } else {
            console.error('Failed to load bookings:', data.message);
            bookingsContainer.innerHTML = `<p>Error loading bookings. Please try again later.</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        bookingsContainer.innerHTML = `<p>Error loading bookings. Please try again later.</p>`;
    }
}


async function searchLocations() {
    const query = document.getElementById('search-query').value;

    if (!query) {
        alert('Please enter a search term.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/search/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const locations = await response.json();
        if (response.ok) {
            displayLocations(locations);
        } else {
            document.getElementById('locations').innerHTML = `<p>No results available</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayLocations(locations) {
    const locationsContainer = document.getElementById('locations');
    locationsContainer.innerHTML = '';

    if (locations.length === 0) {
        locationsContainer.innerHTML = `<p>No results available</p>`;
        return;
    }
    locations.forEach(location => {
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        locationItem.innerHTML = `
            <h3>${location.location_name}</h3>
            <p>City: ${location.city}</p>
            <p>Sport: ${location.sport}</p>
            <p>Price per 3 hours: ${location.price_per_3_hours}</p>
            <p>Maximum Capacity: ${location.max_capacity}</p>  
            <button onclick="window.location.href='locationbooking.html?location_id=${location.location_id}'">View and Book</button>
        `;
        locationsContainer.appendChild(locationItem);
    });
}

async function loadFilterOptions() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Session expired. Please log in again.");
            window.location.href = 'index.html';
            return;
        }

        const response = await fetch('http://localhost:3000/api/search/filteroptions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok) {
            const cityContainer = document.getElementById('city-filter');
            cityContainer.innerHTML = ''; // Clear any previous options
            const cityHeader = document.createElement('h4');
            cityHeader.textContent = 'City';
            cityContainer.appendChild(cityHeader);
            
            // Add a wrapper for all city checkboxes to style as a grid
            const cityOptionsWrapper = document.createElement('div');
            cityOptionsWrapper.className = 'filter-options-wrapper';
            
            data.cities.forEach(city => {
                const optionWrapper = document.createElement('div');
                optionWrapper.className = 'filter-option';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'city';
                checkbox.value = city;

                const label = document.createElement('label');
                label.textContent = city;
                
                // Append the checkbox to the label for clickable text
                label.prepend(checkbox);

                optionWrapper.appendChild(label);
                cityOptionsWrapper.appendChild(optionWrapper);
            });
            
            cityContainer.appendChild(cityOptionsWrapper);

            // Repeat similar structure for sports filter
            const sportContainer = document.getElementById('sport-filter');
            sportContainer.innerHTML = '';
            const sportHeader = document.createElement('h4');
            sportHeader.textContent = 'Sports';
            sportContainer.appendChild(sportHeader);
            
            const sportOptionsWrapper = document.createElement('div');
            sportOptionsWrapper.className = 'filter-options-wrapper';
            
            data.sports.forEach(sport => {
                const optionWrapper = document.createElement('div');
                optionWrapper.className = 'filter-option';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'sport';
                checkbox.value = sport;

                const label = document.createElement('label');
                label.textContent = sport;
                
                label.prepend(checkbox);

                optionWrapper.appendChild(label);
                sportOptionsWrapper.appendChild(optionWrapper);
            });
            
            sportContainer.appendChild(sportOptionsWrapper);
        } else {
            console.error('Failed to load filter options:', data.message);
            if (data.message === 'Forbidden: Invalid token') {
                alert('Session expired. Please log in again.');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}



// Apply selected filters (city, sport, price range)

async function applyFilters() {
    const selectedCities = Array.from(document.querySelectorAll('input[name="city"]:checked')).map(checkbox => checkbox.value);
    const selectedSports = Array.from(document.querySelectorAll('input[name="sport"]:checked')).map(checkbox => checkbox.value);
    const priceRange = document.getElementById('filter-price').value;

    let minPrice = null;
    let maxPrice = null;

    // Parse the price range if selected
    if (priceRange) {
        const [min, max] = priceRange.split('-');
        minPrice = min || null;
        maxPrice = max || null;
    }

    // Create URL with query parameters for the filter
    const queryParams = new URLSearchParams();
    if (selectedCities.length > 0) queryParams.append('cities', selectedCities.join(','));
    if (selectedSports.length > 0) queryParams.append('sports', selectedSports.join(','));
    if (minPrice) queryParams.append('min_price', minPrice);
    if (maxPrice) queryParams.append('max_price', maxPrice);

    try {
        const response = await fetch(`http://localhost:3000/api/search/filters?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const locations = await response.json();
        
        // Check if locations is null or empty array
        if (response.ok && locations && locations.length > 0) {
            displayFilteredLocations(locations);
        } else {
            displayFilteredLocations([]); // Pass empty array to handle no results
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Display filtered locations
function displayFilteredLocations(locations) {
    const locationsContainer = document.getElementById('locations');
    locationsContainer.innerHTML = ''; // Clear previous results

    // Check if locations array is empty or null
    if (!locations || locations.length === 0) {
        locationsContainer.innerHTML = `<p>No results available</p>`;
        return;
    }

    // Render locations if available
    locations.forEach(location => {
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        locationItem.innerHTML = `
            <h3>${location.location_name}</h3>
            <p>City: ${location.city}</p>
            <p>Sport: ${location.sport}</p>
            <p>Price per 3 hours: ${location.price_per_3_hours}</p>
            <p>Maximum Capacity: ${location.max_capacity}</p>  
            <button onclick="window.location.href='locationbooking.html?location_id=${location.location_id}'">View and Book</button>
        `;
        locationsContainer.appendChild(locationItem);
    });
}

// Initialize filter options on page load
document.addEventListener('DOMContentLoaded', loadFilterOptions);

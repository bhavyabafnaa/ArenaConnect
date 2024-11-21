// Define selectedSlots as a global variable to store selected slot numbers
let selectedSlots = [];

// Slot timings and location ID
const slotTimings = [
    { slot: 1, timing: '7:00 AM - 10:00 AM' },
    { slot: 2, timing: '10:00 AM - 1:00 PM' },
    { slot: 3, timing: '4:00 PM - 7:00 PM' },
    { slot: 4, timing: '7:00 PM - 10:00 PM' }
];
const urlParams = new URLSearchParams(window.location.search);
const locationId = urlParams.get('location_id');

// Load location details
async function loadLocationDetails() {
    try {
        const response = await fetch(`http://localhost:3000/api/locations/${locationId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('location-name').textContent = data.location_name;
            document.getElementById('location-city').textContent = data.city;
            document.getElementById('location-sport').textContent = data.sport;
            document.getElementById('location-price').textContent = data.price_per_3_hours;
            document.getElementById('location-cap').textContent = data.max_capacity;
        } else {
            console.error('Failed to load location details:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Call loadLocationDetails on page load
document.addEventListener('DOMContentLoaded', loadLocationDetails);

// Import the formatDate utility function if using modules or define it here for the frontend
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


async function checkAvailability() {
    // Retrieve the selected date from the date input field
    const selectedDate = document.getElementById('booking-date').value;

    // Check if a date is selected
    if (!selectedDate) {
        alert("Please select a booking date.");
        return;
    }

    // Format the date using the formatDate function, if necessary
    const formattedDate = formatDate(new Date(selectedDate));
    console.log(locationId, formattedDate)
    
    try {
        const response = await fetch('http://localhost:3000/api/bookings/availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ location_id: locationId, date: formattedDate })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData.error);
            return alert('Failed to check availability: ' + (errorData.error || 'Unknown error'));
        }


        const data = await response.json();
        console.log(data.available_slots)
        displayAvailableSlots(data.available_slots);
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again later.');
    }
}


function displayAvailableSlots(availableSlots) {
    const slotsContainer = document.getElementById('slots-container');
    slotsContainer.innerHTML = ''; // Clear previous slots

    // Log availableSlots to verify its values
    console.log("Available slots from backend:", availableSlots);

    // Convert availableSlots array elements to integers for reliable comparison
    const availableSlotsInt = availableSlots.map(Number);

    slotTimings.forEach(slot => {
        const slotBox = document.createElement('div');
        slotBox.className = 'slot-box';
        slotBox.textContent = `Slot ${slot.slot} (${slot.timing})`;
        slotBox.setAttribute('data-slot', slot.slot); // Store slot number in a data attribute

        // Ensure slot.slot is an integer for comparison
        const slotNumber = parseInt(slot.slot);

        // Mark slots based on their availability status
        if (availableSlotsInt.includes(slotNumber)) {
            // Mark as available and enable clicking for selection
            slotBox.classList.add('available');
            slotBox.onclick = () => toggleSlotSelection(slotBox, slot.slot);
        } else {
            // Mark as booked with a red border and disable clicking
            slotBox.classList.add('booked');
            slotBox.onclick = null;
        }

        slotsContainer.appendChild(slotBox);
    });
}





// Toggle slot selection and update selectedSlots array
function toggleSlotSelection(slotBox, slotNumber) {
    if (slotBox.classList.contains('booked')) return; // Exit if the slot is booked

    slotBox.classList.toggle('selected'); // Toggle selection

    if (slotBox.classList.contains('selected')) {
        // Add slot to selectedSlots if selected
        selectedSlots.push(slotNumber);
    } else {
        // Remove slot from selectedSlots if deselected
        selectedSlots = selectedSlots.filter(slot => slot !== slotNumber);
    }
    
    // Update displayed prices
    updateTotalPrice(parseFloat(document.getElementById('location-price').textContent));
}

// Update the total price
function updateTotalPrice(pricePer3Hours) {
    const locationPrice = pricePer3Hours * selectedSlots.length;
    document.getElementById('location-slotsprice').textContent = locationPrice.toFixed(2);
    const totalPrice = locationPrice + 14.56; // Platform fee
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);
}

// Confirm booking function
async function confirmBooking() {
    const priceperslot=parseFloat(document.getElementById('location-price').textContent)
    const date = document.getElementById('booking-date').value;
    const locationPrice = priceperslot * selectedSlots.length;
    const totalPrice = locationPrice + 14.56; 
    const formattedDate = formatDate(new Date(date));

    // Other code here...
    try {
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                location_id: locationId,
                date: formattedDate, // Send formatted date
                slots: selectedSlots,
                location_fee: locationPrice,
                total_price: totalPrice
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert(`Booking confirmed for ${selectedSlots.length} slots with a total price of Rs ${totalPrice.toFixed(2)}`);
            checkAvailability(date);
            selectedSlots = [];
        } else {
            alert(`Failed to book: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again later.');
    }
}


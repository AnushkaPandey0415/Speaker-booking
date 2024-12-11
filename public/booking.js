window.addEventListener('load', function() {
    const token = localStorage.getItem('token'); // Make sure you're using 'token' instead of 'auth_token'
    
    // If no token found, redirect to login
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if no token is found
        return;
    }

    // Proceed with loading the available speakers and time slots
    fetchAvailableSpeakers(token);
});

async function fetchAvailableSpeakers(token) {
    try {
        const response = await fetch('/api/speakers', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch available speakers');
        }

        const speakers = await response.json();
        const speakersListContainer = document.getElementById('available-speakers-list');

        if (speakers && speakers.length > 0) {
            speakersListContainer.innerHTML = ''; // Clear previous content

            speakers.forEach(speaker => {
                const speakerDiv = document.createElement('div');
                speakerDiv.classList.add('speaker');
                speakerDiv.innerHTML = `
                    <h4>${speaker.id}</h4>
                    <h3><p>Expertise: ${speaker.expertise}</p></h3>
                    <p>Price: ${speaker.price_per_session}</p>
                    <label for="date-${speaker.id}">Date:</label>
                    <input type="date" id="date-${speaker.id}" class="booking-date" />
                    <label for="time-${speaker.id}">Time Slot:</label>
                    <input type="time" id="time-${speaker.id}" class="booking-time" />
                    <button class="book-button" data-speaker-id="${speaker.id}">Book Now</button>
                `;
                speakersListContainer.appendChild(speakerDiv);
            });

            // Add event listeners to all "Book Now" buttons
            document.querySelectorAll('.book-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const speakerId = event.target.getAttribute('data-speaker-id');
                    const dateInput = document.getElementById(`date-${speakerId}`);
                    const timeInput = document.getElementById(`time-${speakerId}`);
                    const date = dateInput.value;
                    const timeSlot = timeInput.value;

                    if (!date || !timeSlot) {
                        alert('Please select a date and time slot.');
                        return;
                    }

                    bookSpeaker(speakerId, date, timeSlot, token);
                });
            });
        } else {
            speakersListContainer.innerHTML = '<p>No speakers available.</p>';
        }
    } catch (error) {
        console.error('Error fetching speakers:', error);
        document.getElementById('available-speakers-list').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function bookSpeaker(id, date, timeSlot, token) {
    try {
        console.log('Booking Speaker:', { id, date, timeSlot });
 
        if (!id || !date || !timeSlot) {
            throw new Error('One or more parameters are undefined.');
        }
 
        console.log('Sending Booking Request:', { speakerId: id, date, time_slot: timeSlot });
 
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,  // Corrected template string
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ speakerId: id, date, time_slot: timeSlot }) // Send speakerId instead of id
        });
 
        const result = await response.json();
        console.log('Booking Result:', result);
 
        if (response.ok) {
            alert('Booking successful! Your session is confirmed.');
        } else {
            alert(`Status : ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error booking speaker:', error);
        alert('Failed to book speaker. Please try again.');
    }
}
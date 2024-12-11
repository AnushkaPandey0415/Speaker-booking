document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
 
    // Check if the user is logged in, if not, redirect to the login page
    if (!token) {
        window.location.href = 'login.html';
        return; // Stop further execution
    }
 
    // Fetch and display user profile and speaker list
    fetchUserProfile(token);
    fetchSpeakersList(token);
 
    // Handle logout
    document.getElementById('logout-link').addEventListener('click', function() {
        localStorage.removeItem('token'); // Remove token on logout
        window.location.href = 'login.html'; // Redirect to login page
    });
});
 
// Function to fetch user profile data
async function fetchUserProfile(token) {
    try {
        const response = await fetch('/api/user-profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });
 
        const contentType = response.headers.get('Content-Type');
        const text = await response.text(); 
 
        if (!response.ok) {
            console.error('Server error:', text);
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }
 
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Unexpected response format:', text);
            throw new Error('Server returned non-JSON response');
        }
 
        const data = JSON.parse(text); // Parse JSON if the response format is valid
        if (data.user) {
            document.getElementById('profile-info').innerHTML = `
                <p>Name: ${data.user.first_name} ${data.user.last_name}</p>
                <p>Email: ${data.user.email}</p>
                <p>User Type: ${data.user.user_type}</p>
            `;
        } else {
            document.getElementById('profile-info').innerHTML = '<p>No user profile data available.</p>';
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        document.getElementById('profile-info').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}
 
// Function to fetch the list of available speakers
// Function to fetch the list of available speakers
async function fetchSpeakersList(token) {
    try {
        const response = await fetch('/api/speakers', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Corrected the syntax
            }
        });
 
        const contentType = response.headers.get('Content-Type');
        const text = await response.text(); // Get raw response
 
        if (!response.ok) {
            console.error('Server error:', text);
            throw new Error(`Failed to fetch speakers list: ${response.statusText}`);
        }
 
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Unexpected response format:', text);
            throw new Error('Server returned non-JSON response');
        }
 
        const speakers = JSON.parse(text); // Parse JSON if the response format is valid
        const speakersListContainer = document.getElementById('speakers-list-container');
        console.log('Speakers length:', speakers.length);
        if (speakers && speakers.length > 0) {
            speakersListContainer.innerHTML = ''; // Clear the container before adding speakers
 
            speakers.forEach(speaker => {
                const speakerDiv = document.createElement('div');
                speakerDiv.classList.add('speaker');
                speakerDiv.innerHTML = `
                    <h3>Expertise: ${speaker.expertise}</h3>
                    <p>Price per session: $${speaker.price_per_session}</p>
                    <p>User ID: ${speaker.user_id}</p>
                    <p>Speaker ID: ${speaker.id}</p>
                `;
                speakersListContainer.appendChild(speakerDiv);
            });
        } else {
            speakersListContainer.innerHTML = '<p>No speakers available.</p>';
        }
    } catch (error) {
        console.error('Error fetching speakers list:', error);
        document.getElementById('speakers-list-container').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}
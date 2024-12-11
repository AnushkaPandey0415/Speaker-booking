document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.getElementById('submit-button'); // Assuming the actual ID is 'submit-button'; // Assuming the button has an ID

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get input values
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Basic input validation
        if (!email || !password) {
            errorMessage.innerText = 'Please fill out all fields.';
            errorMessage.style.display = 'block';
            return;
        }

        // Disable the button and show loading state
        submitButton.disabled = true;
        submitButton.innerText = 'Logging in...';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // Parse JSON response
            const data = await response.json();
            console.log(data);

            if (response.ok) {
                // Save the token in localStorage
                localStorage.setItem('token', data.token);

                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                // Show backend error message
                errorMessage.innerText = data.message || 'Invalid login credentials.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error during login:', error);
            errorMessage.innerText = 'An unexpected error occurred. Please try again later.';
            errorMessage.style.display = 'block';
        } finally {
            // Re-enable the button and reset text
            submitButton.disabled = false;
            submitButton.innerText = 'Login';
        }
    });
});

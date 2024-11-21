// Handle Login Form Submission
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, user_role: role })
        });

        const data = await response.json();
        console.log("Login Response:", data);  // Debugging log

        if (response.ok) {
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_role', data.user_role);
            console.log(data.token)
            console.log('Received token:', data.token);  // Debugging step


            // Redirect to dashboard based on user role
            if (data.user_role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            } else {
                window.location.href = 'user_dashboard.html';
            }
        } else {
            document.getElementById('login-error').textContent = data.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('login-error').textContent = 'An error occurred. Please try again.';
    }
});

// Handle Register Form Submission
document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email, user_role: role })
        });

        const data = await response.json();
        console.log("Register Response:", data);  // Debugging log

        if (response.ok) {
            document.getElementById('register-error').textContent = 'Registration successful! Please log-in';
            setTimeout(() => window.location.href = 'index.html', 2000); // Redirect to login after 2s
        } else {
            document.getElementById('register-error').textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('register-error').textContent = 'An error occurred. Please try again.';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');

    if (!token) {
        window.location.href = 'index.html';
    } else {
        if (userRole === 'admin') {
            window.location.href = 'admin_dashboard.html';
        } else {
            window.location.href = 'user_dashboard.html';
        }
    }
});

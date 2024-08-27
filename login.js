document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) throw new Error('Identifiants incorrects.');
        return response.json();
    })
    .then(data => {
        console.log(data); 
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('token', data.token);
        window.location.href = 'index.html'; 
    })
    .catch(error => {
        console.error('Erreur:', error); 
        document.getElementById('error-message').textContent = error.message;
    });
});

// Switch between login and signup forms
document.getElementById('show-signup').addEventListener('click', function () {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('signup-container').classList.remove('hidden');
});

document.getElementById('show-login').addEventListener('click', function () {
    document.getElementById('signup-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
});

// Handle user signup
document.getElementById('signup-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const user = { username, email, password };
    localStorage.setItem('user', JSON.stringify(user));

    alert('Signup successful! Please login.');
    document.getElementById('signup-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
});

// Handle user login
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.email === email && user.password === password) {
        alert('Login successful!');
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        loadAds();
    } else {
        alert('Invalid email or password.');
    }
});

// Handle ad creation
document.getElementById('ad-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('ad-title').value;
    const description = document.getElementById('ad-description').value;

    const ad = { title, description };
    let ads = JSON.parse(localStorage.getItem('ads')) || [];
    ads.push(ad);
    localStorage.setItem('ads', JSON.stringify(ads));

    document.getElementById('ad-title').value = '';
    document.getElementById('ad-description').value = '';

    loadAds();
});

// Load ads from local storage
function loadAds() {
    const adsList = document.getElementById('ads-list');
    adsList.innerHTML = '';
    const ads = JSON.parse(localStorage.getItem('ads')) || [];
    ads.forEach(ad => {
        const adItem = document.createElement('div');
        adItem.classList.add('ad-item');
        adItem.innerHTML = `<h3>${ad.title}</h3><p>${ad.description}</p>`;
        adsList.appendChild(adItem);
    });
}

// Handle logout
document.getElementById('logout').addEventListener('click', function () {
    document.getElementById('dashboard-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginLink = document.getElementById('login-link');
  const placesList = document.getElementById('places-list');
  const priceFilter = document.getElementById('price-filter');

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function checkAuthentication() {
    const token = getCookie('token');
    if (!token && loginLink) {
      loginLink.style.display = 'block';
    } else if (token && loginLink) {
      loginLink.style.display = 'none';
      if (placesList) fetchPlaces(token);
    }
  }

  async function fetchPlaces(token) {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/places', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      displayPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  }

  function displayPlaces(places) {
    placesList.innerHTML = '';
    places.forEach(place => {
      const card = document.createElement('div');
      card.className = 'place-card';
      card.setAttribute('data-price', place.price);

      card.innerHTML = `
        <h3>${place.title}</h3>
        <p>${place.description || ''}</p>
        <p><strong>Price per night:</strong> $${place.price}</p>
        <a href="place.html?id=${place.id}" class="details-button">View Details</a>
      `;

      placesList.appendChild(card);
    });
  }

  if (priceFilter) {
    priceFilter.addEventListener('change', () => {
      const selectedPrice = priceFilter.value;
      const allCards = document.querySelectorAll('.place-card');

      allCards.forEach(card => {
        const price = parseFloat(card.getAttribute('data-price'));
        if (selectedPrice === 'all' || price <= parseFloat(selectedPrice)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ✅ LOGIN FORM LOGIC
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          document.cookie = `token=${data.access_token}; path=/`;

          // 🔁 Redirection intelligente (ex: retour vers add_review)
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          const id = params.get('id');
          if (redirect) {
            window.location.href = `${redirect}${id ? '?id=' + id : ''}`;
          } else {
            window.location.href = 'index.html';
          }

        } else {
          const error = await response.json();
          alert('Login failed: ' + (error.msg || response.statusText));
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('An error occurred during login. Please try again.');
      }
    });
  }

  checkAuthentication();
});

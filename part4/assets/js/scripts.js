/** Login/Logout Form  */
document.addEventListener("DOMContentLoaded", () => {
  
  // Authentification check for user based on the token cookie
  checkAuthentication();

  // Logout functionnality, deleting the cookie token
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
      event.preventDefault(); 
      deleteTokenCookie();    
      window.location.href = "login.html"; 
    });
  }
  
  // Submit event for login ( receiveing email and password from form)
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      try {
        await loginUser(email, password);
      } catch (error) {
        console.log("error:" + error);
      }
    });
  }
});

  // Ftech detailed place if token and place id identified
  const token = getCookie("token");
  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get("id");
  try {
    if (token && placeId) {
      fetchDetailedPlace(token, placeId);
    }
  } catch (error) {
    console.error(error);
  };

// Get review text and rating from form and submit it
document.addEventListener("DOMContentLoaded", () => {
  const reviewForm = document.getElementById("review-form");
  const token = getCookie("token");
  const placeId = getPlaceIdFromURL();

  if (reviewForm) {
    reviewForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const text = document.getElementById("review").value;
      const rating = document.getElementById("rating").value;

      try {
        if (text && rating) {
          submitReview(token, placeId, text, rating);
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
});

/** Usefull functions */
function getPlaceIdFromURL() {
  const url = new URLSearchParams(window.location.search);
  return url.get("id");
}

function getCookie(name) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name))
    ?.split("=")[1];
  return cookieValue;
}

function checkAuthentication() {
  const token = getCookie("token");
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById('logout-link');

  if (!token) {
    loginLink.style.display = "block";
    logoutLink.style.display = "none"
  } else {
    loginLink.style.display = "none";
    logoutLink.style.display = "block"
    fetchPlaces(token);
  }
}

function deleteTokenCookie() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}



/** Login User */
async function loginUser(email, password) {
  const response = await fetch("http://127.0.0.1:5000/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    document.cookie = `token=${data.access_token}; path=/`;
    window.location.href = "index.html";
    console.log(`${data.access_token}`);
  } else {
    alert("Login failed: " + response.statusText);
  }
}



/** Places fetch and display */
async function fetchPlaces(token) {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/v1/places/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const places = await response.json();
    displayPlaces(places);
  } catch (error) {
    console.error("Error fetching places:", error);
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById("places-list");
  placesList.innerHTML = "";

  places.forEach((place) => {
    const placeCard = document.createElement("a");
    placeCard.className = "place-card";
    placeCard.href = `place.html?id=${place.id}`;
    placeCard.innerHTML = `
            <img src="assets/images/ecolodge.avif" alt="${place.title}">
            <h2>${place.title}</h2>
            <p>Price per night €${place.price}</p>
        `;
    placesList.appendChild(placeCard);
  });
}

document.getElementById("price-filter").addEventListener("change", () => {
  const selectedPrice = document.getElementById("price-filter").value;
  const places = document.querySelectorAll(".place-card");

  places.forEach((card) => {
    const price = parseInt(
      card.querySelector("p").textContent.replace("Price per night €", ""),
      10
    );
    if (selectedPrice === "All" || price <= parseInt(selectedPrice, 10)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

/** Place Details Fetch and Display */
async function fetchDetailedPlace(token, placeId) {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/v1/places/${placeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const detailedPlace = await response.json();
      displayDetailedPlaces(detailedPlace);
    } else {
      console.error("Failed to fetch detailed place.");
    }
  } catch (error) {
    console.error("Error fetching place detail:", error);
  }
}

function displayDetailedPlaces(place) {
  document.getElementById("place-details").innerHTML = `
        <h1>${place.title}</h1>
        <img src="assets/images/hotel.avif" alt="git">
        <p>Description: ${place.description}</p>
        <p>Price: $${place.price} per night</p>
        <p>Amenities: ${place.amenities.map((a) => a.name).join(", ")}</p>
    `;

  const reviewsPlace = document.getElementById("reviews");
  reviewsPlace.innerHTML = "<h2>Reviews</h2>";
  if (place.reviews && place.reviews.length > 0) {
    place.reviews.forEach((review) => {
      const reviewCard = document.createElement("div");
      reviewCard.classList.add("review-card");
      reviewCard.innerHTML = `
                <p>${review.text}</p>
                <p>Rating: ${review.rating}</p>
            `;
      reviewsPlace.appendChild(reviewCard);
    });
  } else {
    reviewsPlace.innerHTML += "<p>No reviews available for this place.</p>";
  }

  const addReview = document.getElementById("add-review");
  const button = document.createElement("a");
  button.href = `add_review.html?id=${place.id}`;
  button.innerHTML = `<button>Add a review</button>`;
  addReview.appendChild(button);
}

/** Review Submit */
async function submitReview(token, placeId, reviewText, rating) {
  try {
    const body = {
      text: reviewText,
      rating: parseInt(rating, 10),
      place_id: placeId,
    };
    console.log("Request body:", body);
    console.log(token);

    const response = await fetch(`http://127.0.0.1:5000/api/v1/reviews/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    handleResponse(response, placeId);
  } catch (error) {
    console.error("Error:", error);
  }
}

function handleResponse(response, placeId) {
  if (response.ok) {
    alert("Review submitted successfully!");
    window.location.href = `place.html?id=${placeId}`;
    document.getElementById("review-form").reset();
  } else {
    alert("Failed to submit review");
  }
}

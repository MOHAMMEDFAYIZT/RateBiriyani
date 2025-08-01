document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const userEmail = localStorage.getItem('biriyaniAuth');
    if (!userEmail) {
        window.location.href = '/login.html';
        return;
    }

    // Display user email and setup logout
    document.getElementById('userEmail').textContent = userEmail;
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('biriyaniAuth');
        window.location.href = '/login.html';
    });

    // DOM elements
    const hotelsContainer = document.getElementById('hotelsContainer');
    const resultsContainer = document.getElementById('resultsContainer');

    // Load hotels and ratings
    let hotels = [];
    try {
        const response = await fetch('/api/results');
        hotels = await response.json();
        renderHotels(hotels);
        renderResults(hotels);
    } catch (error) {
        console.error('Failed to load data:', error);
        hotelsContainer.innerHTML = '<p>Error loading hotels. Please refresh.</p>';
    }

    // Render hotels for rating
    function renderHotels(hotels) {
        hotelsContainer.innerHTML = hotels.map(hotel => `
            <div class="hotel-card">
                <img src="images/${hotel.image_url || 'default.jpg'}" alt="${hotel.name}" class="hotel-image">
                <h3>${hotel.name}</h3>
                <div class="rating-stars">
                    ${[1, 2, 3, 4, 5].map(star => `
                        <span class="star" data-hotel-id="${hotel.id}" data-rating="${star}">☆</span>
                    `).join('')}
                </div>
                <div class="location">${hotel.location || ''}</div>
            </div>
        `).join('');

        // Add star rating interaction
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', async function() {
                const hotelId = this.getAttribute('data-hotel-id');
                const rating = this.getAttribute('data-rating');

                try {
                    const response = await fetch('/api/rate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: userEmail,
                            hotelId: parseInt(hotelId),
                            rating: parseInt(rating)
                        })
                    });

                    if (response.ok) {
                        const updatedResults = await fetch('/api/results').then(res => res.json());
                        renderResults(updatedResults);
                    }
                } catch (error) {
                    alert('Failed to submit rating. Please try again.');
                }
            });
        });
    }

    // Render results
    function renderResults(results) {
        resultsContainer.innerHTML = results.map(hotel => `
            <div class="result-card">
                <img src="images/${hotel.image_url || 'default.jpg'}" alt="${hotel.name}" class="hotel-image">
                <h3>${hotel.name}</h3>
                <div class="average-rating">
                    ${hotel.average_rating ? hotel.average_rating.toFixed(1) : '0.0'}
                    <span class="rating-count">(${hotel.rating_count || 0})</span>
                </div>
                <div class="stars">
                    ${renderStarIcons(hotel.average_rating)}
                </div>
            </div>
        `).join('');
    }

    function renderStarIcons(average) {
        const fullStars = Math.round(average) || 0;
        return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    }
});
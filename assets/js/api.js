/**
 * Blue Ocean Swim Academy - Axios Public API Integration
 * 
 * Demonstrates:
 * - Axios CDN integration
 * - axios.get() calls to free public JSON APIs
 * - Dynamic data presentation using responsive cards & indicators
 * - Comprehensive Loading State handling (animated spinners & placeholders)
 * - Comprehensive Error State handling (friendly retry buttons & alerts)
 * 
 * APIs Integrated:
 * 1. Open-Meteo Weather & Pool Advisory API (Lahore Academy Coordinates: 31.52°N, 74.36°E)
 *    Endpoint: https://api.open-meteo.com/v1/forecast?...
 * 2. JSONPlaceholder Community Training & Aquatic Advice Feed
 *    Endpoint: https://jsonplaceholder.typicode.com/posts?_limit=6
 */

// Global state for API responses
let weatherData = null;
let communityPosts = [];

/**
 * Weather Code interpreter according to WMO standard
 */
function interpretWeatherCode(code) {
    if (code === 0) return { label: 'Clear Sky / Sunny', icon: '☀️', status: 'Optimal Outdoor Swimming' };
    if ([1, 2, 3].includes(code)) return { label: 'Partly Cloudy', icon: '⛅', status: 'Good Swimming Conditions' };
    if ([45, 48].includes(code)) return { label: 'Foggy / Hazy', icon: '🌫️', status: 'Indoor Pool Recommended' };
    if ([51, 53, 55, 61, 63, 65].includes(code)) return { label: 'Rain / Drizzle', icon: '🌧️', status: 'Indoor Heated Pool Open' };
    if ([80, 81, 82].includes(code)) return { label: 'Showers', icon: '🌦️', status: 'Indoor Pool Only' };
    if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', icon: '⚡', status: 'Outdoor Sessions Paused' };
    return { label: 'Mild Conditions', icon: '🌤️', status: 'Normal Operations' };
}

/**
 * 1. FETCH LIVE POOL & WEATHER CONDITIONS VIA AXIOS GET
 * API: Open-Meteo (Free Public JSON API, No Auth Needed)
 */
async function fetchPoolWeather() {
    const weatherContainer = document.getElementById('weather-api-container');
    const weatherLoading = document.getElementById('weather-loading');
    const weatherError = document.getElementById('weather-error');
    const weatherContent = document.getElementById('weather-content');

    if (!weatherContainer) return;

    // Show loading state
    if (weatherLoading) weatherLoading.classList.remove('hidden');
    if (weatherError) weatherError.classList.add('hidden');
    if (weatherContent) weatherContent.classList.add('hidden');

    const API_ENDPOINT = 'https://api.open-meteo.com/v1/forecast?latitude=31.5204&longitude=74.3587&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m';

    try {
        // AXIOS GET REQUEST
        const response = await axios.get(API_ENDPOINT);
        weatherData = response.data;

        // Render dynamic data
        renderWeatherUI(weatherData);

        // Transition states: hide loading, show content
        if (weatherLoading) weatherLoading.classList.add('hidden');
        if (weatherContent) weatherContent.classList.remove('hidden');
    } catch (error) {
        console.error('Weather API Axios Error:', error);
        // Transition to Error State
        if (weatherLoading) weatherLoading.classList.add('hidden');
        if (weatherError) {
            weatherError.classList.remove('hidden');
            const errorMsg = document.getElementById('weather-error-msg');
            if (errorMsg) {
                errorMsg.textContent = error.message || 'Unable to connect to live weather service.';
            }
        }
    }
}

/**
 * Render Weather UI Card dynamically
 */
function renderWeatherUI(data) {
    if (!data || !data.current) return;

    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const windSpeed = current.wind_speed_10m;
    const weatherMeta = interpretWeatherCode(current.weather_code);

    // Dynamic temperature elements
    const tempEl = document.getElementById('weather-temp');
    const feelsLikeEl = document.getElementById('weather-feels-like');
    const humidityEl = document.getElementById('weather-humidity');
    const windEl = document.getElementById('weather-wind');
    const conditionEl = document.getElementById('weather-condition');
    const statusBadgeEl = document.getElementById('weather-safety-badge');
    const timeEl = document.getElementById('weather-updated-time');

    if (tempEl) tempEl.innerHTML = `${temp}<span class="text-xl font-normal text-primary">°C</span>`;
    if (feelsLikeEl) feelsLikeEl.textContent = `${feelsLike}°C`;
    if (humidityEl) humidityEl.textContent = `${humidity}%`;
    if (windEl) windEl.textContent = `${windSpeed} km/h`;
    if (conditionEl) {
        conditionEl.innerHTML = `<span class="mr-2">${weatherMeta.icon}</span> ${weatherMeta.label}`;
    }
    if (statusBadgeEl) {
        statusBadgeEl.textContent = weatherMeta.status;
    }
    if (timeEl) {
        const now = new Date();
        timeEl.textContent = `Updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
}

/**
 * 2. FETCH COMMUNITY INSIGHTS & TRAINING TIPS VIA AXIOS GET
 * API: JSONPlaceholder (Free Public JSON REST API)
 */
async function fetchCommunityPosts() {
    const communityLoading = document.getElementById('community-loading');
    const communityError = document.getElementById('community-error');
    const communityGrid = document.getElementById('community-posts-grid');

    if (!communityGrid) return;

    // Show loading state
    if (communityLoading) communityLoading.classList.remove('hidden');
    if (communityError) communityError.classList.add('hidden');
    communityGrid.innerHTML = '';

    const API_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts?_limit=6';

    try {
        // AXIOS GET REQUEST
        const response = await axios.get(API_ENDPOINT);
        communityPosts = response.data;

        // Render posts
        renderCommunityPosts(communityPosts);

        // Hide loading
        if (communityLoading) communityLoading.classList.add('hidden');
    } catch (error) {
        console.error('Community Posts Axios Error:', error);
        // Show error state
        if (communityLoading) communityLoading.classList.add('hidden');
        if (communityError) {
            communityError.classList.remove('hidden');
            const errorMsg = document.getElementById('community-error-msg');
            if (errorMsg) {
                errorMsg.textContent = error.message || 'Failed to fetch community updates.';
            }
        }
    }
}

/**
 * Render Community Posts dynamically
 */
function renderCommunityPosts(posts) {
    const communityGrid = document.getElementById('community-posts-grid');
    if (!communityGrid) return;

    // Swim Academy tags & coaches to contextualize JSONPlaceholder responses
    const tags = ['Technique', 'Nutrition', 'Safety', 'Stamina', 'Olympic Standards', 'Breathing'];
    const authors = ['Coach Azzi', 'Coach Mehak', 'Coach Azmat', 'Dr. Farooq (Physio)', 'Aquatic Safety Dept'];

    if (!posts || posts.length === 0) {
        communityGrid.innerHTML = `
            <div class="col-span-full py-8 text-center text-gray-400 glass rounded-2xl">
                No articles retrieved from the API feed.
            </div>
        `;
        return;
    }

    communityGrid.innerHTML = posts.map((post, index) => {
        const tag = tags[index % tags.length];
        const author = authors[index % authors.length];
        const readTime = `${2 + (index % 4)} min read`;

        // Format post title to Capitalized Case
        const formattedTitle = post.title.charAt(0).toUpperCase() + post.title.slice(1);

        return `
            <article class="glass p-6 rounded-2xl border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between group">
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                            ${tag}
                        </span>
                        <span class="text-xs text-gray-500 font-medium">Post #${post.id}</span>
                    </div>

                    <h4 class="font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-2">
                        ${formattedTitle}
                    </h4>

                    <p class="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                        ${post.body}
                    </p>
                </div>

                <div class="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
                            ${author.charAt(6) || 'C'}
                        </div>
                        <span class="font-medium text-gray-300">${author}</span>
                    </div>
                    <span>${readTime}</span>
                </div>
            </article>
        `;
    }).join('');
}

/**
 * Filter Community Posts by Tag (Demonstrating Array Method filter() on API data)
 */
function filterCommunityPosts(tag) {
    // Array method: filter()
    const buttons = document.querySelectorAll('.community-filter-btn');
    buttons.forEach(btn => {
        if (btn.dataset.filter === tag) {
            btn.classList.add('bg-primary', 'text-dark');
            btn.classList.remove('bg-white/5', 'text-gray-300');
        } else {
            btn.classList.remove('bg-primary', 'text-dark');
            btn.classList.add('bg-white/5', 'text-gray-300');
        }
    });

    if (tag === 'all') {
        renderCommunityPosts(communityPosts);
    } else {
        // filter based on index modulo matching
        const filtered = communityPosts.filter((_, index) => {
            const tags = ['Technique', 'Nutrition', 'Safety', 'Stamina', 'Olympic Standards', 'Breathing'];
            return tags[index % tags.length].toLowerCase() === tag.toLowerCase();
        });
        renderCommunityPosts(filtered);
    }
}

/**
 * Initialize Axios APIs
 */
function initAPIs() {
    fetchPoolWeather();
    fetchCommunityPosts();

    // Weather refresh button
    const refreshWeatherBtn = document.getElementById('refresh-weather-btn');
    if (refreshWeatherBtn) {
        refreshWeatherBtn.addEventListener('click', () => {
            fetchPoolWeather();
        });
    }

    // Weather retry button
    const retryWeatherBtn = document.getElementById('retry-weather-btn');
    if (retryWeatherBtn) {
        retryWeatherBtn.addEventListener('click', () => {
            fetchPoolWeather();
        });
    }

    // Community refresh button
    const refreshCommunityBtn = document.getElementById('refresh-community-btn');
    if (refreshCommunityBtn) {
        refreshCommunityBtn.addEventListener('click', () => {
            fetchCommunityPosts();
        });
    }

    // Community retry button
    const retryCommunityBtn = document.getElementById('retry-community-btn');
    if (retryCommunityBtn) {
        retryCommunityBtn.addEventListener('click', () => {
            fetchCommunityPosts();
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAPIs);
} else {
    initAPIs();
}


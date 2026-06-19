// ⚠️ NAVIN API KEY ITHE PASTE KAR
const API_KEY = "75473045427534a007043c68d71593f5";

// Wait for DOM to load completely
document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const locBtn = document.getElementById('locBtn');
  const themeBtn = document.getElementById('themeBtn');
  const weatherResult = document.getElementById('weatherResult');
  const forecastCards = document.getElementById('forecastCards');
  const historyDiv = document.getElementById('history');

  // 1. EVENT LISTENERS
  searchBtn.addEventListener('click', () => getWeather(cityInput.value));
  cityInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      getWeather(cityInput.value);
    }
  });
  locBtn.addEventListener('click', getLocationWeather);
  themeBtn.addEventListener('click', toggleTheme);

  // 2. GET WEATHER BY CITY
  function getWeather(city) {
    if (!city.trim()) {
      showError("City naav tak bhava!");
      return;
    }
    fetchWeather(`q=${city}`);
  }

  // 3. GET WEATHER BY LOCATION
  function getLocationWeather() {
    showLoading();
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(`lat=${latitude}&lon=${longitude}`);
    }, () => {
      showError("Location access nahi dila. Settings madhe ja");
    });
  }

  // 4. MAIN FETCH FUNCTION
  async function fetchWeather(query) {
    showLoading();
    try {
      // Current weather
      const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${API_KEY}&units=metric`);
      const currentData = await currentRes.json();

      if (currentData.cod!== 200) throw new Error(currentData.message);

      // 5-Day Forecast
      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${API_KEY}&units=metric`);
      const forecastData = await forecastRes.json();

      displayWeather(currentData);
      displayForecast(forecastData);
      saveToHistory(currentData.name);
      updateHistoryUI();
      setDynamicBackground(currentData.weather[0].main);

    } catch (err) {
      showError(err.message === 'city not found'? 'City sapadli nahi bhava!' : 'Kahi tari gadbad zali');
    }
  }

  // 5. DISPLAY CURRENT WEATHER
  function displayWeather(data) {
    weatherResult.innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
      <div id="temp">${Math.round(data.main.temp)}°C</div>
      <div id="description">${data.weather[0].description}</div>
      <div class="details">
        <p>Feels like<br><strong>${Math.round(data.main.feels_like)}°C</strong></p>
        <p>Humidity<br><strong>${data.main.humidity}%</strong></p>
        <p>Wind<br><strong>${data.wind.speed} km/h</strong></p>
      </div>
    `;
  }

  // 6. DISPLAY 5-DAY FORECAST
  function displayForecast(data) {
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    forecastCards.innerHTML = dailyData.slice(0, 5).map(day => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });
      return `
        <div class="forecast-card">
          <p>${dayName}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="">
          <p><strong>${Math.round(day.main.temp)}°C</strong></p>
        </div>
      `;
    }).join('');
  }

  // 7. DYNAMIC BACKGROUND
  function setDynamicBackground(weatherMain) {
    const bgMap = {
      'Clear': 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      'Rain': 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
      'Clouds': 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
      'Snow': 'linear-gradient(135deg, #e6dada 0%, #274046 100%)',
      'Thunderstorm': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
      'Drizzle': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      'Mist': 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)'
    };
    document.body.style.background = bgMap[weatherMain] || 'var(--bg-gradient)';
  }

  // 8. DARK MODE
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark'? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.innerText = newTheme === 'dark'? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
  }

  // 9. SEARCH HISTORY
  function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('cities')) || [];
    history = history.filter(c => c!== city);
    history.unshift(city);
    history = history.slice(0, 3);
    localStorage.setItem('cities', JSON.stringify(history));
  }

  function updateHistoryUI() {
    const history = JSON.parse(localStorage.getItem('cities')) || [];
    historyDiv.innerHTML = history.map(city =>
      `<button onclick="getWeather('${city}')">${city}</button>`
    ).join('');
  }

  // 10. LOADING & ERROR STATES
  function showLoading() {
    if (weatherResult) weatherResult.innerHTML = `<p class="loading">Loading weather data...</p>`;
    if (forecastCards) forecastCards.innerHTML = '';
  }

  function showError(msg) {
    if (weatherResult) weatherResult.innerHTML = `<p class="error">${msg}</p>`;
    if (forecastCards) forecastCards.innerHTML = '';
  }

  // 11. PAGE LOAD
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeBtn.innerText = savedTheme === 'dark'? '☀️' : '🌙';
  updateHistoryUI();
  getWeather("Nagpur");
});

// Make getWeather global for history buttons
function getWeather(city) {
  const event = new Event('click');
  document.getElementById('cityInput').value = city;
  document.getElementById('searchBtn').dispatchEvent(event);
}
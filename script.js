// script.js
document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '3de8f788eb837e9700999ed1959d984c'; // !!! SUBSTITUA PELA SUA CHAVE API DO OPENWEATHERMAP !!!
    if (API_KEY === '3de8f788eb837e9700999ed1959d984c) {
        displayError('CHAVE API NÃO CONFIGURADA. Por favor, adicione sua chave API da OpenWeatherMap no arquivo script.js.');
    }

    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const geolocationButton = document.getElementById('geolocation-button');

    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessageDiv = document.getElementById('error-message');

    const currentWeatherSection = document.getElementById('current-weather');
    const hourlyForecastSection = document.getElementById('hourly-forecast');
    const dailyForecastSection = document.getElementById('daily-forecast');

    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const weatherIconEl = document.getElementById('weather-icon');
    const temperatureEl = document.getElementById('temperature');
    const weatherDescriptionEl = document.getElementById('weather-description');
    const feelsLikeEl = document.getElementById('feels-like');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const pressureEl = document.getElementById('pressure');
    const sunriseEl = document.getElementById('sunrise');
    const sunsetEl = document.getElementById('sunset');

    const celsiusButton = document.getElementById('celsius-button');
    const fahrenheitButton = document.getElementById('fahrenheit-button');

    const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
    const dailyForecastContainer = document.getElementById('daily-forecast-container');

    let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
    let currentWeatherData = null;
    let currentForecastData = null;

    // --- EVENT LISTENERS ---
    searchButton.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
    geolocationButton.addEventListener('click', handleGeolocation);
    celsiusButton.addEventListener('click', () => switchUnit('metric'));
    fahrenheitButton.addEventListener('click', () => switchUnit('imperial'));

    // --- FUNÇÕES DE LÓGICA ---
    function handleSearch() {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
            cityInput.value = ''; // Clear input after search
        } else {
            displayError('Por favor, insira o nome de uma cidade.');
        }
    }

    function handleGeolocation() {
        if (navigator.geolocation) {
            showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(null, latitude, longitude);
                },
                (error) => {
                    hideLoading();
                    displayError('Não foi possível obter a localização. Verifique as permissões e tente novamente.');
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            displayError('Geolocalização não é suportada por este navegador.');
        }
    }

    async function fetchWeatherData(city = null, lat = null, lon = null) {
        if (API_KEY === 'SUA_CHAVE_API_AQUI') return;
        showLoading();
        clearError();
        hideWeatherSections();

        let weatherUrl, forecastUrl;
        const lang = 'pt_br'; // Language for descriptions

        if (city) {
            weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${lang}`;
            forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${lang}`;
        } else if (lat && lon) {
            weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`;
            forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`;
        } else {
            hideLoading();
            return;
        }

        try {
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            if (!weatherResponse.ok) {
                const errorData = await weatherResponse.json();
                throw new Error(errorData.message || `Cidade não encontrada (${weatherResponse.status})`);
            }
            if (!forecastResponse.ok) { // Forecast might fail even if current weather is ok
                const errorData = await forecastResponse.json();
                 console.warn("Forecast API error:", errorData.message); // Log as warning, current weather might still be useful
                // Don't throw error here, try to display current weather at least
            }

            currentWeatherData = await weatherResponse.json();
            if (forecastResponse.ok) { // Process forecast only if successful
                 currentForecastData = await forecastResponse.json();
            } else {
                currentForecastData = null; // Ensure no old forecast data is used
            }


            displayAllWeatherData();

        } catch (error) {
            console.error("Fetch error:", error);
            displayError(capitalizeFirstLetter(error.message) || "Ocorreu um erro ao buscar os dados.");
        } finally {
            hideLoading();
        }
    }

    function displayAllWeatherData() {
        if (currentWeatherData) displayCurrentWeather();
        if (currentForecastData) {
            displayHourlyForecast();
            displayDailyForecast();
        } else { // Clear forecast sections if data is not available
            hourlyForecastContainer.innerHTML = '<p>Dados de previsão horária indisponíveis.</p>';
            dailyForecastContainer.innerHTML = '<p>Dados de previsão diária indisponíveis.</p>';
        }
        showWeatherSections();
    }

    function switchUnit(unit) {
        if (currentUnit === unit) return;
        currentUnit = unit;

        celsiusButton.classList.toggle('active', unit === 'metric');
        fahrenheitButton.classList.toggle('active', unit === 'imperial');

        if (currentWeatherData) { // Re-render data with new unit
            displayAllWeatherData();
        }
    }

    // --- FUNÇÕES DE DISPLAY ---
    function displayCurrentWeather() {
        if (!currentWeatherData) return;

        const data = currentWeatherData;
        let temp = data.main.temp;
        let feels = data.main.feels_like;
        let windS = data.wind.speed; // m/s by default from API

        if (currentUnit === 'imperial') {
            temp = (temp * 9/5) + 32;
            feels = (feels * 9/5) + 32;
            windS = windS * 2.23694; // m/s to mph
        } else {
             windS = windS * 3.6; // m/s to km/h
        }

        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        currentDateEl.textContent = formatDate(new Date(data.dt * 1000 + (data.timezone * 1000))); // Apply timezone for current date too
        weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIconEl.alt = data.weather[0].description;
        temperatureEl.innerHTML = `${Math.round(temp)}°<span class="unit-char">${currentUnit === 'metric' ? 'C' : 'F'}</span>`;
        weatherDescriptionEl.textContent = capitalizeFirstLetter(data.weather[0].description);
        feelsLikeEl.innerHTML = `${Math.round(feels)}°<span class="unit-char-small">${currentUnit === 'metric' ? 'C' : 'F'}</span>`;
        humidityEl.textContent = `${data.main.humidity}%`;
        windSpeedEl.textContent = `${Math.round(windS)} ${currentUnit === 'metric' ? 'km/h' : 'mph'}`;
        pressureEl.textContent = `${data.main.pressure} hPa`;
        sunriseEl.textContent = formatTime(new Date(data.sys.sunrise * 1000), data.timezone);
        sunsetEl.textContent = formatTime(new Date(data.sys.sunset * 1000), data.timezone);
    }

    function displayHourlyForecast() {
        if (!currentForecastData || !currentForecastData.list) {
            hourlyForecastContainer.innerHTML = '<p>Dados de previsão horária indisponíveis.</p>';
            return;
        }
        hourlyForecastContainer.innerHTML = ''; // Clear previous

        const hourlyData = currentForecastData.list.slice(0, 8); // Approx next 24 hours (8 * 3-hour intervals)

        hourlyData.forEach(item => {
            let temp = item.main.temp;
            if (currentUnit === 'imperial') {
                temp = (temp * 9/5) + 32;
            }

            const hourEl = document.createElement('div');
            hourEl.classList.add('hourly-item');
            hourEl.innerHTML = `
                <p class="time">${formatTime(new Date(item.dt * 1000), currentForecastData.city.timezone)}</p>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(temp)}°<span class="unit-char-small">${currentUnit === 'metric' ? 'C' : 'F'}</span></p>
            `;
            hourlyForecastContainer.appendChild(hourEl);
        });
    }

    function displayDailyForecast() {
        if (!currentForecastData || !currentForecastData.list) {
             dailyForecastContainer.innerHTML = '<p>Dados de previsão diária indisponíveis.</p>';
            return;
        }
        dailyForecastContainer.innerHTML = ''; // Clear previous

        const dailyData = currentForecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

        if (dailyData.length === 0 && currentForecastData.list.length > 0) {
            // Fallback if no "12:00:00" entries, pick one per day
            let dayTracker = {};
            currentForecastData.list.forEach(item => {
                const dayKey = new Date(item.dt * 1000).toDateString();
                if (!dayTracker[dayKey]) {
                    dailyData.push(item);
                    dayTracker[dayKey] = true;
                }
            });
        }


        dailyData.slice(0,5).forEach(item => { // Ensure only 5 days
            let tempMax = item.main.temp_max;
            let tempMin = item.main.temp_min;

            if (currentUnit === 'imperial') {
                tempMax = (tempMax * 9/5) + 32;
                tempMin = (tempMin * 9/5) + 32;
            }

            const dayEl = document.createElement('div');
            dayEl.classList.add('daily-item');
            dayEl.innerHTML = `
                <p class="day">${formatDay(new Date(item.dt * 1000), currentForecastData.city.timezone)}</p>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(tempMax)}°/${Math.round(tempMin)}°</p>
                <p class="desc-daily">${capitalizeFirstLetter(item.weather[0].description)}</p>
            `;
            dailyForecastContainer.appendChild(dayEl);
        });
    }


    // --- FUNÇÕES UTILITÁRIAS ---
    function getLocaleAdjustedDate(unixTimestamp, timezoneOffsetSeconds) {
        const date = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000); // Convert to milliseconds and apply offset
        // Then subtract local machine's timezone offset to get true UTC, then format.
        // This is tricky because toLocaleDateString itself uses local settings.
        // A more robust solution uses libraries like moment-timezone or Luxon.
        // For simplicity here, we'll rely on the provided timezoneOffsetSeconds for time formatting mostly.
        // For date formatting, using the direct Date object and hoping it's close enough for the day.
        const localDate = new Date(unixTimestamp * 1000); // Simpler for date part
        return localDate;
    }


    function formatDate(dateObject) { // dateObject is already timezone adjusted for current weather
         return dateObject.toLocaleDateString('pt-BR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function formatTime(date, timezoneOffsetSeconds) {
        // date is a JS Date object created from item.dt * 1000 (which is UTC)
        // We need to display this time as it is in the location's timezone.
        const utcMilliseconds = date.getTime();
        const localTimeAtLocationMilliseconds = utcMilliseconds + (timezoneOffsetSeconds * 1000);
        const dateAtLocation = new Date(localTimeAtLocationMilliseconds);

        return dateAtLocation.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' // Important: interpret dateAtLocation as UTC time
        });
    }


    function formatDay(date, timezoneOffsetSeconds) { // date is JS Date from dt * 1000
         const utcMilliseconds = date.getTime();
        const localTimeAtLocationMilliseconds = utcMilliseconds + (timezoneOffsetSeconds * 1000);
        const dateAtLocation = new Date(localTimeAtLocationMilliseconds);
        return dateAtLocation.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' });
    }

    function capitalizeFirstLetter(string) {
        if (!string) return "";
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function showLoading() {
        loadingIndicator.style.display = 'block';
    }

    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }

    function displayError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
        hideWeatherSections(); // Hide weather data sections on error
    }

    function clearError() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }

    function showWeatherSections() {
        if (currentWeatherData) currentWeatherSection.style.display = 'block';
        if (currentForecastData) {
             hourlyForecastSection.style.display = 'block';
             dailyForecastSection.style.display = 'block';
        }
    }
    function hideWeatherSections() {
        currentWeatherSection.style.display = 'none';
        hourlyForecastSection.style.display = 'none';
        dailyForecastSection.style.display = 'none';
    }

    // --- INICIALIZAÇÃO ---
    // fetchWeatherData("Rio de Janeiro"); // Exemplo de cidade inicial
});

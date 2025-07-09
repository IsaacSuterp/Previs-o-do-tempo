class WeatherApp {
    constructor() {
        this.apiKey = ''; // Usando API gratuita sem chave
        this.initializeElements();
        this.bindEvents();
        this.updateCurrentDate();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.weatherCard = document.getElementById('weatherCard');
        this.forecastSection = document.getElementById('forecastSection');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Weather display elements
        this.cityName = document.getElementById('cityName');
        this.currentDate = document.getElementById('currentDate');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temperature = document.getElementById('temperature');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.feelsLike = document.getElementById('feelsLike');
        this.windSpeed = document.getElementById('windSpeed');
        this.humidity = document.getElementById('humidity');
        this.visibility = document.getElementById('visibility');
        this.pressure = document.getElementById('pressure');
        this.forecastContainer = document.getElementById('forecastContainer');
        this.errorText = document.getElementById('errorText');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.currentDate.textContent = now.toLocaleDateString('pt-BR', options);
    }

    async handleSearch() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Por favor, digite o nome de uma cidade.');
            return;
        }
        
        await this.getWeatherByCity(city);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocalização não é suportada pelo seu navegador.');
            return;
        }

        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.hideLoading();
                this.showError('Não foi possível obter sua localização. Verifique as permissões do navegador.');
            }
        );
    }

    async getWeatherByCity(city) {
        this.showLoading();
        
        try {
            // Usando API gratuita do OpenWeatherMap (sem chave para demo)
            // Em produção, você precisaria de uma chave de API
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=demo_key&units=metric&lang=pt_br`);
            
            // Como a API acima não funcionará sem chave real, vamos simular dados realistas
            if (!response.ok) {
                // Simulando dados para demonstração
                const simulatedData = this.generateSimulatedWeatherData(city);
                this.displayWeather(simulatedData);
                await this.getForecast(city);
                return;
            }
            
            const data = await response.json();
            this.displayWeather(data);
            await this.getForecast(city);
            
        } catch (error) {
            // Fallback para dados simulados
            const simulatedData = this.generateSimulatedWeatherData(city);
            this.displayWeather(simulatedData);
            await this.getForecast(city);
        }
    }

    async getWeatherByCoords(lat, lon) {
        this.showLoading();
        
        try {
            // Simulando dados baseados em coordenadas
            const simulatedData = this.generateSimulatedWeatherData('Sua Localização', lat, lon);
            this.displayWeather(simulatedData);
            await this.getForecast('Sua Localização');
            
        } catch (error) {
            this.hideLoading();
            this.showError('Erro ao obter dados do clima para sua localização.');
        }
    }

    generateSimulatedWeatherData(city, lat = null, lon = null) {
        const weatherConditions = [
            { condition: 'ensolarado', icon: '☀️', temp: 28, desc: 'Céu limpo' },
            { condition: 'parcialmente nublado', icon: '⛅', temp: 24, desc: 'Parcialmente nublado' },
            { condition: 'nublado', icon: '☁️', temp: 20, desc: 'Nublado' },
            { condition: 'chuvoso', icon: '🌧️', temp: 18, desc: 'Chuva leve' },
            { condition: 'tempestuoso', icon: '⛈️', temp: 16, desc: 'Tempestade' }
        ];
        
        const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const tempVariation = Math.floor(Math.random() * 10) - 5; // -5 a +5
        
        return {
            name: city,
            main: {
                temp: randomWeather.temp + tempVariation,
                feels_like: randomWeather.temp + tempVariation + Math.floor(Math.random() * 4) - 2,
                humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
                pressure: Math.floor(Math.random() * 50) + 1000 // 1000-1050 hPa
            },
            weather: [{
                description: randomWeather.desc,
                icon: randomWeather.icon
            }],
            wind: {
                speed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
            },
            visibility: Math.floor(Math.random() * 5000) + 5000, // 5-10 km
            coord: {
                lat: lat || (Math.random() * 180 - 90),
                lon: lon || (Math.random() * 360 - 180)
            }
        };
    }

    displayWeather(data) {
        this.hideLoading();
        this.hideError();
        
        // Atualizar informações principais
        this.cityName.textContent = data.name;
        this.weatherIcon.textContent = this.getWeatherIcon(data.weather[0].description);
        this.temperature.textContent = Math.round(data.main.temp);
        this.weatherDescription.textContent = data.weather[0].description;
        this.feelsLike.textContent = `Sensação térmica: ${Math.round(data.main.feels_like)}°C`;
        
        // Atualizar detalhes
        this.windSpeed.textContent = `${Math.round(data.wind.speed)} km/h`;
        this.humidity.textContent = `${data.main.humidity}%`;
        this.visibility.textContent = `${Math.round(data.visibility / 1000)} km`;
        this.pressure.textContent = `${data.main.pressure} hPa`;
        
        // Mostrar card do clima
        this.weatherCard.classList.remove('hidden');
    }

    async getForecast(city) {
        try {
            // Simulando previsão para os próximos 5 dias
            const forecastData = this.generateSimulatedForecast();
            this.displayForecast(forecastData);
        } catch (error) {
            console.error('Erro ao obter previsão:', error);
        }
    }

    generateSimulatedForecast() {
        const days = ['Amanhã', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        const weatherOptions = [
            { icon: '☀️', temp: 28 },
            { icon: '⛅', temp: 25 },
            { icon: '☁️', temp: 22 },
            { icon: '🌧️', temp: 19 },
            { icon: '⛈️', temp: 17 }
        ];
        
        return days.map(day => {
            const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
            const tempVariation = Math.floor(Math.random() * 8) - 4;
            
            return {
                day: day,
                icon: weather.icon,
                temp: weather.temp + tempVariation
            };
        });
    }

    displayForecast(forecastData) {
        this.forecastContainer.innerHTML = '';
        
        forecastData.forEach(item => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${item.day}</div>
                <div class="forecast-icon">${item.icon}</div>
                <div class="forecast-temp">${item.temp}°C</div>
            `;
            
            this.forecastContainer.appendChild(forecastItem);
        });
        
        this.forecastSection.classList.remove('hidden');
    }

    getWeatherIcon(description) {
        const iconMap = {
            'céu limpo': '☀️',
            'parcialmente nublado': '⛅',
            'nublado': '☁️',
            'chuva leve': '🌧️',
            'chuva': '🌧️',
            'tempestade': '⛈️',
            'neve': '❄️',
            'neblina': '🌫️',
            'nevoeiro': '🌫️'
        };
        
        const lowerDesc = description.toLowerCase();
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lowerDesc.includes(key)) {
                return icon;
            }
        }
        
        // Ícones baseados em palavras-chave
        if (lowerDesc.includes('sol') || lowerDesc.includes('limpo')) return '☀️';
        if (lowerDesc.includes('chuv')) return '🌧️';
        if (lowerDesc.includes('nubl') || lowerDesc.includes('nuvem')) return '☁️';
        if (lowerDesc.includes('tempest') || lowerDesc.includes('trovoada')) return '⛈️';
        if (lowerDesc.includes('neve')) return '❄️';
        if (lowerDesc.includes('nebl') || lowerDesc.includes('névoa')) return '🌫️';
        
        return '🌤️'; // Ícone padrão
    }

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
        this.weatherCard.classList.add('hidden');
        this.forecastSection.classList.add('hidden');
        this.errorMessage.classList.add('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.weatherCard.classList.add('hidden');
        this.forecastSection.classList.add('hidden');
        this.hideLoading();
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Adicionar alguns efeitos visuais extras
document.addEventListener('mousemove', (e) => {
    const cursor = document.querySelector('.cursor');
    if (!cursor) {
        const newCursor = document.createElement('div');
        newCursor.className = 'cursor';
        newCursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(newCursor);
    }
    
    const cursorElement = document.querySelector('.cursor');
    cursorElement.style.left = e.clientX - 10 + 'px';
    cursorElement.style.top = e.clientY - 10 + 'px';
});

// Seletores do DOM
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const loadingSpinner = document.getElementById('loading-spinner');
const weatherInfoSection = document.getElementById('weather-info');
const errorMessageSection = document.getElementById('error-message');

const cityNameEl = document.getElementById('city-name');
const currentTempEl = document.getElementById('current-temp');
const currentWeatherIconEl = document.getElementById('current-weather-icon');
const currentConditionEl = document.getElementById('current-condition');
const feelsLikeEl = document.getElementById('feels-like');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');

// Chave da API do OpenWeatherMap (SUBSTITUA PELA SUA CHAVE)
const API_KEY = '3de8f788eb837e9700999ed1959d984c';

// Adiciona Event Listeners
searchButton.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Função principal de busca
async function handleSearch() {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        displayError("Por favor, digite o nome de uma cidade.");
        return;
    }

    if (API_KEY === 'SUA_CHAVE_API_AQUI') {
        displayError("Por favor, configure sua chave de API no arquivo scripts.js.");
        return;
    }

    showLoading();
    hideError();
    hideWeatherInfo();

    try {
        // 1. Obter dados do tempo atual
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=pt_br`;
        const currentResponse = await fetch(currentWeatherUrl);
        if (!currentResponse.ok) {
            throw new Error(`Cidade não encontrada ou erro na API: ${currentResponse.status}`);
        }
        const currentData = await currentResponse.json();
        displayCurrentWeather(currentData);

        // 2. Obter dados da previsão para 5 dias
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=pt_br`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            throw new Error(`Erro ao buscar previsão: ${forecastResponse.status}`);
        }
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);

        showWeatherInfo();

    } catch (error) {
        console.error("Erro ao buscar dados do tempo:", error);
        displayError(error.message.includes('404') || error.message.includes('Cidade não encontrada') ? 
            "Não foi possível encontrar a previsão do tempo para a cidade informada. Verifique o nome e tente novamente." :
            "Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.");
    } finally {
        hideLoading();
    }
}

// Funções de UI (Mostrar/Esconder elementos)
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showWeatherInfo() {
    weatherInfoSection.style.display = 'block';
    // Forçar reflow para reiniciar animações CSS se necessário (adicionando/removendo classes)
    const animatedComponents = weatherInfoSection.querySelectorAll('.animated-component');
    animatedComponents.forEach(component => {
        component.classList.remove('animated-component'); // Remove para caso já tenha sido animado
        void component.offsetWidth; // Força reflow
        component.classList.add('animated-component'); // Re-adiciona para disparar animação
    });
}

function hideWeatherInfo() {
    weatherInfoSection.style.display = 'none';
}

function showError() {
    errorMessageSection.style.display = 'block';
}

function hideError() {
    errorMessageSection.style.display = 'none';
}

// Função para exibir mensagem de erro customizada
function displayError(message) {
    errorMessageSection.querySelector('p').textContent = message;
    showError();
    hideWeatherInfo();
    hideLoading();
}


// Função para exibir os dados do tempo atual
function displayCurrentWeather(data) {
    cityNameEl.textContent = data.name ? `${data.name}, ${data.sys.country}` : 'Cidade Desconhecida';
    currentTempEl.textContent = `${Math.round(data.main.temp)}°C`;
    currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    currentWeatherIconEl.alt = data.weather[0].description;
    currentConditionEl.textContent = data.weather[0].description;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convertendo m/s para km/h
}

// Função para exibir a previsão dos próximos dias
function displayForecast(data) {
    forecastContainer.innerHTML = ''; // Limpa previsões anteriores

    const dailyForecasts = {};

    // Agrupa as previsões por dia (a API retorna a cada 3 horas)
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
        // Pega o dia da semana para simplificar
        const dayOfWeek = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'long' });


        if (!dailyForecasts[dayOfWeek]) {
            dailyForecasts[dayOfWeek] = {
                temps: [],
                icons: [],
                descriptions: [],
                fullDate: date // Guardamos a data completa formatada para o primeiro card do dia
            };
        }
        dailyForecasts[dayOfWeek].temps.push(item.main.temp);
        dailyForecasts[dayOfWeek].icons.push(item.weather[0].icon);
        dailyForecasts[dayOfWeek].descriptions.push(item.weather[0].description);
    });

    let forecastCount = 0;
    for (const day in dailyForecasts) {
        if (forecastCount >= 5) break; // Limita a 5 dias de previsão

        const dayData = dailyForecasts[day];
        const avgTemp = dayData.temps.reduce((a, b) => a + b, 0) / dayData.temps.length;
        // Pega o ícone mais frequente ou o do meio-dia (simplificação)
        const commonIcon = getMostFrequent(dayData.icons) || dayData.icons[Math.floor(dayData.icons.length / 2)] || '01d';

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        // Adiciona delay para animação em cascata
        forecastCard.style.animationDelay = `${forecastCount * 0.1}s`;


        forecastCard.innerHTML = `
            <p class="day">${dayData.fullDate.split(', ')[0]}</p> <img src="https://openweathermap.org/img/wn/${commonIcon}@2x.png" alt="${getMostFrequent(dayData.descriptions) || dayData.descriptions[0]}">
            <p class="temp">${Math.round(avgTemp)}°C</p>
            <p class="condition-forecast">${getMostFrequent(dayData.descriptions) || dayData.descriptions[0]}</p>
        `;
        forecastContainer.appendChild(forecastCard);
        forecastCount++;
    }
}

// Função utilitária para pegar o item mais frequente em um array (para ícones/descrições)
function getMostFrequent(arr) {
    if (!arr || arr.length === 0) return null;
    const hashmap = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b);
}

// Inicialização: Opcionalmente, você pode tentar buscar o tempo para uma cidade padrão ou por geolocalização aqui.
// Por exemplo:
// window.addEventListener('load', () => {
//     // Tentar geolocalização ou carregar uma cidade padrão
// });

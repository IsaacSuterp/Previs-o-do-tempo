class WeatherApp {
  constructor() {
    this.geocodingAPI = "https://geocoding-api.open-meteo.com/v1/search"
    this.weatherAPI = "https://api.open-meteo.com/v1/forecast"
    this.initializeElements()
    this.bindEvents()
    this.updateCurrentDate()
  }

  initializeElements() {
    this.cityInput = document.getElementById("cityInput")
    this.searchBtn = document.getElementById("searchBtn")
    this.locationBtn = document.getElementById("locationBtn")
    this.weatherCard = document.getElementById("weatherCard")
    this.forecastSection = document.getElementById("forecastSection")
    this.loadingSpinner = document.getElementById("loadingSpinner")
    this.errorMessage = document.getElementById("errorMessage")

    // Weather display elements
    this.cityName = document.getElementById("cityName")
    this.currentDate = document.getElementById("currentDate")
    this.weatherIcon = document.getElementById("weatherIcon")
    this.temperature = document.getElementById("temperature")
    this.weatherDescription = document.getElementById("weatherDescription")
    this.feelsLike = document.getElementById("feelsLike")
    this.windSpeed = document.getElementById("windSpeed")
    this.humidity = document.getElementById("humidity")
    this.visibility = document.getElementById("visibility")
    this.pressure = document.getElementById("pressure")
    this.forecastContainer = document.getElementById("forecastContainer")
    this.errorText = document.getElementById("errorText")
  }

  bindEvents() {
    this.searchBtn.addEventListener("click", () => this.handleSearch())
    this.locationBtn.addEventListener("click", () => this.getCurrentLocation())
    this.cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSearch()
      }
    })
  }

  updateCurrentDate() {
    const now = new Date()
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    this.currentDate.textContent = now.toLocaleDateString("pt-BR", options)
  }

  async handleSearch() {
    const city = this.cityInput.value.trim()
    if (!city) {
      this.showError("Por favor, digite o nome de uma cidade.")
      return
    }

    await this.getWeatherByCity(city)
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showError("Geolocalização não é suportada pelo seu navegador.")
      return
    }

    this.showLoading()

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await this.getWeatherByCoords(latitude, longitude)
      },
      (error) => {
        this.hideLoading()
        this.showError("Não foi possível obter sua localização. Verifique as permissões do navegador.")
      },
    )
  }

  async getWeatherByCity(city) {
    this.showLoading()

    try {
      // Primeiro, obter coordenadas da cidade usando geocoding
      const geocodingUrl = `${this.geocodingAPI}?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
      const geocodingResponse = await fetch(geocodingUrl)

      if (!geocodingResponse.ok) {
        throw new Error("Erro ao buscar localização")
      }

      const geocodingData = await geocodingResponse.json()

      if (!geocodingData.results || geocodingData.results.length === 0) {
        this.showError("Cidade não encontrada. Verifique o nome e tente novamente.")
        return
      }

      const location = geocodingData.results[0]
      await this.getWeatherByCoords(location.latitude, location.longitude, location.name, location.country)
    } catch (error) {
      this.hideLoading()
      this.showError("Erro ao buscar dados da cidade. Tente novamente.")
      console.error("Erro:", error)
    }
  }

  async getWeatherByCoords(lat, lon, cityName = "Sua Localização", country = "") {
    try {
      // Obter dados meteorológicos atuais e previsão
      const weatherUrl = `${this.weatherAPI}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6`

      const weatherResponse = await fetch(weatherUrl)

      if (!weatherResponse.ok) {
        throw new Error("Erro ao obter dados meteorológicos")
      }

      const weatherData = await weatherResponse.json()

      // Processar e exibir dados
      this.displayWeather(weatherData, cityName, country)
      this.displayForecast(weatherData.daily)
    } catch (error) {
      this.hideLoading()
      this.showError("Erro ao obter dados meteorológicos. Tente novamente.")
      console.error("Erro:", error)
    }
  }

  displayWeather(data, cityName, country) {
    this.hideLoading()
    this.hideError()

    const current = data.current
    const currentUnits = data.current_units

    // Atualizar informações principais
    this.cityName.textContent = country ? `${cityName}, ${country}` : cityName
    this.weatherIcon.textContent = this.getWeatherIcon(current.weather_code, current.is_day)
    this.temperature.textContent = Math.round(current.temperature_2m)
    this.weatherDescription.textContent = this.getWeatherDescription(current.weather_code)
    this.feelsLike.textContent = `Sensação térmica: ${Math.round(current.apparent_temperature)}°C`

    // Atualizar detalhes
    this.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`
    this.humidity.textContent = `${current.relative_humidity_2m}%`
    this.visibility.textContent = this.getVisibilityFromCloudCover(current.cloud_cover)
    this.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`

    // Mostrar card do clima
    this.weatherCard.classList.remove("hidden")
  }

  displayForecast(dailyData) {
    this.forecastContainer.innerHTML = ""

    // Pular o primeiro dia (hoje) e mostrar os próximos 5 dias
    for (let i = 1; i < Math.min(6, dailyData.time.length); i++) {
      const date = new Date(dailyData.time[i])
      const dayName = this.getDayName(date, i)

      const forecastItem = document.createElement("div")
      forecastItem.className = "forecast-item"

      forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">${this.getWeatherIcon(dailyData.weather_code[i], true)}</div>
                <div class="forecast-temp">
                    <div style="font-size: 1.1rem; font-weight: 600;">${Math.round(dailyData.temperature_2m_max[i])}°</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">${Math.round(dailyData.temperature_2m_min[i])}°</div>
                </div>
            `

      this.forecastContainer.appendChild(forecastItem)
    }

    this.forecastSection.classList.remove("hidden")
  }

  getDayName(date, index) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (index === 1) return "Amanhã"

    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    return days[date.getDay()]
  }

  getWeatherIcon(weatherCode, isDay = true) {
    // WMO Weather interpretation codes
    const weatherIcons = {
      0: isDay ? "☀️" : "🌙", // Clear sky
      1: isDay ? "🌤️" : "🌙", // Mainly clear
      2: "⛅", // Partly cloudy
      3: "☁️", // Overcast
      45: "🌫️", // Fog
      48: "🌫️", // Depositing rime fog
      51: "🌦️", // Light drizzle
      53: "🌦️", // Moderate drizzle
      55: "🌧️", // Dense drizzle
      56: "🌨️", // Light freezing drizzle
      57: "🌨️", // Dense freezing drizzle
      61: "🌧️", // Slight rain
      63: "🌧️", // Moderate rain
      65: "🌧️", // Heavy rain
      66: "🌨️", // Light freezing rain
      67: "🌨️", // Heavy freezing rain
      71: "❄️", // Slight snow fall
      73: "❄️", // Moderate snow fall
      75: "❄️", // Heavy snow fall
      77: "❄️", // Snow grains
      80: "🌦️", // Slight rain showers
      81: "🌧️", // Moderate rain showers
      82: "🌧️", // Violent rain showers
      85: "🌨️", // Slight snow showers
      86: "🌨️", // Heavy snow showers
      95: "⛈️", // Thunderstorm
      96: "⛈️", // Thunderstorm with slight hail
      99: "⛈️", // Thunderstorm with heavy hail
    }

    return weatherIcons[weatherCode] || "🌤️"
  }

  getWeatherDescription(weatherCode) {
    const descriptions = {
      0: "Céu limpo",
      1: "Principalmente limpo",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina com geada",
      51: "Garoa leve",
      53: "Garoa moderada",
      55: "Garoa intensa",
      56: "Garoa congelante leve",
      57: "Garoa congelante intensa",
      61: "Chuva leve",
      63: "Chuva moderada",
      65: "Chuva forte",
      66: "Chuva congelante leve",
      67: "Chuva congelante forte",
      71: "Neve leve",
      73: "Neve moderada",
      75: "Neve forte",
      77: "Granizo de neve",
      80: "Pancadas de chuva leves",
      81: "Pancadas de chuva moderadas",
      82: "Pancadas de chuva violentas",
      85: "Pancadas de neve leves",
      86: "Pancadas de neve fortes",
      95: "Tempestade",
      96: "Tempestade com granizo leve",
      99: "Tempestade com granizo forte",
    }

    return descriptions[weatherCode] || "Condição desconhecida"
  }

  getVisibilityFromCloudCover(cloudCover) {
    // Estimar visibilidade baseada na cobertura de nuvens
    if (cloudCover <= 20) return "> 10 km"
    if (cloudCover <= 40) return "8-10 km"
    if (cloudCover <= 60) return "5-8 km"
    if (cloudCover <= 80) return "3-5 km"
    return "< 3 km"
  }

  showLoading() {
    this.loadingSpinner.classList.remove("hidden")
    this.weatherCard.classList.add("hidden")
    this.forecastSection.classList.add("hidden")
    this.errorMessage.classList.add("hidden")
  }

  hideLoading() {
    this.loadingSpinner.classList.add("hidden")
  }

  showError(message) {
    this.errorText.textContent = message
    this.errorMessage.classList.remove("hidden")
    this.weatherCard.classList.add("hidden")
    this.forecastSection.classList.add("hidden")
    this.hideLoading()
  }

  hideError() {
    this.errorMessage.classList.add("hidden")
  }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp()
})

// Adicionar alguns efeitos visuais extras
document.addEventListener("mousemove", (e) => {
  const cursor = document.querySelector(".cursor")
  if (!cursor) {
    const newCursor = document.createElement("div")
    newCursor.className = "cursor"
    newCursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease;
        `
    document.body.appendChild(newCursor)
  }

  const cursorElement = document.querySelector(".cursor")
  cursorElement.style.left = e.clientX - 10 + "px"
  cursorElement.style.top = e.clientY - 10 + "px"
})

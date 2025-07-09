class WeatherApp {
  constructor() {
    this.geocodingAPI = "https://geocoding-api.open-meteo.com/v1/search"
    this.weatherAPI = "https://api.open-meteo.com/v1/forecast"
    this.initializeElements()
    this.bindEvents()
    this.updateCurrentDate()
    this.initializeAdvancedEffects()
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

    // Add advanced button effects
    this.addButtonEffects()
  }

  initializeAdvancedEffects() {
    // Advanced cursor trail effect
    this.initializeCursorTrail()

    // Dynamic background particles
    this.animateParticles()

    // Add scroll-triggered animations
    this.initializeScrollAnimations()
  }

  initializeCursorTrail() {
    let mouseX = 0,
      mouseY = 0
    const trailElements = []

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Create trail element
      const trail = document.createElement("div")
      trail.className = "cursor-trail"
      trail.style.left = mouseX + "px"
      trail.style.top = mouseY + "px"
      document.body.appendChild(trail)

      trailElements.push(trail)

      // Remove old trail elements
      if (trailElements.length > 20) {
        const oldTrail = trailElements.shift()
        if (oldTrail && oldTrail.parentNode) {
          oldTrail.parentNode.removeChild(oldTrail)
        }
      }

      // Remove trail after animation
      setTimeout(() => {
        if (trail && trail.parentNode) {
          trail.parentNode.removeChild(trail)
        }
      }, 1000)
    })
  }

  animateParticles() {
    const particles = document.querySelectorAll(".particle")
    particles.forEach((particle, index) => {
      // Random starting position
      particle.style.left = Math.random() * 100 + "%"
      particle.style.animationDelay = Math.random() * 6 + "s"
      particle.style.animationDuration = 6 + Math.random() * 4 + "s"
    })
  }

  initializeScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running"
        }
      })
    }, observerOptions)

    // Observe elements for scroll animations
    document.querySelectorAll(".weather-card, .forecast-section").forEach((el) => {
      observer.observe(el)
    })
  }

  addButtonEffects() {
    const buttons = [this.searchBtn, this.locationBtn]

    buttons.forEach((button) => {
      button.addEventListener("mouseenter", (e) => {
        this.createRippleEffect(e.target, e)
      })

      button.addEventListener("click", (e) => {
        this.createClickEffect(e.target, e)
      })
    })
  }

  createRippleEffect(element, event) {
    const ripple = document.createElement("span")
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `

    element.style.position = "relative"
    element.style.overflow = "hidden"
    element.appendChild(ripple)

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 600)
  }

  createClickEffect(element, event) {
    // Create multiple particles on click
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const particle = document.createElement("div")
        const rect = element.getBoundingClientRect()

        particle.style.cssText = `
          position: fixed;
          width: 4px;
          height: 4px;
          background: #ff6b6b;
          border-radius: 50%;
          left: ${event.clientX}px;
          top: ${event.clientY}px;
          pointer-events: none;
          z-index: 9999;
          animation: clickParticle 1s ease-out forwards;
        `

        document.body.appendChild(particle)

        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        }, 1000)
      }, i * 50)
    }
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
      const weatherUrl = `${this.weatherAPI}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6`

      const weatherResponse = await fetch(weatherUrl)

      if (!weatherResponse.ok) {
        throw new Error("Erro ao obter dados meteorológicos")
      }

      const weatherData = await weatherResponse.json()

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

    this.cityName.textContent = country ? `${cityName}, ${country}` : cityName
    this.weatherIcon.textContent = this.getWeatherIcon(current.weather_code, current.is_day)
    this.temperature.textContent = Math.round(current.temperature_2m)
    this.weatherDescription.textContent = this.getWeatherDescription(current.weather_code)
    this.feelsLike.textContent = `Sensação térmica: ${Math.round(current.apparent_temperature)}°C`

    this.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`
    this.humidity.textContent = `${current.relative_humidity_2m}%`
    this.visibility.textContent = this.getVisibilityFromCloudCover(current.cloud_cover)
    this.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`

    // Add staggered animation to weather card
    this.weatherCard.classList.remove("hidden")
    this.animateWeatherCardElements()
  }

  animateWeatherCardElements() {
    const elements = this.weatherCard.querySelectorAll(".weather-header, .temperature-section, .detail-item")
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`
      el.classList.add("animate-in")
    })
  }

  displayForecast(dailyData) {
    this.forecastContainer.innerHTML = ""

    for (let i = 1; i < Math.min(6, dailyData.time.length); i++) {
      const date = new Date(dailyData.time[i])
      const dayName = this.getDayName(date, i)

      const forecastItem = document.createElement("div")
      forecastItem.className = "forecast-item"
      forecastItem.style.animationDelay = `${i * 0.1}s`

      forecastItem.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-icon">${this.getWeatherIcon(dailyData.weather_code[i], true)}</div>
        <div class="forecast-temp">
          <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px;">${Math.round(dailyData.temperature_2m_max[i])}°</div>
          <div style="font-size: 1rem; opacity: 0.8;">${Math.round(dailyData.temperature_2m_min[i])}°</div>
        </div>
      `

      this.forecastContainer.appendChild(forecastItem)
    }

    this.forecastSection.classList.remove("hidden")
  }

  getDayName(date, index) {
    if (index === 1) return "Amanhã"
    const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    return days[date.getDay()]
  }

  getWeatherIcon(weatherCode, isDay = true) {
    const weatherIcons = {
      0: isDay ? "☀️" : "🌙",
      1: isDay ? "🌤️" : "🌙",
      2: "⛅",
      3: "☁️",
      45: "🌫️",
      48: "🌫️",
      51: "🌦️",
      53: "🌦️",
      55: "🌧️",
      56: "🌨️",
      57: "🌨️",
      61: "🌧️",
      63: "🌧️",
      65: "🌧️",
      66: "🌨️",
      67: "🌨️",
      71: "❄️",
      73: "❄️",
      75: "❄️",
      77: "❄️",
      80: "🌦️",
      81: "🌧️",
      82: "🌧️",
      85: "🌨️",
      86: "🌨️",
      95: "⛈️",
      96: "⛈️",
      99: "⛈️",
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

// Add dynamic CSS animations
const style = document.createElement("style")
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes clickParticle {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
      opacity: 0;
    }
  }
  
  .animate-in {
    animation: slideInUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
  }
  
  @keyframes slideInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(style)

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp()
})
      

class WeatherApp {
  constructor() {
    this.geocodingAPI = "https://geocoding-api.open-meteo.com/v1/search"
    this.weatherAPI = "https://api.open-meteo.com/v1/forecast"

    // Performance optimizations
    this.debounceTimer = null
    this.animationFrameId = null
    this.isLoading = false

    this.initializeElements()
    this.bindEvents()
    this.updateCurrentDate()
    this.initializeOptimizedEffects()
  }

  initializeElements() {
    // Cache DOM elements for performance
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
    // Optimized event listeners with passive option where possible
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this))
    this.locationBtn.addEventListener("click", this.handleLocationClick.bind(this))

    // Debounced input handler
    this.cityInput.addEventListener("input", this.debounceInput.bind(this), { passive: true })
    this.cityInput.addEventListener("keypress", this.handleKeyPress.bind(this))

    // Optimized button effects
    this.addOptimizedButtonEffects()
  }

  // Debounced input for performance
  debounceInput(e) {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(() => {
      // Could add autocomplete here
    }, 300)
  }

  handleKeyPress(e) {
    if (e.key === "Enter" && !this.isLoading) {
      this.handleSearch()
    }
  }

  initializeOptimizedEffects() {
    // Reduced particle system for better performance
    this.initializeOptimizedParticles()

    // Optimized cursor effects
    this.initializeOptimizedCursor()

    // Intersection Observer for lazy animations
    this.initializeIntersectionObserver()
  }

  initializeOptimizedParticles() {
    const particles = document.querySelectorAll(".particle")
    particles.forEach((particle, index) => {
      // Stagger animation start times
      particle.style.animationDelay = `${index * 2}s`
      particle.style.animationDuration = `${8 + Math.random() * 4}s`
    })
  }

  initializeOptimizedCursor() {
    let mouseX = 0,
      mouseY = 0
    let isMoving = false

    // Throttled mouse tracking
    const throttledMouseMove = this.throttle((e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (!isMoving) {
        isMoving = true
        this.animationFrameId = requestAnimationFrame(() => {
          this.updateCursorEffect(mouseX, mouseY)
          isMoving = false
        })
      }
    }, 16) // ~60fps

    document.addEventListener("mousemove", throttledMouseMove, { passive: true })
  }

  updateCursorEffect(x, y) {
    // Lightweight cursor effect
    const trail = document.createElement("div")
    trail.className = "cursor-trail"
    trail.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 107, 107, 0.4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: cursorFade 0.8s ease-out forwards;
    `

    document.body.appendChild(trail)

    // Clean up after animation
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail)
      }
    }, 800)
  }

  initializeIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "50px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
          observer.unobserve(entry.target) // Stop observing after animation
        }
      })
    }, observerOptions)

    // Observe forecast section for lazy animation
    if (this.forecastSection) {
      observer.observe(this.forecastSection)
    }
  }

  addOptimizedButtonEffects() {
    const buttons = [this.searchBtn, this.locationBtn]

    buttons.forEach((button) => {
      // Optimized hover effects
      button.addEventListener(
        "mouseenter",
        (e) => {
          e.target.style.willChange = "transform, box-shadow"
        },
        { passive: true },
      )

      button.addEventListener(
        "mouseleave",
        (e) => {
          e.target.style.willChange = "auto"
        },
        { passive: true },
      )

      // Optimized click effect
      button.addEventListener("click", (e) => {
        this.createOptimizedRipple(e.target, e)
      })
    })
  }

  createOptimizedRipple(element, event) {
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
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.4s ease-out;
      pointer-events: none;
    `

    element.style.position = "relative"
    element.style.overflow = "hidden"
    element.appendChild(ripple)

    // Clean up
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 400)
  }

  // Utility function for throttling
  throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments
      
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
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
    if (this.isLoading) return

    const city = this.cityInput.value.trim()
    if (!city) {
      this.showError("Por favor, digite o nome de uma cidade.")
      return
    }

    await this.getWeatherByCity(city)
  }

  async handleLocationClick() {
    if (this.isLoading) return

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
      { timeout: 10000, enableHighAccuracy: false }, // Optimized geolocation options
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

    // Batch DOM updates for performance
    requestAnimationFrame(() => {
      this.cityName.textContent = country ? `${cityName}, ${country}` : cityName
      this.weatherIcon.textContent = this.getWeatherIcon(current.weather_code, current.is_day)
      this.temperature.textContent = Math.round(current.temperature_2m)
      this.weatherDescription.textContent = this.getWeatherDescription(current.weather_code)
      this.feelsLike.textContent = `Sensação térmica: ${Math.round(current.apparent_temperature)}°C`

      this.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`
      this.humidity.textContent = `${current.relative_humidity_2m}%`
      this.visibility.textContent = this.getVisibilityFromCloudCover(current.cloud_cover)
      this.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`

      this.weatherCard.classList.remove("hidden")
    })
  }

  displayForecast(dailyData) {
    // Use DocumentFragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment()

    for (let i = 1; i < Math.min(6, dailyData.time.length); i++) {
      const date = new Date(dailyData.time[i])
      const dayName = this.getDayName(date, i)

      const forecastItem = document.createElement("div")
      forecastItem.className = "forecast-item"

      forecastItem.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-icon">${this.getWeatherIcon(dailyData.weather_code[i], true)}</div>
        <div class="forecast-temp">
          <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px;">${Math.round(dailyData.temperature_2m_max[i])}°</div>
          <div style="font-size: 1rem; opacity: 0.8;">${Math.round(dailyData.temperature_2m_min[i])}°</div>
        </div>
      `

      fragment.appendChild(forecastItem)
    }

    // Single DOM update
    this.forecastContainer.innerHTML = ""
    this.forecastContainer.appendChild(fragment)
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
    this.isLoading = true
    this.loadingSpinner.classList.remove("hidden")
    this.weatherCard.classList.add("hidden")
    this.forecastSection.classList.add("hidden")
    this.errorMessage.classList.add("hidden")
  }

  hideLoading() {
    this.isLoading = false
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

  // Cleanup method for performance
  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
}

// Performance-optimized CSS animations
const optimizedStyles = document.createElement("style")
optimizedStyles.textContent = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes cursorFade {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
  
  .animate-in {
    animation: slideInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  
  @keyframes slideInUp {
    0% {
      opacity: 0;
      transform: translate3d(0, 20px, 0);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
`
document.head.appendChild(optimizedStyles)

// Initialize app with performance monitoring
document.addEventListener("DOMContentLoaded", () => {
  // Performance mark
  performance.mark("weather-app-start")

  const app = new WeatherApp()

  // Performance measure
  performance.mark("weather-app-ready")
  performance.measure("weather-app-init", "weather-app-start", "weather-app-ready")

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    app.destroy()
  })
})

// Service Worker registration for caching (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
  })
      }

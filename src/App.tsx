import React, { useState } from "react"
import axios from "axios"
import { Suggestion, DailyForecast, ForecastUpcomingDays, WeatherbitAPIDay, WeatherbitAPIResponse, AutocompleteAPIResponse, AutocompleteAPISuggestion, DetailsAPIResponse } from "./types"
import { formatDate, formatDayName } from "./utils"
import TempMinIcon from "./assets/temp_min.svg"
import TempMaxIcon from "./assets/temp_max.svg"
import RainIcon from "./assets/rain.svg"
import SearchIcon from "./assets/search.svg"
import DeleteIcon from "./assets/delete.svg"
import "./App.css"

const App: React.FC = () => {
  const [input, setInput] = useState<string>("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [forecast, setForecast] = useState<ForecastUpcomingDays | null>(null)
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null)

  const googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
  const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    if (value) {
      setLoading(true)
      try {
        const autocompleteResponse = await axios.get<AutocompleteAPIResponse>(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${value}&key=${googleApiKey}`
        )
        //console.log("search autocomplete: ", autocompleteResponse)

        const autocompleteSuggestions = autocompleteResponse.data.predictions.map(
          (item: AutocompleteAPISuggestion): Suggestion => ({
            placeId: item.place_id,
            description: item.description,
          })
        )
        //console.log("autocompleteSuggestions: ", autocompleteSuggestions)
        setSuggestions(autocompleteSuggestions)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    setInput("")
    setSuggestions([])

    const placeId = suggestion.placeId

    try {
      const detailsResponse = await axios.get<DetailsAPIResponse>(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleApiKey}`
      )
      console.log("place api response: ", detailsResponse.data.result.geometry)

      const geolocation = detailsResponse.data.result.geometry.location

      const weatherResponse = await axios.get<WeatherbitAPIResponse>(
        `https://api.weatherbit.io/v2.0/forecast/daily?lat=${geolocation.lat}&lon=${geolocation.lng}&days=7&key=${weatherApiKey}`
      )

      console.log("weatherbit api res: ", weatherResponse.data.data)

      const weatherDailyForecast = weatherResponse.data.data.map(
        (item: WeatherbitAPIDay): DailyForecast => ({
          datetime: formatDate(item.datetime),
          dayName: formatDayName(item.datetime),
          temp: item.temp,
          minTemp: item.min_temp,
          maxTemp: item.max_temp,
          rain: item.precip,
          weather: {
            description: item.weather.description,
            icon: item.weather.icon,
          },
        })
      )

      console.log("weatherDailyForecast: ", weatherDailyForecast)

      const forecastData: ForecastUpcomingDays = {
        days: weatherDailyForecast.slice(1),
        location: {
          location_name: weatherResponse.data.city_name,
          country_code: weatherResponse.data.country_code,
          latitude: geolocation.lat,
          longitude: geolocation.lng,
        },
        today: weatherDailyForecast[0],
      }

      setForecast(forecastData)
      console.log("forecastData: ", forecastData)
    } catch (error) {
      console.error("Error fetching weather data:", error)
    }
  }

  const handleDeleteClick = () => {
    setInput("")
    setSuggestions([])
  }

  return (
    <div className="App">
      <div className="column-left">
        <div className="header">
          <div>Weather Site</div>
          {/* <div className="location">Your current location:</div>
      {forecast && <div>{forecast.location.location_name}</div>} */}
        </div>

        <div className="search-bar">
          <img src={SearchIcon} alt="" />
          <input type="text" value={input} onChange={handleInputChange} placeholder="Search country, region, city" />
          <img src={DeleteIcon} alt="" onClick={handleDeleteClick} />
        </div>

        {loading && <div>Loading...</div>}
        <ul className="search-list">
          {suggestions.map(suggestion => (
            <li
              key={suggestion.placeId}
              onClick={() => handleSuggestionClick(suggestion)}
              className="search-list-item"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>

        {forecast ? (
          <div>
            <div>
              <div className="current-weather">
                {forecast.today.temp > 0 && <span>+</span>}
                {forecast.today.temp} <br /> {forecast.location.location_name}
              </div>
              <div className="current-weather-desc">{forecast.today.weather.description}</div>
              <div className="weather-stats">
                <div>
                  <img src={TempMaxIcon} alt="" />
                  Max {forecast.today.maxTemp > 0 && <span>+</span>}
                  {forecast.today.maxTemp}
                </div>
                <div>
                  <img src={TempMinIcon} alt="" />
                  Min {forecast.today.minTemp > 0 && <span>+</span>}
                  {forecast.today.minTemp}
                </div>
                <div>
                  <img src={RainIcon} alt="" />
                  Rain {forecast.today.rain.toFixed(1)} mm
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-search-result">No Data Available</div>
        )}
      </div>

      {forecast && (
        <div>
          <div className="column-right">
            <div className="upcoming-days">Upcoming Days</div>
            <ul className="days-list">
              {forecast.days.map(day => (
                <li key={day.datetime} onClick={() => setSelectedDay(day)} className="day">
                  <div className="day-forecast">
                    <div className="day-name">
                      {day.dayName} {day.datetime}
                    </div>
                    <div className="day-stats-container">
                      <div className="day-stats">
                        <img
                          src={`https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png`}
                          alt={day.weather.description}
                          className="weather-icon"
                        />
                        <div>
                          {day.temp > 0 && <span>+</span>} {day.temp}
                        </div>
                      </div>
                      {selectedDay === day && (
                        <div>
                          <div className="day-stats">
                            <img src={TempMaxIcon} alt="" className="weather-icon" />
                            Max {day.maxTemp > 0 && <span>+</span>}
                            {day.maxTemp}
                          </div>
                          <div className="day-stats">
                            <img src={TempMinIcon} alt="" className="weather-icon" />
                            Min {day.minTemp > 0 && <span>+</span>} {day.minTemp}
                          </div>
                          <div className="day-stats">
                            <img src={RainIcon} alt="" className="weather-icon" />
                            Rain {day.rain.toFixed(1)} mm
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

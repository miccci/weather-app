export interface Suggestion {
  place_id: string
  description: string
}

export interface Location {
  location_name: string
  country_code: string
  latitude: number
  longitude: number
}

export interface Weather {
  description: string
  icon: string
}

export interface DailyForecast {
  datetime: string
  dayName: string
  temp: number
  minTemp: number
  maxTemp: number
  rain: number
  weather: Weather
}

export interface ForecastUpcomingDays {
  days: DailyForecast[]
  location: Location
  today: DailyForecast
}

export interface WeatherbitAPIResponse {
  city_name: string
  country_code: string
  data: WeatherbitAPIDay[]
}

export interface WeatherbitAPIDay  {
  datetime: string
  temp: number
  min_temp: number
  max_temp: number
  precip: number
  weather: {
    description: string
    icon: string
  }
}

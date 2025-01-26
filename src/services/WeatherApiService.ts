import axios from 'axios';

import IWeatherAPIResponse from '../interfaces/IWeatherAPIResponse';

export default class WeatherApiService {
  private apiKey: string;
  
  constructor(key: string){
    this.apiKey = key;
  }

  async request(cities: string[]){
    let allValid = true;
    const data: IWeatherAPIResponse[] = await Promise.all(
      cities.map(async (city: string) => {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
          );
          return { city: response.data.name, content: response.data, status: true };
        } catch (error: any) {
          allValid = false;
          return { city: city, content: { error: `Error fetching weather data for ${city}: ${error.message}` }, status: false };
        }
      })
    );
    return {data: data, allValid: allValid};
  }
}
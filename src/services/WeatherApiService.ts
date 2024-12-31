import axios from 'axios';

import ICitiesReponse from '../interfaces/ICitiesResponse';
import IWeatherAPIResponse from '../interfaces/IWeatherAPIResponse';

export default class WeatherApiService {
  private apiKey: string;
  
  constructor(key: string){
    this.apiKey = key;
  }

  async request(cities: string[]): Promise<IWeatherAPIResponse[]> {
    console.log(cities + " CIDADES");
  
    const data: IWeatherAPIResponse[] = await Promise.all(
      cities.map(async (city: string) => {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
          );
          return { city: city, response: response.data, status: true };
        } catch (error: any) {
          return { city: city, response: { error: `Error fetching weather data for ${city}: ${error.message}` }, status: false };
        }
      })
    );
  
    return data;
  }

  // async requestOnly(city: string): Promise<any>{
  //   try {
  //     const response = await axios.get(
  //       `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
  //     );
  //     return { city: city, response: response.data, status: true };
  //   } catch (error: any) {
  //     return { city: city, response: {error: `Error fetching weather data for ${city}: ${error.message}`}, status: false };
  //   }
  // }
}
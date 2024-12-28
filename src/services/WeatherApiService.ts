import axios from 'axios';

export default class WeatherApiService {
  private apiKey: string;

  constructor(key: string){
    this.apiKey = key;
  }

  request(city: string): Promise<any> {
    console.log("testes")
    return new Promise((resolve, reject) => {
      axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(`Error fetching weather data: ${error.message}`);
        });
    });
  }
}
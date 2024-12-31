export default interface ICitiesResponse {
  status: boolean;
  data: { city: string; response: any; status: boolean }[];
}
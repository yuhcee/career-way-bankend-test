import axios from 'axios';

// const baseURL = URL[settings.NODE_ENV];

export const xhttp = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});
const http = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});
export default http;

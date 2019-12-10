import axios from "axios";
import qs from "qs";

const baseURL = process.env === "production" ? "/" : "/api";
const homeURL = process.env === "production" ? "//violetdeng.com" : "//violetdeng.com:3000/auth/github?redirectUrl=http://localhost:8081#/login";

const instance = axios.create({
  baseURL,
  timeout: 5000,
  withCredentials: true,
  transformRequest: [data => {
    return qs.stringify(data);
  }],
  headers:{
    "Content-Type":"application/x-www-form-urlencoded"
  }
});

instance.interceptors.request.use(
  config => {
    if (localStorage.getItem('Authorization')) {
      config.headers.Authorization = 'Bearer ' + localStorage.getItem('Authorization');
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(function ({ data }) {
  return data;
}, function (error) {
  if (error.response) {
    if (error.response.status === 401) {
      localStorage.removeItem('Authorization')
      window.location = homeURL;
    }
  }
  return Promise.reject(error);
});

export default instance;

const logout = baseURL + "?r=user/logout";

export {
  logout
};

import axios from "axios";
import qs from "qs";
import { router } from '@/main'

const baseURL = process.env === "production" ? "/" : "/api";
const homeURL = process.env === "production" ? "//violetdeng.com" : "//violetdeng.com:3000/auth/github?redirectUrl=http://localhost:8081#/login";

const instance = axios.create({
  baseURL,
  timeout: 5000,
  withCredentials: true,
  transformRequest: [data => {
    return qs.stringify(data);
  }]
});

instance.interceptors.request.use(
  config => {
    if (localStorage.getItem('Authorization')) {
      config.headers.Authorization = 'Bearer ' + localStorage.getItem('Authorization');
    }

    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(function ({ data }) {
  if (data.result === -1) {
    localStorage.removeItem('Authorization')
    router.push('/login')
  } else {
    return data;
  }
}, function (error) {
  return Promise.reject(error);
});

export default instance;

const logout = baseURL + "?r=user/logout";

export {
  logout
};

import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:6677/',
    timeout: 20000,
})

export default axiosInstance

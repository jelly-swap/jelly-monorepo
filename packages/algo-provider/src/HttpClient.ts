import Axios, { AxiosInstance } from 'axios';

export default class AlgorandProvider {
    private axios: AxiosInstance;

    constructor(baseURL: string) {
        this.axios = Axios.create({
            baseURL,
            responseType: 'text',
            transformResponse: undefined, // https://github.com/axios/axios/issues/907,
        });
    }

    async getExternal(url: string) {
        try {
            const response = await Axios.get(url);
            return response.data;
        } catch (err) {
            if (err.response) {
                return err.response.data;
            } else {
                return err;
            }
        }
    }

    async get(url: string) {
        try {
            const response = await this.axios.get(url);
            return response.data;
        } catch (err) {
            if (err.response) {
                return err.response.data;
            } else {
                return err;
            }
        }
    }

    async post(url: string, data: any) {
        try {
            const response = await this.axios.post(url, data);
            return response.data;
        } catch (err) {
            if (err.response) {
                return err.response.data;
            } else {
                return err;
            }
        }
    }
}

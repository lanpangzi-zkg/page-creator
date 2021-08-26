import axios from 'axios';
import proxyServerUrl from '../utils/Constants';

axios.interceptors.response.use((response) => {
    return response;
  }, (error) => {
    return Promise.reject(error);
});

const defaultResponse = {
	code: 0,
	message: 'ok',
};

const mockData = {
	'userList': {
		code: 0,
		message: 'ok',
		data: {
			list: [{
				id: 1,
				name: 'a',
			}, {
				id: 2,
				name: 'b',
			}],
			total: 2,
		}
	},
	'fetchUser': {
		code: 0,
		message: 'ok',
		data: {
			id: 1,
			name: 'a',
		}
	},
};
class AppService {
    requestApi(host, method, url, params) {
		console.log(`${url}->`, params);
		const validUrl = `${url.startsWith('/') ? url.slice(1) : url}`;
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					status: 200,
					data: mockData[validUrl] || defaultResponse
				});
			}, 500);
		});
        return axios({
                method,
            // method: 'post',
            // url: `${proxyServerUrl}/validUrl`,
            // data: {
            //     host: localStorage.getItem(host) || '',
            //     method,
            //     api,
            //     params,
            //     appUrl: localStorage.getItem('appUrl'),
            //     access_token: localStorage.getItem('access_token'),
            //     MerchantId: localStorage.getItem('MerchantId'),
            // }
        });
    }
}

export default AppService;
import AppStoreConnectController from './controllers/AppStoreConnectController';
import AppStoreError from './types/AppStoreError';
import * as fs from 'fs';

const appStoreConnectController = new AppStoreConnectController();
appStoreConnectController
    .getSubscriptionTrends()
    .then((response) => {
        response.data.pipe(fs.createWriteStream('new.zip'));
    })
    .catch((err) => {
        if (err.response) {
            // client received an error response (5xx, 4xx)
            console.log('appStoreConnectError:', err.response.data);
        } else if (err.request) {
            // client never received a response, or request never left
            console.log('Axios Request Error', err.message);
        } else {
            // anything else
            console.log('Something is wrong', err.message);
        }
    });

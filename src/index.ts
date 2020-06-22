import FileDownload from 'js-file-download';
import AppStoreConnectController from './controllers/AppStoreConnectController';
import AppStoreError from './types/AppStoreError';
import * as fs from 'fs';
import * as zlib from 'zlib';

const appStoreConnectController = new AppStoreConnectController();
// buffer to store the streamed decompression
const buffer: unknown[] = [];
appStoreConnectController
    .getSubscriptionTrends()
    .then((response) => {
        const gunzip = zlib.createGunzip();
        response.data.pipe(fs.createWriteStream('new.zip'));

        gunzip
            .on('data', function (data) {
                // decompression chunk ready, add it to the buffer
                buffer.push(data.toString());
            })
            .on('end', function () {
                // response and decompression complete, join the buffer and return
                // callback(null, buffer.join(''));
                console.log(buffer);
            })
            .on('error', function (e) {
                console.log(e);
                // callback(e);
            });
    })
    .catch((err) => {
        if (err.response) {
            // client received an error response (5xx, 4xx)
            console.log('appStoreConnectError:', err.response.data);
            err.response.data.errors.forEach((error: AppStoreError) => {
                console.log('appStoreConnectError:', error);
            });
        } else if (err.request) {
            // client never received a response, or request never left
            console.log('Axios Request Error', err.message);
        } else {
            // anything else
            console.log('Something is wrong', err.message);
        }
    });

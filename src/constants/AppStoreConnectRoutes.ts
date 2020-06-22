import { Method } from 'axios';

export default {
    host: 'https://api.appstoreconnect.apple.com',
    salesAndTrends: (): { method: Method; endpoint: string } => ({
        endpoint: '/v1/salesReports',
        method: 'GET',
    }),
};

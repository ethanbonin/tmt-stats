export const endpoints = {
    host: 'https://api.appstoreconnect.apple.com',
    salesAndTrends: (): { method: string; endpoint: string } => ({
        endpoint: '/v1/salesReports',
        method: 'GET',
    }),
};

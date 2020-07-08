import AppStoreConnectController from './controllers/AppStoreConnectController';
import moment from 'moment';
import parse from 'csv-parse';
import ReportDatesToQuery from './types/ReportDatesToQuery';

const appStoreConnectController = new AppStoreConnectController();

appStoreConnectController
    .readReportsToQuery()
    .then((dates) => {
        const convertedDates = dates.map((date) => {
            return {
                startDate: new Date(date.startdate),
                endDate: new Date(date.enddate),
            };
        });
        const trends = convertedDates.map((date) =>
            appStoreConnectController.getSubscriptionTrendsForDateRange(date.startDate, date.endDate),
        );
        return Promise.all(trends);
    })
    .then((subscriptionEvents) => {
        const data = subscriptionEvents.reduce(function (prev, curr) {
            return prev.concat(curr);
        });
        return appStoreConnectController.cleanSubscriptionEvents(data);
    })
    .then((cleanedSubscriptionEvents) => {
        return appStoreConnectController.writeReportsToCvs('Reports', cleanedSubscriptionEvents);
    })
    .catch((err) => {
        if (err.response) {
            // client received an error response (5xx, 4xx)
            // console.log('appStoreConnectError:', err.response.data);
            console.log('Response Error', err.message);
        } else if (err.request) {
            // client never received a response, or request never left
            console.log('Axios Request Error', err.message);
        } else {
            // anything else
            console.log('Something is wrong', err.message);
        }
    });

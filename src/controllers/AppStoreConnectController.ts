import JwtHelper from '../helpers/JwtHelper';
import config from '../config/config.json';
import * as fs from 'fs';
import axios from 'axios';
import AppStoreConnectRoutes from '../constants/AppStoreConnectRoutes';
import { Filter, ReportSubType, ReportType } from '../constants/QueryParameters';
import SubscriptionTrendsParams from '../types/SubscriptionTrendsParams';

export class AppStoreConnectController {
    private _jwtHelper: JwtHelper;

    constructor() {
        const privateKey = fs.readFileSync('src/config/AuthKey_9KF7X462B3.p8', 'utf8');
        this._jwtHelper = new JwtHelper(privateKey, config.kid, config.iss);
    }

    getSubscriptionTrendParams = (subscriptionTrendsParams: SubscriptionTrendsParams) => {
        return {
            'filter[frequency]': subscriptionTrendsParams.frequency,
            'filter[reportSubType]': subscriptionTrendsParams.reportSubType,
            'filter[reportType]': subscriptionTrendsParams.reportType,
            'filter[vendorNumber]': subscriptionTrendsParams.vendorNumber,
            'filter[reportDate]': subscriptionTrendsParams.reportDate,
            'filter[version]': subscriptionTrendsParams.version,
        };
    };

    // getSubscriptionTrend = async (forDate: Date) => {};

    getSubscriptionTrends = async (forDate: Date) => {
        const subscriptionTrendsParams: SubscriptionTrendsParams = {
            frequency: Filter.DAILY,
            reportSubType: ReportSubType.SUMMARY,
            reportType: ReportType.SUBSCRIPTION_EVENT,
            vendorNumber: `${config.vendorNumber}`,
            reportDate: forDate.form,
        };

        const params = this.getSubscriptionTrendParams(subscriptionTrendsParams);
        // const params = {
        //     'filter[frequency]': `${Filter.DAILY}`,
        //     'filter[reportSubType]': `${ReportSubType.SUMMARY}`,
        //     'filter[reportType]': `${ReportType.SUBSCRIPTION_EVENT}`,
        //     'filter[vendorNumber]': `${config.vendorNumber}`,
        //     'filter[reportDate]': `2020-06-20`,
        //     'filter[version]': '1_2',
        // };
        const headers = {
            Authorization: `Bearer ${this._jwtHelper.getToken()}`,
        };

        const { endpoint, method } = AppStoreConnectRoutes.salesAndTrends();
        return axios({
            method: method,
            headers: headers,
            url: AppStoreConnectRoutes.host + endpoint,
            params: params,
            responseType: 'stream',
        });
    };
}

export default AppStoreConnectController;

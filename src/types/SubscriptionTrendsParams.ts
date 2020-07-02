import { Filter, ReportSubType, ReportType } from '../constants/QueryParameters';

export default interface SubscriptionTrendsParams {
    frequency: Filter;
    reportSubType: ReportSubType;
    reportType: ReportType;
    vendorNumber: string;
    reportDate: string;
    version: string;
}

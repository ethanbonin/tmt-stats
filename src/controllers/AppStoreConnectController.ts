import JwtHelper from '../helpers/JwtHelper';
import config from '../config/config.json';
import * as fs from 'fs';
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import AppStoreConnectRoutes from '../constants/AppStoreConnectRoutes';
import { Filter, ReportSubType, ReportType } from '../constants/QueryParameters';
import SubscriptionTrendsParams from '../types/SubscriptionTrendsParams';
import zlib from 'zlib';
import SubscriptionEvent from '../types/SubscriptionEvent';
import Csv from '../middleware/csv';
import ReportDatesToQuery from '../types/ReportDatesToQuery';
import _ from 'lodash';
import CleanedSubscriptionEvent from '../types/CleanedSubscriptionEvent';

interface Body {
    'filter[frequency]': Filter;
    'filter[reportSubType]': ReportSubType;
    'filter[reportType]': ReportType;
    'filter[vendorNumber]': string;
    'filter[reportDate]': string;
    'filter[version]': string;
}

export class AppStoreConnectController {
    private _jwtHelper: JwtHelper;

    constructor() {
        const privateKey = fs.readFileSync('src/config/AuthKey_9KF7X462B3.p8', 'utf8');
        this._jwtHelper = new JwtHelper(privateKey, config.kid, config.iss);
    }

    zipFolderPath = (fileName: string): string => {
        return __dirname + `/../reports/zip/${fileName}`;
    };

    csvFolderPath = (fileName: string): string => {
        return __dirname + `/../reports/csv/${fileName}.csv`;
    };

    writeZipFile = async (response: AxiosResponse<any>, fileName: string): Promise<void> => {
        return new Promise<void>((resolve) => {
            const zipFile = fs.createWriteStream(this.zipFolderPath(fileName));
            response.data.pipe(zipFile);
            zipFile.on('finish', resolve);
        });
    };

    extractZip = async (fileName: string): Promise<void> => {
        return new Promise<void>((resolve) => {
            const gunzip = zlib.createGunzip();
            const readStream = fs.createReadStream(this.zipFolderPath(fileName));
            const writeStream = fs.createWriteStream(this.csvFolderPath(fileName));
            readStream.pipe(gunzip).pipe(writeStream);
            writeStream.on('finish', resolve);
        });
    };

    removeZipFile = async (fileName: string): Promise<void> => {
        return fs.unlinkSync(this.zipFolderPath(fileName));
    };

    processCsvToSubscriptionEvent = async (fileName: string): Promise<SubscriptionEvent[]> => {
        const csv = new Csv();
        const records = await csv.getCsvRecords<SubscriptionEvent>(this.csvFolderPath(fileName));
        return new Promise<SubscriptionEvent[]>((resolve) => {
            resolve(records);
        });
    };

    cleanSubscriptionEvents = async (subscriptionEvents: SubscriptionEvent[]): Promise<CleanedSubscriptionEvent[]> => {
        const cleanedSubscriptionEvents: CleanedSubscriptionEvent[] = [];

        // First create the scrubbed object
        for (const subscriptionEvent of subscriptionEvents) {
            const pickedObject = _.pick(subscriptionEvent, [
                'event_date',
                'event',
                'subscription_name',
                'subscription_offer_type',
                'subscription_offer_duration',
                'consecutive_paid_periods',
                'original_start_date',
                'device',
                'state',
                'country',
                'days_before_canceling',
                'days_canceled',
            ]);

            const cleanedSubscriptionEvent: CleanedSubscriptionEvent = {
                ...pickedObject,
                activated_from_trail: false,
            };
            cleanedSubscriptionEvents.push(cleanedSubscriptionEvent);
        }

        // Now remove everything that is not intro starting and paying subscriptions
        _.remove(cleanedSubscriptionEvents, function (n) {
            return n.event !== 'Start Introductory Offer' && n.event !== 'Paid Subscription from Introductory Offer';
        });

        // Sort by date
        _.sortBy(cleanedSubscriptionEvents, [(o) => o.event_date]);

        // Get the earliest Start Introductory Offer event
        let earliestIntroEvent: CleanedSubscriptionEvent;
        for (const b of cleanedSubscriptionEvents) {
            if (b.event === 'Start Introductory Offer') {
                earliestIntroEvent = b;
                break;
            }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (earliestIntroEvent === undefined) {
            throw 'No Subscription Events for period selected';
        }

        // Get the earliest possible date
        const earliestPossibleSubscriptionActivationDate = moment(earliestIntroEvent.event_date)
            .add(14, 'days')
            .toDate();

        // Now remove anything before 2 weeks of the earliest date
        _.remove(cleanedSubscriptionEvents, function (n) {
            return (
                moment(n.event_date).toDate() < earliestPossibleSubscriptionActivationDate &&
                n.event !== 'Start Introductory Offer'
            );
        });

        // Check the subscriptionEvent and look 2 weeks into the future.
        // If the event is 'Paid Subscription from Introductory Offer' && activated_trial==false,
        // then mark that event activated_trial is true and the future object true

        for (const i in cleanedSubscriptionEvents) {
            if (cleanedSubscriptionEvents[i].event === 'Start Introductory Offer') {
                const eventDate = moment(cleanedSubscriptionEvents[i].event_date).toDate();
                const twoWeeksForward = moment(cleanedSubscriptionEvents[i].event_date).add(14, 'days');

                let index = 0;
                const findEvent: CleanedSubscriptionEvent | undefined = _.find(cleanedSubscriptionEvents, (e, ind) => {
                    const found =
                        !e.activated_from_trail &&
                        moment(e.event_date).isSame(twoWeeksForward) &&
                        e.event === 'Paid Subscription from Introductory Offer';

                    if (found) {
                        index = ind;
                    }

                    return found;
                });

                if (findEvent) {
                    cleanedSubscriptionEvents[index].activated_from_trail = true;
                    cleanedSubscriptionEvents[i].activated_from_trail = true;
                }
            }
        }

        // Now Look into the future for each event and see if updates
        return new Promise<CleanedSubscriptionEvent[]>((resolve) => {
            resolve(cleanedSubscriptionEvents);
        });
    };

    createSummary = async (subscriptionEvents: CleanedSubscriptionEvent[]): Promise<void> => {
        return new Promise<void>((resolve) => {
            return resolve();
        });
    };

    readReportsToQuery = async (): Promise<ReportDatesToQuery[]> => {
        const csv = new Csv();
        const reportDatesToQuery = await csv.getCsvRecords<ReportDatesToQuery>(
            this.csvFolderPath('../reportsToQuery'),
            ',',
        );
        console.log(reportDatesToQuery);
        return new Promise<ReportDatesToQuery[]>((resolve) => {
            resolve(reportDatesToQuery);
        });
    };

    writeReportsToCvs = async (fileName: string, subscriptionEvents: CleanedSubscriptionEvent[]): Promise<void> => {
        const csv = new Csv();
        const response = csv.createCSVFile<CleanedSubscriptionEvent>(fileName, subscriptionEvents);

        return new Promise<void>((resolve) => {
            resolve();
        });
    };

    getSubscriptionTrendParams = (subscriptionTrendsParams: SubscriptionTrendsParams): Body => {
        return <Body>{
            'filter[frequency]': subscriptionTrendsParams.frequency,
            'filter[reportSubType]': subscriptionTrendsParams.reportSubType,
            'filter[reportType]': subscriptionTrendsParams.reportType,
            'filter[vendorNumber]': subscriptionTrendsParams.vendorNumber,
            'filter[reportDate]': subscriptionTrendsParams.reportDate,
            'filter[version]': subscriptionTrendsParams.version,
        };
    };

    enumerateDaysBetweenDates = function (startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = [];

        const currDate = moment(startDate).startOf('day');
        const lastDate = moment(endDate).startOf('day');

        // Add the first date
        dates.push(currDate.toDate());

        while (currDate.add(1, 'days').diff(lastDate) < 0) {
            dates.push(currDate.clone().toDate());
        }

        return dates;
    };

    getSubscriptionTrendsForDateRange = async (forDate: Date, toDate: Date): Promise<SubscriptionEvent[]> => {
        const dates = this.enumerateDaysBetweenDates(forDate, toDate);
        const allSubscriptionEventsForPeriod: SubscriptionEvent[] = [];

        for (const date of dates) {
            const subscriptionEvents = await this.getSubscriptionTrend(date);
            allSubscriptionEventsForPeriod.push(...subscriptionEvents);
        }

        return new Promise<SubscriptionEvent[]>((resolve) => {
            // console.log(allSubscriptionEventsForPeriod);
            return resolve(allSubscriptionEventsForPeriod);
        });
    };

    /**
     * @Descriptions:
     * This gets the subscription event for the date that is passed in, then it returns
     * back all the events for that date
     * */
    getSubscriptionTrend = async (forDate: Date): Promise<SubscriptionEvent[]> => {
        const formattedDate = moment(forDate).format('YYYY-MM-DD');
        const subscriptionTrendsParams: SubscriptionTrendsParams = {
            frequency: Filter.DAILY,
            reportSubType: ReportSubType.SUMMARY,
            reportType: ReportType.SUBSCRIPTION_EVENT,
            vendorNumber: `${config.vendorNumber}`,
            reportDate: formattedDate,
            version: '1_2',
        };
        const params = this.getSubscriptionTrendParams(subscriptionTrendsParams);
        const headers = {
            Authorization: `Bearer ${this._jwtHelper.getToken()}`,
            'Accept-Encoding': 'gzip',
        };

        const { endpoint, method } = AppStoreConnectRoutes.salesAndTrends();

        try {
            const response = await axios({
                method: method,
                headers: headers,
                url: AppStoreConnectRoutes.host + endpoint,
                params: params,
                responseType: 'stream',
            });
            const fileName = `report-${formattedDate}`;

            // Write the response to a zip file
            await this.writeZipFile(response, fileName);

            // Extract the contents of the zip file
            await this.extractZip(fileName);

            // Remove the zip file created
            await this.removeZipFile(fileName);

            return await this.processCsvToSubscriptionEvent(fileName);
        } catch (error) {
            console.log(error.message);
            console.log('Error with request on date:', forDate);
            return [];
        }
    };
}

export default AppStoreConnectController;

enum Filter {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

enum ReportSubType {
    SUMMARY = 'SUMMARY',
    DETAILED = 'DETAILED',
    OPT_IN = 'OPT_IN',
}

enum ReportType {
    SALES = 'SALES',
    PRE_ORDER = 'PRE_ORDER',
    NEWSSTAND = 'NEWSSTAND',
    SUBSCRIPTION = 'SUBSCRIPTION',
    SUBSCRIPTION_EVENT = 'SUBSCRIPTION_EVENT',
    SUBSCRIBER = 'SUBSCRIBER',
}

export { Filter, ReportSubType, ReportType };

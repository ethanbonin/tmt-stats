export default interface CleanedSubscriptionEvent {
    event_date: string;
    event: string;
    subscription_name: string;
    subscription_offer_type: string;
    subscription_offer_duration: string;
    consecutive_paid_periods: string;
    original_start_date: string;
    device: string;
    state: string;
    country: string;
    days_before_canceling: string;
    days_canceled: string;
    activated_from_trail: boolean;
}

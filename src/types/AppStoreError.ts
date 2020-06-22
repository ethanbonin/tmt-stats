export default interface AppStoreError {
    id: string;
    status: string;
    code: string;
    title: string;
    detail: string;
    source: [unknown];
}

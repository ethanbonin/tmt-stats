import JwtHelper from '../helpers/JwtHelper';
import config from '../config/config.json';
import * as fs from 'fs';

export class AppStoreConnectController {
    private _jwtHelper: JwtHelper;

    constructor() {
        const privateKey = fs.readFileSync('src/config/AuthKey_9KF7X462B3.p8', 'utf8');
        this._jwtHelper = new JwtHelper(privateKey, config.kid, config.iss);
    }

    // getSubscriptionTrends(forDate: Date) {}
}

export default AppStoreConnectController;

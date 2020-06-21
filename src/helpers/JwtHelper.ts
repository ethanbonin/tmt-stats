import JwtHeader from '../types/JwtHeader';
import JwtPayload from '../types/JwtPayload';

export default class JwtHelper {
    private _authKey: string;
    private _jwtHeader: JwtHeader;
    private _jwtPayload: JwtPayload;

    constructor(authKey: string, keyIdentifier: string, issuerId: string) {
        const expirationDate = JwtHelper.getFutureDate();
        this._authKey = authKey;
        this._jwtHeader = {
            alg: 'ES256',
            kid: keyIdentifier,
            typ: 'JWT',
        };
        this._jwtPayload = {
            aud: 'appstoreconnect-v1',
            exp: expirationDate,
            iss: issuerId,
        };
    }

    /** It only returns back a session that will expire in 2 minutes. The longest we can go is 20 */
    private static getFutureDate(): number {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 2);
        return date.getTime() / 1000;
    }
}

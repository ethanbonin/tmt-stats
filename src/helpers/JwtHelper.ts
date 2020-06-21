import JwtHeader from '../types/JwtHeader';
import JwtPayload from '../types/JwtPayload';
import jwt, { SignOptions } from 'jsonwebtoken';

export class JwtHelper {
    private _authKey: string;
    private readonly _jwtHeader: JwtHeader;
    private readonly _jwtPayload: JwtPayload;
    private token: string;

    constructor(authKey: string, keyIdentifier: string, issuerId: string) {
        this._authKey = authKey;
        this._jwtHeader = {
            alg: 'ES256',
            kid: keyIdentifier,
            typ: 'JWT',
        };
        this._jwtPayload = {
            aud: 'appstoreconnect-v1',
            exp: 0,
            iss: issuerId,
        };

        this.token = this.createToken();
    }

    /** It only returns back a session that will expire in 2 minutes. The longest we can go is 20 */
    private static getFutureDate(): number {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 2);
        return Math.round(date.getTime() / 1000);
    }

    private createToken(): string {
        this._jwtPayload.exp = JwtHelper.getFutureDate(); // Update the exp date;
        const signOptions: SignOptions = {
            algorithm: 'ES256',
            header: {
                alg: 'ES256',
                kid: this._jwtHeader.kid,
                typ: 'JWT',
            },
        };

        return jwt.sign(this._jwtPayload, this._authKey, signOptions);
    }

    private expirationExpired() {
        return new Date().getTime() / 1000 > this._jwtPayload.exp;
    }

    getToken(): string {
        // If the token has expired, go ahead and create a new one.
        if (this.expirationExpired()) {
            this.token = this.createToken();
        }
        return this.token;
    }
}

export default JwtHelper;

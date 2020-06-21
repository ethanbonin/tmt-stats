export default interface JWTPayload {
    iss: string;
    exp: number;
    aud: string;
}

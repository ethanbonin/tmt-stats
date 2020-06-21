import JwtHelper from './helpers/JwtHelper';
import config from './config/config.json';
import * as fs from 'fs';

const privateKey = fs.readFileSync('./config/AuthKey_9KF7X462B3.p8', 'utf8');

const jwtHeader = new JwtHelper(privateKey, config.kid, config.iss);

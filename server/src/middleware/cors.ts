import cors, { type CorsOptions } from 'cors';
import { env } from '../config/env.js';
import { isAllowedOrigin } from '../utils/corsConfig.js';

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin, env.clientOrigins)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
};

export const allowConfiguredCors = cors(corsOptions);

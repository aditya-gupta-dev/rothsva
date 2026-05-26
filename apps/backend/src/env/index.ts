import type { Result } from "@zapisi/utils";
import * as dotenv from 'dotenv';

const DEFAULT_ENV_PATH = '../../.env';

export type ConfigEnv = {
    frontend_url: string,
    database_url: string,
    database_token: string,
    jwt_secret: string
};

function readRequiredEnv(name: string): Result<string> {
    const value = process.env[name]?.trim();

    if (!value) {
        return {
            data: null,
            err: new Error(`Missing required environment variable: ${name}`),
        };
    }

    return {
        data: value,
        err: null,
    };
}

export function getEnvironmentVariables(loadFile: string = DEFAULT_ENV_PATH): Result<ConfigEnv> {

    dotenv.config({ path: loadFile });

    const frontendUrlResult = readRequiredEnv('FRONTEND_URL');
    if (frontendUrlResult.err) {
        return {
            data: null,
            err: frontendUrlResult.err,
        };
    }

    const databaseUrlResult = readRequiredEnv('DATABASE_URL');
    if (databaseUrlResult.err) {
        return {
            data: null,
            err: databaseUrlResult.err,
        };
    }

    const databaseTokenResult = readRequiredEnv('DATABASE_TOKEN');
    if (databaseTokenResult.err) {
        return {
            data: null,
            err: databaseTokenResult.err,
        };
    }

    const jwtSecretResult = readRequiredEnv('JWT_SECRET');
    if (jwtSecretResult.err) {
        return {
            data: null,
            err: jwtSecretResult.err,
        };
    }

    return {
        data: {
            database_token: databaseTokenResult.data,
            database_url: databaseUrlResult.data,
            frontend_url: frontendUrlResult.data,
            jwt_secret: jwtSecretResult.data,
        },
        err: null
    };
}

export function requireEnvironmentVariables(loadFile?: string): ConfigEnv {
    const result = getEnvironmentVariables(loadFile);

    if (result.err || !result.data) {
        throw result.err ?? new Error('Failed to load environment variables');
    }

    return result.data;
}

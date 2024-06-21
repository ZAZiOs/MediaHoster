// place files you want to import through the `$lib` alias in this folder.

import crypto from 'crypto';

export const token_secret_gen = () => {
    return crypto.randomBytes(10).toString('hex');
}
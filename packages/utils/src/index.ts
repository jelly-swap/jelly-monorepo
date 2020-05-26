import moment from 'moment';
import { unitOfTime } from 'moment';
import { sha256 } from './crypto';

export const filter = (f: any, o: any) => {
    return f
        ? Object.keys(f).some((k: any) => {
              if (f[k] instanceof Array) {
                  return f[k].some((v: any) => {
                      return o[k]?.toLowerCase() === v?.toLowerCase();
                  });
              } else {
                  return o[k]?.toLowerCase() === f[k]?.toLowerCase();
              }
          })
        : null;
};

export const filterSingle = (f: any, o: any) => {
    if (!f) {
        return null;
    }

    if (f instanceof Array) {
        return f.some((v: any) => {
            return o?.toLowerCase() === v?.toLowerCase();
        });
    } else {
        return o?.toLowerCase() === f?.toLowerCase();
    }
};

export const safeAccess = (object: any, path: string[]) => {
    return object
        ? path.reduce(
              (accumulator, currentValue) =>
                  accumulator && accumulator[currentValue] ? accumulator[currentValue] : null,
              object
          )
        : null;
};

export function getExpiration(time = 24, timeUnit = 'hours' as unitOfTime.DurationConstructor, unix = true) {
    const expiration = moment(moment.now()).add(time, timeUnit).valueOf();

    if (unix) {
        return Math.floor(expiration / 1000);
    }

    return expiration;
}

export const generateHashLock = (secret: string, prefix = true) => {
    const secretHash = sha256(secret);
    const hashLock = sha256(secretHash).toString('hex');
    return prefix ? '0x' + hashLock : hashLock;
};

export const fixHash = (hash: string, prefix = true) => {
    let match = hash.match(/^(0x)?[0-9a-fA-F]*$/);

    if (!match) {
        throw Error('INVALID_HASH_FORMAT');
    }

    if (!prefix && match[1] === '0x') {
        return hash.slice(2, hash.length);
    }

    if (prefix && match[1] !== '0x') {
        return '0x' + hash;
    }

    return hash;
};

export { sha256 } from './crypto';

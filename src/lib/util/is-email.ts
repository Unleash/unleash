// Email address matcher.
// eslint-disable-next-line no-useless-escape
const matcher = /.[^\n\r@\u2028\u2029]*@.+\..+/;

/**
 * Loosely validate an email address.
 *
 * @param {string} string
 * @return {boolean}
 */
function isEmail(value: string): boolean {
    return matcher.test(value);
}

/*
 * Exports.
 */

export default isEmail;

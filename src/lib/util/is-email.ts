// Email address matcher.
// eslint-disable-next-line no-useless-escape
const matcher =
    /[A-Z0-9.!#$%&'*+-/=?^_{|}~]+@[A-Z0-9][A-Z0-9.!#$%&'*+-/=?^_{|}~]*\.[A-Z]{2,}$/i;

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

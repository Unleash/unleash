export const rewriteHTML = (
    input: string,
    rewriteValue: string,
    cdnPrefix?: string,
    uiFlags?: string,
    cspNonce?: string,
): string => {
    let result = input;
    result = result.replace(/::baseUriPath::/gi, rewriteValue);
    result = result.replace(/::cdnPrefix::/gi, cdnPrefix || '');

    const faviconPrefix = cdnPrefix ? 'https://cdn.getunleash.io' : '';
    result = result.replace(/::faviconPrefix::/gi, faviconPrefix);

    result = result.replace(/::uiFlags::/gi, uiFlags || '{}');

    result = result.replace(
        /\/static/gi,
        `${cdnPrefix || rewriteValue}/static`,
    );

    if (cspNonce) {
        result = result.replace(/::cspNonce::/gi, cspNonce);
    } else {
        result = result.replace(
            '<meta name="cspNonce" content="::cspNonce::" />',
            '',
        );
    }

    return result;
};

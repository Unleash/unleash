export const rewriteHTML = (
    input: string,
    rewriteValue: string,
    cdnPrefix?: string,
    uiFlags?: string,
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

    return result;
};

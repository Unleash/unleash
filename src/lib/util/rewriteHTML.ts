export const rewriteHTML = (
    input: string,
    rewriteValue: string,
    cdnPrefix?: string,
    uiFlags?: string,
    unleashToken?: string,
): string => {
    // Rewrite asset paths before injecting configuration that may contain /static.
    let result = input.replace(
        /\/static/gi,
        `${cdnPrefix || rewriteValue}/static`,
    );
    result = result.replace(/::baseUriPath::/gi, rewriteValue);
    result = result.replace(/::cdnPrefix::/gi, cdnPrefix || '');

    const faviconPrefix = cdnPrefix ? cdnPrefix : '';
    result = result.replace(/::faviconPrefix::/gi, faviconPrefix);

    result = result.replace(/::uiFlags::/gi, uiFlags || '{}');

    result = result.replace(/::unleashToken::/gi, unleashToken || '');

    return result;
};

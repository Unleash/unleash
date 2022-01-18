export const rewriteHTML = (
    input: string,
    rewriteValue: string,
    cdnPrefix?: string,
): string => {
    let result = input;
    result = result.replace(/::baseUriPath::/gi, rewriteValue);
    result = result.replace(/::cdnPrefix::/gi, cdnPrefix || '');
    result = result.replace(
        /\/static/gi,
        `${cdnPrefix || rewriteValue}/static`,
    );

    return result;
};

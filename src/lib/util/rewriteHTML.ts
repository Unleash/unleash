export const rewriteHTML = (input: string, rewriteValue: string): string => {
    let result = input;
    result = result.replace(/::baseUriPath::/gi, rewriteValue);
    result = result.replace(/\/static/gi, `${rewriteValue}/static`);

    return result;
};

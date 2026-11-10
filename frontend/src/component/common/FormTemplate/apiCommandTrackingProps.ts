// Matches only the request line: the body can carry customer data.
const REQUEST_LINE = /--request (\w+) '([^'\s]+)'/;

const endpointOf = (url: string) => {
    const apiRoot = url.indexOf('/api/');

    return apiRoot === -1 ? undefined : url.slice(apiRoot).split('?')[0];
};

export const apiCommandTrackingProps = (command: string) => {
    const requestLine = command.match(REQUEST_LINE);

    if (!requestLine) {
        return {};
    }

    const [, method, url] = requestLine;

    return { method, endpoint: endpointOf(url) };
};

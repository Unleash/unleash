import { Request } from 'express';

export function nextLink(
    req: Pick<Request, 'baseUrl' | 'path' | 'query'>,
    cursor?: string,
): string {
    if (!cursor) {
        return '';
    }

    const url = `${req.baseUrl}${req.path}?`;

    const params = new URLSearchParams(req.query as Record<string, string>);

    params.set('cursor', cursor);

    return `${url}${params.toString()}`;
}

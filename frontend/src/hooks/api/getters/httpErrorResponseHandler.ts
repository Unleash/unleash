import { ResponseError } from 'utils/apiUtils';

const handleErrorResponses = (target: string) => async (res: Response) => {
    if (!res.ok) {
        throw new ResponseError(
            target,
            res.status,
            await parseErrorResponse(res)
        );
    }

    return res;
};

const parseErrorResponse = async (res: Response): Promise<unknown> => {
    try {
        return await res.json();
    } catch {
        return res.statusText;
    }
};

export default handleErrorResponses;

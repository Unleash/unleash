const handleErrorResponses = (target: string) => async (res: Response) => {
    if (!res.ok) {
        const error = new Error(
            `An error occurred while trying to get ${target}`
        );
        // Try to resolve body, but don't rethrow res.json is not a function
        try {
            // @ts-expect-error
            error.info = await res.json();
        } catch (e) {
            // @ts-expect-error
            error.info = {};
        }
        // @ts-expect-error
        error.status = res.status;
        // @ts-expect-error
        error.statusText = res.statusText;
        throw error;
    }

    return res;
};

export default handleErrorResponses;

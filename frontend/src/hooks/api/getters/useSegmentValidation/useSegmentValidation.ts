import { useEffect, useState } from 'react';
import { formatApiPath } from 'utils/formatPath';

export const useSegmentValidation = (
    name: string,
    initialName: string
): string | undefined => {
    const [error, setError] = useState<string>();
    const nameHasChanged = name !== initialName;

    useEffect(() => {
        setError(undefined);
        if (name && nameHasChanged) {
            fetchNewNameValidation(name)
                .then(parseValidationResponse)
                .then(setError)
                .catch(() => setError(undefined));
        }
    }, [name, nameHasChanged]);

    return error;
};

const fetchNewNameValidation = (name: string): Promise<Response> =>
    fetch(formatApiPath('api/admin/segments/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });

const parseValidationResponse = async (
    res: Response
): Promise<string | undefined> => {
    if (res.ok) {
        return;
    }

    const json = await res.json();
    return json.details[0].message;
};

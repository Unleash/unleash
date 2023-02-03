import { createRef, useLayoutEffect } from 'react';

type refElement = HTMLDivElement;

const useLoading = (loading: boolean, label = 'true') => {
    const ref = createRef<refElement>();
    useLayoutEffect(() => {
        if (ref.current) {
            const elements = ref.current.querySelectorAll(
                `[data-loading=${label === 'true' ? 'true' : `'${label}'`}]`
            );

            elements.forEach(element => {
                if (loading) {
                    element.classList.add('skeleton');
                } else {
                    element.classList.remove('skeleton');
                }
            });
        }
    }, [loading, ref]);

    return ref;
};

export default useLoading;

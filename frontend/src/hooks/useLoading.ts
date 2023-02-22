import { createRef, useLayoutEffect } from 'react';

type refElement = HTMLDivElement;

const useLoading = (loading: boolean, selector = '[data-loading=true]') => {
    const ref = createRef<refElement>();
    useLayoutEffect(() => {
        if (ref.current) {
            const elements = ref.current.querySelectorAll(selector);

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

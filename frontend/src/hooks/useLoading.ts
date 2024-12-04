import { createRef, useLayoutEffect } from 'react';

const useLoading = <T extends HTMLElement = HTMLDivElement>(
    loading: boolean,
    selector = '[data-loading=true]',
) => {
    const ref = createRef<T>();
    useLayoutEffect(() => {
        if (ref.current) {
            const elements = ref.current.querySelectorAll(selector);

            elements.forEach((element) => {
                if (loading) {
                    element.classList.add('skeleton');
                } else {
                    setTimeout(() => element.classList.remove('skeleton'), 10);
                }
            });
        }
    }, [loading, selector, ref]);

    return ref;
};

export default useLoading;

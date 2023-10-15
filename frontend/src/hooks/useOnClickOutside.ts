import { useEffect } from 'react';

/**
 * Hook to handle outside clicks for a given list of refs.
 *
 * @param {Array<React.RefObject>} refs - List of refs to the target elements.
 * @param {Function} callback - Callback to execute on outside click.
 */
export const useOnClickOutside = (
    refs: Array<React.RefObject<HTMLElement>>,
    callback: Function,
) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if event target is outside all provided refs
            if (
                !refs.some((ref) => ref.current?.contains(event.target as Node))
            ) {
                callback();
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [refs, callback]);
};

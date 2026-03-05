import { useLocalStorageState } from 'hooks/useLocalStorageState';

export const useRegexSdkRequirements = () => {
    const [state, setState] = useLocalStorageState<'open' | 'closed'>(
        'regexSdkVersionAlert',
        'open',
    );
    return {
        open: state === 'open',
        onClose: () => setState('closed'),
        onOpen: () => setState('open'),
    };
};

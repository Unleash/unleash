import { createLocalStorage } from 'utils/createLocalStorage';

interface IGlobalStore {
    favorites?: boolean;
}

export const useGlobalLocalStorage = () => {
    const { value, setValue } = createLocalStorage<IGlobalStore>(
        'global:v1',
        {}
    );

    return {
        value,
        setValue,
    };
};

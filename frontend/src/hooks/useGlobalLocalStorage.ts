import { createLocalStorage } from 'utils/createLocalStorage';

interface IGlobalStore {
    favorites?: boolean;
    hiddenEnvironments?: Array<string>;
}

export const useGlobalLocalStorage = () => {
    const { value, setValue } = createLocalStorage<IGlobalStore>(
        'global:v1',
        {},
    );

    // fix incorrect values introduced by a bug
    const parsedValue = {
        ...value,
        hiddenEnvironments: Array.from(value.hiddenEnvironments || []),
    };

    return {
        value: parsedValue,
        setValue,
    };
};

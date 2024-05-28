import { useLocalStorageState } from 'hooks/useLocalStorageState';
import { unique } from 'utils/unique';

export const useExpanded = <T extends string>() => {
    const [expanded, setExpanded] = useLocalStorageState<Array<T>>(
        'navigation-expanded:v1',
        [],
    );

    const changeExpanded = (key: T, expand: boolean) => {
        if (expand) {
            setExpanded(unique([...expanded, key]));
        } else {
            setExpanded(expanded.filter((name) => name !== key));
        }
    };

    return [expanded, changeExpanded] as const;
};

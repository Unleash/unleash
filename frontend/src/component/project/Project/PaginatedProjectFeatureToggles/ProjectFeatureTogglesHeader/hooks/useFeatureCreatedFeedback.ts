import { useCallback, useContext } from 'react';
import UIContext from 'contexts/UIContext';
import { createLocalStorage } from 'utils/createLocalStorage';

export const useFeatureCreatedFeedback = () => {
    const { setShowFeedback } = useContext(UIContext);

    return useCallback(() => {
        const { value, setValue } = createLocalStorage<string>(
            'flagsCreated',
            '0',
        );
        const flagsCount = Number.parseInt(value, 10) + 1;

        setValue(`${flagsCount}`);

        if (flagsCount > 1) {
            setShowFeedback(true);
        }
    }, [setShowFeedback]);
};

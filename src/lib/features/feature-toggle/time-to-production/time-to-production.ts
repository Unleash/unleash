import { differenceInDays } from 'date-fns';
import { ICreateEnabledDates } from '../../../types/stores/project-stats-store-type';

const calculateTimeToProdForFeatures = (
    items: ICreateEnabledDates[],
): number[] =>
    items.map((item) => differenceInDays(item.enabled, item.created));

export const calculateAverageTimeToProd = (
    items: ICreateEnabledDates[],
): number => {
    const timeToProdPerFeature = calculateTimeToProdForFeatures(items);
    if (timeToProdPerFeature.length) {
        const sum = timeToProdPerFeature.reduce((acc, curr) => acc + curr, 0);

        return Number((sum / Object.keys(items).length).toFixed(1));
    }

    return 0;
};

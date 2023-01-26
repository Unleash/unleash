import TimezoneCountries from 'countries-and-timezones';
import { useCallback } from 'react';
import { ISelectOption } from '../component/common/GeneralSelect/GeneralSelect';

export interface ITimezoneSelect extends ISelectOption {
    utcOffset: string;
}
export const useGetTimezones = () => {
    const getAllTimezones = useCallback(() => {
        return Object.values(
            TimezoneCountries.getAllTimezones({ deprecated: false })
        ).map(timezone => ({
            key: timezone.name,
            label: `${timezone.name}`,
            utcOffset: timezone.utcOffsetStr,
        }));
    }, []);

    return {
        getAllTimezones,
    };
};

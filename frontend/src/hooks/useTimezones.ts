import TimezoneCountries from 'countries-and-timezones';
import { useEffect, useState } from 'react';
import { ISelectOption } from '../component/common/GeneralSelect/GeneralSelect';

export const useTimezones = (): ISelectOption[] => {
    const [timezones, setTimezones] = useState<ISelectOption[]>([]);

    const getAllTimezones = () => {
        return Object.values(
            TimezoneCountries.getAllTimezones({ deprecated: false })
        ).map(list => ({
            key: list.name,
            label: `${list.name}`,
        }));
    };

    useEffect(() => {
        setTimezones(getAllTimezones());
    }, []);

    return timezones;
};

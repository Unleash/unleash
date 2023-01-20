import TimezoneCountries from 'countries-and-timezones';
import { useEffect, useState } from 'react';
import { ISelectOption } from '../component/common/GeneralSelect/GeneralSelect';

export interface ITimezoneSelect extends ISelectOption {
    utcOffset: string;
}
export const useTimezones = (): ITimezoneSelect[] => {
    const [timezones, setTimezones] = useState<ITimezoneSelect[]>([]);

    const getAllTimezones = () => {
        return Object.values(
            TimezoneCountries.getAllTimezones({ deprecated: false })
        ).map(list => ({
            key: list.name,
            label: `${list.name}`,
            utcOffset: list.utcOffsetStr,
        }));
    };

    useEffect(() => {
        setTimezones(getAllTimezones());
    }, []);

    return timezones;
};

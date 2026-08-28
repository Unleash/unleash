import type { FC } from 'react';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import GeneralSelect, {
    type ISelectOption,
} from 'component/common/GeneralSelect/GeneralSelect';

export type TimeRange = 'hour' | 'day' | 'week' | 'month';

export type RangeSelectorProps = {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
    label?: string;
    options: ISelectOption[];
};

export const RangeSelector: FC<RangeSelectorProps> = ({
    value,
    onChange,
    label = 'Time',
    options,
}) => (
    <GeneralSelect<TimeRange>
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        IconComponent={ArrowDropDown}
    />
);

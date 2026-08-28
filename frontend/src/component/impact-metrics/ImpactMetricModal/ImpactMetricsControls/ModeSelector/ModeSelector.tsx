import type { FC } from 'react';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import GeneralSelect, {
    type ISelectOption,
} from 'component/common/GeneralSelect/GeneralSelect';
import type { AggregationMode } from '../../../types.ts';

export type ModeSelectorProps = {
    value: AggregationMode;
    onChange: (mode: AggregationMode) => void;
    metricType: 'counter' | 'gauge' | 'histogram' | 'unknown';
    label?: string;
};

const counterOptions: ISelectOption[] = [
    { key: 'rps', label: 'Rate per second' },
    { key: 'count', label: 'Count' },
];

const gaugeOptions: ISelectOption[] = [
    { key: 'avg', label: 'Average' },
    { key: 'sum', label: 'Sum' },
];

const histogramOptions: ISelectOption[] = [
    { key: 'p50', label: '50th percentile' },
    { key: 'p95', label: '95th percentile' },
    { key: 'p99', label: '99th percentile' },
];

const optionsByType: Record<string, ISelectOption[]> = {
    counter: counterOptions,
    gauge: gaugeOptions,
    histogram: histogramOptions,
    unknown: [...counterOptions, ...gaugeOptions, ...histogramOptions],
};

export const ModeSelector: FC<ModeSelectorProps> = ({
    value,
    onChange,
    metricType,
    label = 'Aggregation Mode',
}) => {
    const options = optionsByType[metricType] ?? optionsByType.unknown;

    return (
        <GeneralSelect<AggregationMode>
            label={label}
            value={value}
            options={options}
            onChange={onChange}
            IconComponent={ArrowDropDown}
        />
    );
};

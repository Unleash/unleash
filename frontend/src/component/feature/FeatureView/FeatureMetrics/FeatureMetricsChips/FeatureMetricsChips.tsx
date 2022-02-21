import { Chip } from '@material-ui/core';
import { useMemo } from 'react';
import { useStyles } from './FeatureMetricsChips.styles';

interface IFeatureMetricsChipsProps {
    title: string;
    values: Set<string>;
    value?: string;
    setValue: (value: string) => void;
}

export const FeatureMetricsChips = ({
    title,
    values,
    value,
    setValue,
}: IFeatureMetricsChipsProps) => {
    const styles = useStyles();

    const onClick = (value: string) => () => {
        if (values.has(value)) {
            setValue(value);
        }
    };

    const sortedValues = useMemo(() => {
        return Array.from(values).sort((valueA, valueB) => {
            return valueA.localeCompare(valueB);
        });
    }, [values]);

    return (
        <div>
            <h3 className={styles.title}>{title}</h3>
            <ul className={styles.list}>
                {sortedValues.map(val => (
                    <li key={val} className={styles.item}>
                        <Chip
                            label={val}
                            onClick={onClick(val)}
                            aria-pressed={val === value}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

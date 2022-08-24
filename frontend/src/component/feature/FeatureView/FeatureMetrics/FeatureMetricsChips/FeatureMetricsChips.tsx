import { Chip } from '@mui/material';
import { useMemo } from 'react';
import { useStyles } from './FeatureMetricsChips.styles';
import { useThemeStyles } from 'themes/themeStyles';

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
    const { classes: themeStyles } = useThemeStyles();
    const { classes: styles } = useStyles();

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
            <h2 className={styles.title}>{title}</h2>
            <ul className={styles.list}>
                {sortedValues.map(val => (
                    <li key={val} className={styles.item}>
                        <Chip
                            label={val}
                            onClick={onClick(val)}
                            aria-pressed={val === value}
                            className={themeStyles.focusable}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

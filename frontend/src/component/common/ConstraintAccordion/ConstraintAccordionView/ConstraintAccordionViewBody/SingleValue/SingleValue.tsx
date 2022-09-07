import { Chip } from '@mui/material';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { useStyles } from '../ConstraintAccordionViewBody.style';

interface ISingleValueProps {
    value: string | undefined;
    operator: string;
}

export const SingleValue = ({ value, operator }: ISingleValueProps) => {
    const { classes: styles } = useStyles();
    if (!value) return null;

    return (
        <div className={styles.singleValueView}>
            <p className={styles.singleValueText}>Value must be {operator}</p>{' '}
            <Chip
                label={
                    <StringTruncator
                        maxWidth="400"
                        text={value}
                        maxLength={50}
                    />
                }
                className={styles.chip}
            />
        </div>
    );
};

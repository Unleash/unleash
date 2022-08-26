import { Chip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './ConstraintItem.styles';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';

interface IConstraintItemProps {
    value: string[];
    text: string;
}

export const ConstraintItem = ({ value, text }: IConstraintItemProps) => {
    const { classes: styles } = useStyles();
    return (
        <div className={styles.container}>
            <ConditionallyRender
                condition={value.length === 0}
                show={<p>No {text}s added yet.</p>}
                elseShow={
                    <div>
                        <p className={styles.paragraph}>
                            {value.length}{' '}
                            {value.length > 1 ? `${text}s` : text} will get
                            access.
                        </p>
                        {value.map((v: string) => (
                            <Chip
                                key={v}
                                label={
                                    <StringTruncator
                                        maxWidth="300"
                                        text={v}
                                        maxLength={50}
                                    />
                                }
                                className={styles.chip}
                            />
                        ))}
                    </div>
                }
            />
        </div>
    );
};

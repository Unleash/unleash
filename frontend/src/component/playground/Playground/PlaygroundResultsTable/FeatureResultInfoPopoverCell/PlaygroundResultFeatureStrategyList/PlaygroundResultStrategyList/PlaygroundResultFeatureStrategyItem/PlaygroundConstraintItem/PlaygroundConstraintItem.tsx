import { Chip, Typography, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './PlaygroundConstraintItem.styles';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { CancelOutlined } from '@mui/icons-material';

interface IConstraintItemProps {
    value: string[];
    text: string;
    input?: string | number | boolean | 'no value';
    showReason?: boolean;
}

export const PlaygroundConstraintItem = ({
    value,
    text,
    input,
    showReason = false,
}: IConstraintItemProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

    const color = input === 'no value' ? 'error' : 'neutral';
    const reason = `value does not match any ${text}`;

    console.log(value, text, input, showReason);

    return (
        <div className={styles.container}>
            <Typography variant="subtitle1" color={theme.palette[color].main}>
                {input}
            </Typography>
            <div className={styles.column}>
                <ConditionallyRender
                    condition={Boolean(showReason)}
                    show={
                        <Typography
                            variant="subtitle1"
                            color={theme.palette.error.main}
                        >
                            {reason}
                        </Typography>
                    }
                />
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
            <ConditionallyRender
                condition={Boolean(showReason)}
                show={<CancelOutlined color={'error'} />}
            />
        </div>
    );
};

import { Chip, Typography, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useStyles } from './PlaygroundParametertem.styles';
import StringTruncator from 'component/common/StringTruncator/StringTruncator';
import { CancelOutlined } from '@mui/icons-material';
import classnames from 'classnames';

interface IConstraintItemProps {
    value: Array<string | number>;
    text: string;
    input?: string | number | boolean | 'no value';
    showReason?: boolean;
}

export const PlaygroundParameterItem = ({
    value,
    text,
    input,
    showReason = false,
}: IConstraintItemProps) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

    const color = input === 'no value' ? 'error' : 'neutral';
    const reason = `value does not match any ${text}`;

    return (
        <div
            className={classnames(
                styles.container,
                showReason ? styles.disabled : ''
            )}
        >
            <Typography variant="subtitle1" color={theme.palette[color].main}>
                {`${input}`}
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
                            {value.map((v: string | number) => (
                                <Chip
                                    key={v}
                                    label={
                                        <StringTruncator
                                            maxWidth="300"
                                            text={v.toString()}
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
                elseShow={<div />}
            />
        </div>
    );
};

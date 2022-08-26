import { Typography } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import classnames from 'classnames';
import CheckIcon from '@mui/icons-material/Check';

import { useStyles } from './PasswordMatcher.styles';

interface IPasswordMatcherProps {
    started: boolean;
    matchingPasswords: boolean;
}

const PasswordMatcher = ({
    started,
    matchingPasswords,
}: IPasswordMatcherProps) => {
    const { classes: styles } = useStyles();
    return (
        <div className={styles.matcherContainer}>
            <ConditionallyRender
                condition={started}
                show={
                    <ConditionallyRender
                        condition={matchingPasswords}
                        show={
                            <Typography
                                variant="body2"
                                data-loading
                                className={classnames(styles.matcher, {
                                    [styles.matcherSuccess]: matchingPasswords,
                                })}
                            >
                                <CheckIcon className={styles.matcherIcon} />{' '}
                                Passwords match
                            </Typography>
                        }
                        elseShow={
                            <Typography
                                variant="body2"
                                data-loading
                                className={classnames(styles.matcher, {
                                    [styles.matcherError]: !matchingPasswords,
                                })}
                            >
                                Passwords do not match
                            </Typography>
                        }
                    />
                }
            />
        </div>
    );
};

export default PasswordMatcher;

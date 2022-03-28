import { Typography } from '@material-ui/core';
import ConditionallyRender from 'component/common/ConditionallyRender';
import classnames from 'classnames';
import CheckIcon from '@material-ui/icons/Check';

import { useStyles } from './PasswordMatcher.styles';

interface IPasswordMatcherProps {
    started: boolean;
    matchingPasswords: boolean;
}

const PasswordMatcher = ({
    started,
    matchingPasswords,
}: IPasswordMatcherProps) => {
    const styles = useStyles();
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

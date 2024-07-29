import type { FC } from 'react';
import KeyIcon from '@mui/icons-material/Key';
import WarningIcon from '@mui/icons-material/WarningAmber';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import { Link } from '@mui/material';

interface IApiTokenIconProps {
    project?: string;
    projects?: string | string[];
    secret?: string;
}

export const ApiTokenIcon: FC<IApiTokenIconProps> = ({ secret }) => {
    const tokenFormat = secret?.includes(':') ? 'v2' : 'v1'; // see https://docs.getunleash.io/reference/api-tokens-and-client-keys#format
    const isWildcardToken = secret?.startsWith('*:');
    const isOrphanedToken = tokenFormat === 'v2' && !isWildcardToken;

    if (isOrphanedToken) {
        return (
            <IconCell
                icon={
                    <HtmlTooltip
                        title={
                            <div>
                                <p>
                                    This is an orphaned token. All of its
                                    original projects have been deleted and it
                                    now has access to all current and future
                                    projects. You should stop using this token
                                    and delete it. Learn more in{' '}
                                    <Link
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        href='https://docs.getunleash.io/advanced/impression_data'
                                    >
                                        release notes.
                                    </Link>
                                </p>
                            </div>
                        }
                        placement='bottom-start'
                        arrow
                    >
                        {/* <ErrorIcon aria-label='Orphaned token' color='error' /> */}
                        <WarningIcon
                            aria-label='Orphaned token'
                            color='warning'
                        />
                    </HtmlTooltip>
                }
            />
        );
    }

    return <IconCell icon={<KeyIcon color='disabled' />} />;
};

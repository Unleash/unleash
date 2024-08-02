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
                            <p>
                                This is an orphaned token. All of its original
                                projects have been deleted and it now has access
                                to all current and future projects. You should
                                stop using this token and delete it. Read more
                                in{' '}
                                <Link
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='https://github.com/Unleash/unleash/releases/tag/v6.1.0'
                                >
                                    release notes
                                </Link>
                                .
                            </p>
                        }
                        placement='bottom-start'
                        arrow
                    >
                        <WarningIcon
                            aria-label='Orphaned token'
                            color='warning'
                            data-testid='orphaned-token-icon'
                        />
                    </HtmlTooltip>
                }
            />
        );
    }

    return <IconCell icon={<KeyIcon color='disabled' />} />;
};

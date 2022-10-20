import { VFC } from 'react';
import { Box } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';
import { UserAvatar } from 'component/common/UserAvatar/UserAvatar';

interface IChangesHeaderProps {
    author?: string;
    avatar?: string;
    createdAt?: string;
}

export const ChangesHeader: VFC<IChangesHeaderProps> = ({
    author,
    avatar,
    createdAt,
}) => {
    const { locationSettings } = useLocationSettings();
    return (
        <Box>
            <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                data-loading
            >
                <div>Suggestion by </div>
                <div>
                    <UserAvatar src={avatar} />
                </div>
                <div>{author}</div>
                <div>
                    Submitted at:{' '}
                    {formatDateYMDHMS(createdAt || 0, locationSettings.locale)}
                </div>
            </Box>
        </Box>
    );
};

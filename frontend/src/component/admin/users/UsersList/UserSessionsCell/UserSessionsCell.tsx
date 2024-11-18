import type { FC } from 'react';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import WarningIcon from '@mui/icons-material/WarningAmber';
import { Tooltip } from '@mui/material';

type UserSessionsCellProps = {
    count?: number;
};

export const UserSessionsCell: FC<UserSessionsCellProps> = ({ count }) => {
    if (!count || count < 5) {
        return null;
    }

    return (
        <IconCell
            icon={
                <>
                    <Tooltip
                        title={`Multiple parallel browser sessions (${count})`}
                    >
                        <WarningIcon
                            aria-label='Multiple parallel browser sessions'
                            color='warning'
                        />
                    </Tooltip>
                </>
            }
        />
    );
};

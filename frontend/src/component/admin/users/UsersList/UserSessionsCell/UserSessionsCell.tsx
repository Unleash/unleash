import type { FC } from 'react';
import { IconCell } from 'component/common/Table/cells/IconCell/IconCell';
import WarningIcon from '@mui/icons-material/WarningAmber';
import { Tooltip } from '@mui/material';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useVariant } from 'hooks/useVariant';

type UserSessionsCellProps = {
    count?: number;
};

export const UserSessionsCell: FC<UserSessionsCellProps> = ({ count }) => {
    const { uiConfig } = useUiConfig();
    const minimumCountToShow = useVariant<number>(
        uiConfig.flags.showUserDeviceCount,
    );

    if (!count || count < (minimumCountToShow ? minimumCountToShow : 5)) {
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

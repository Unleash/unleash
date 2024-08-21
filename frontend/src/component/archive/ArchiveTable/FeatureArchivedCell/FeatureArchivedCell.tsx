import type { FC } from 'react';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { Tooltip, Typography, useTheme } from '@mui/material';
import { formatDateYMD } from 'utils/formatDate';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useLocationSettings } from 'hooks/useLocationSettings';

interface IFeatureArchivedCellProps {
    value?: string | Date | null;
}

export const FeatureArchivedCell: FC<IFeatureArchivedCellProps> = ({
    value: archivedAt,
}) => {
    const { locationSettings } = useLocationSettings();
    const theme = useTheme();

    if (!archivedAt)
        return (
            <TextCell>
                <Typography
                    variant='body2'
                    color={theme.palette.text.secondary}
                >
                    not available
                </Typography>
            </TextCell>
        );

    return (
        <TextCell>
            <Tooltip
                title={`Archived on: ${formatDateYMD(
                    archivedAt,
                    locationSettings.locale,
                )}`}
                arrow
            >
                <Typography noWrap variant='body2' data-loading>
                    <TimeAgo date={new Date(archivedAt)} refresh={false} />
                </Typography>
            </Tooltip>
        </TextCell>
    );
};

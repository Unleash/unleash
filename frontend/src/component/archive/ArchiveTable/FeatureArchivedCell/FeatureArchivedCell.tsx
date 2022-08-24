import { VFC } from 'react';
import TimeAgo from 'react-timeago';
import { Tooltip, Typography, useTheme } from '@mui/material';
import { formatDateYMD } from 'utils/formatDate';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { useLocationSettings } from 'hooks/useLocationSettings';

interface IFeatureArchivedCellProps {
    value?: string | Date | null;
}

export const FeatureArchivedCell: VFC<IFeatureArchivedCellProps> = ({
    value: archivedAt,
}) => {
    const { locationSettings } = useLocationSettings();
    const theme = useTheme();

    if (!archivedAt)
        return (
            <TextCell>
                <Typography
                    variant="body2"
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
                    locationSettings.locale
                )}`}
                arrow
            >
                <Typography noWrap variant="body2" data-loading>
                    <TimeAgo
                        date={new Date(archivedAt)}
                        title=""
                        live={false}
                    />
                </Typography>
            </Tooltip>
        </TextCell>
    );
};

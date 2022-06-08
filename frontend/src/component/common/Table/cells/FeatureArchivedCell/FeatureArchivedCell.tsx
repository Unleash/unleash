import React, {VFC} from 'react';
import TimeAgo from 'react-timeago';
import {Tooltip, Typography} from '@mui/material';
import {formatDateYMD} from '../../../../../utils/formatDate';
import {TextCell} from '../TextCell/TextCell';
import {useLocationSettings} from "../../../../../hooks/useLocationSettings";

interface IFeatureArchivedCellProps {
    value?: string | Date | null;
}

export const FeatureArchivedCell: VFC<IFeatureArchivedCellProps> = ({
    value: archivedAt,
}) => {
    const { locationSettings } = useLocationSettings();

    if (!archivedAt) return <TextCell />;

    return (
        <TextCell>
            {archivedAt && (
                <Tooltip
                    title={`Archived on: ${formatDateYMD(archivedAt, locationSettings.locale)}`}
                    arrow
                >
                    <Typography noWrap variant="body2" data-loading>
                        <TimeAgo date={new Date(archivedAt)} title={''} />
                    </Typography>
                </Tooltip>
            )}
        </TextCell>
    );
};

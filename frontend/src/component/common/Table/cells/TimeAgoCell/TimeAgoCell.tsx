import { Tooltip, Typography } from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import type { FC, ReactNode } from 'react';
import { formatDateYMD } from 'utils/formatDate';
import { TextCell } from '../TextCell/TextCell.tsx';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';

type ColumnLike = {
    Header?: string;
    columnDef?: { header?: unknown };
};

export interface ITimeAgoCellProps {
    value?: string | number | Date | null;
    getValue?: () => unknown;
    column?: ColumnLike;
    live?: boolean;
    emptyText?: string;
    title?: (date?: string) => ReactNode;
    dateFormat?: (value: string | number | Date, locale: string) => string;
}

const headerText = (column?: ColumnLike): string | undefined => {
    if (typeof column?.Header === 'string') {
        return column.Header;
    }
    const header = column?.columnDef?.header;
    if (typeof header === 'string') {
        return header;
    }
    return undefined;
};

export const TimeAgoCell: FC<ITimeAgoCellProps> = ({
    value,
    getValue,
    column,
    live = false,
    emptyText = 'Never',
    title,
    dateFormat = formatDateYMD,
}) => {
    const { locationSettings } = useLocationSettings();
    const raw = value ?? getValue?.();
    const input =
        raw == null
            ? null
            : raw instanceof Date ||
                typeof raw === 'string' ||
                typeof raw === 'number'
              ? raw
              : null;

    const header = headerText(column);
    const defaultTitle = (date?: string) =>
        date ? (header ? `${header}: ${date}` : date) : '';
    const titleFn = title ?? defaultTitle;

    const tooltip = input
        ? titleFn(dateFormat(input, locationSettings.locale))
        : titleFn();

    return (
        <TextCell>
            <Tooltip title={tooltip} arrow>
                <Typography
                    noWrap
                    sx={{
                        display: 'inline-block',
                        maxWidth: '100%',
                    }}
                    component='span'
                    variant='body2'
                    data-loading
                >
                    {input ? (
                        <TimeAgo date={input} refresh={live} />
                    ) : (
                        emptyText
                    )}
                </Typography>
            </Tooltip>
        </TextCell>
    );
};

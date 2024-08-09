import type { FC, ReactNode } from 'react';
import { Typography } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

export const WidgetTitle: FC<{
    title: ReactNode;
    tooltip?: ReactNode;
}> = ({ title, tooltip }) => (
    <Typography
        variant='h3'
        sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(0.5),
        })}
    >
        {title}
        {tooltip ? (
            <HelpIcon htmlTooltip tooltip={tooltip}>
                <InfoOutlined />
            </HelpIcon>
        ) : null}
    </Typography>
);

import { FC, ReactNode } from 'react';
import { Paper, Typography } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

export const Widget: FC<{
    title: ReactNode;
    order?: number;
    span?: number;
    tooltip?: ReactNode;
}> = ({ title, order, children, span = 1, tooltip }) => (
    <Paper
        elevation={0}
        sx={(theme) => ({
            padding: 3,
            borderRadius: `${theme.shape.borderRadiusLarge}px`,
            order,
            gridColumn: `span ${span}`,
            minWidth: 0, // bugfix, see: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128
        })}
    >
        <Typography
            variant='h3'
            sx={(theme) => ({
                marginBottom: theme.spacing(3),
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(0.5),
            })}
        >
            {title}
            <ConditionallyRender
                condition={Boolean(tooltip)}
                show={<HelpIcon htmlTooltip tooltip={tooltip} />}
            />
        </Typography>
        {children}
    </Paper>
);

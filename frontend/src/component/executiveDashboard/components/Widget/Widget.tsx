import { FC, ReactNode } from 'react';
import { Paper, Typography, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    minWidth: 0, // bugfix, see: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128
    position: 'relative',
}));

export const Widget: FC<{
    title: ReactNode;
    tooltip?: ReactNode;
}> = ({ title, children, tooltip, ...rest }) => (
    <StyledPaper elevation={0} {...rest}>
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
    </StyledPaper>
);

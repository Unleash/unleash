import type React from 'react';
import type { FC, ReactNode } from 'react';
import { Paper, Typography, styled, type SxProps } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import type { Theme } from '@mui/material/styles/createTheme';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    minWidth: 0, // bugfix, see: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128
    position: 'relative',
}));

/**
 * @deprecated remove with insightsV2 flag
 */
export const Widget: FC<{
    title: ReactNode;
    tooltip?: ReactNode;
    sx?: SxProps<Theme>;
    children?: React.ReactNode;
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
            {tooltip ? (
                <HelpIcon htmlTooltip tooltip={tooltip}>
                    <InfoOutlined />
                </HelpIcon>
            ) : null}
        </Typography>
        {children}
    </StyledPaper>
);

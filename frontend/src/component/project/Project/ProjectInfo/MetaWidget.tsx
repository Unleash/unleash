import type { FC } from 'react';
import { styled, Typography } from '@mui/material';

import {
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { WidgetFooterLink } from './WidgetFooterLink';

interface IMetaWidgetProps {
    id?: string;
    description?: string;
}

const StyledIDContainer = styled('div')(({ theme }) => ({
    textAlign: 'left',
    borderRadius: `${theme.shape.borderRadius}px`,
    backgroundColor: `${theme.palette.background.elevation2}`,
    padding: theme.spacing(0.5, 2),
    fontSize: theme.typography.body2.fontSize,
}));

export const MetaWidget: FC<IMetaWidgetProps> = ({ id, description }) => {
    return (
        <StyledProjectInfoWidgetContainer>
            <StyledWidgetTitle data-loading>Project Meta</StyledWidgetTitle>
            <StyledIDContainer data-loading>
                <Typography
                    component='span'
                    variant='body2'
                    color='text.secondary'
                >
                    ID:
                </Typography>{' '}
                <code data-loading>{id || '__________'}</code>
            </StyledIDContainer>
            {description ? (
                <Typography
                    data-loading
                    variant='body2'
                    sx={{
                        marginTop: (theme) => theme.spacing(1.5),
                        marginBottom: 0,
                        textAlign: 'left',
                    }}
                >
                    {description}
                </Typography>
            ) : null}
            {!description ? (
                <WidgetFooterLink to={`/projects/${id}/settings`}>
                    Add description
                </WidgetFooterLink>
            ) : null}
        </StyledProjectInfoWidgetContainer>
    );
};

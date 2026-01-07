import type { FC } from 'react';
import { styled, Typography } from '@mui/material';

import {
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { WidgetFooterLink } from './WidgetFooterLink.tsx';

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
            <ConditionallyRender
                condition={Boolean(description)}
                show={
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
                }
            />
            <ConditionallyRender
                condition={!description}
                show={
                    <WidgetFooterLink to={`/projects/${id}/settings`}>
                        Add description
                    </WidgetFooterLink>
                }
            />
        </StyledProjectInfoWidgetContainer>
    );
};

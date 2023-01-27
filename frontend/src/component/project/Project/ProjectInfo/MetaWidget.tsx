import { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, styled, Typography, Link } from '@mui/material';

import {
    StyledProjectInfoWidgetContainer,
    StyledWidgetTitle,
} from './ProjectInfo.styles';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IMetaWidgetProps {
    id?: string;
    description?: string;
}

const StyledIDContainer = styled('div')(({ theme }) => ({
    textAlign: 'left',
    borderRadius: `${theme.shape.borderRadius}px`,
    backgroundColor: `${theme.palette.secondaryContainer}`,
    padding: theme.spacing(0.5, 2),
    fontSize: theme.typography.body2.fontSize,
}));

export const MetaWidget: FC<IMetaWidgetProps> = ({ id, description }) => {
    return (
        <StyledProjectInfoWidgetContainer>
            <StyledWidgetTitle>Project Meta</StyledWidgetTitle>
            <StyledIDContainer>
                <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                >
                    ID:
                </Typography>{' '}
                <code data-loading>{id || '__________'}</code>
            </StyledIDContainer>
            <Typography mt={1.5} textAlign="left">
                <ConditionallyRender
                    condition={Boolean(description)}
                    show={
                        <>
                            <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                            >
                                Description:{' '}
                            </Typography>
                            <Typography component="span" variant="body2">
                                {description}
                            </Typography>
                        </>
                    }
                    elseShow={
                        <Typography variant="body2" textAlign="center">
                            <Link
                                component={RouterLink}
                                to={`/projects/${id}/edit`}
                            >
                                Add description
                            </Link>
                        </Typography>
                    }
                />
            </Typography>
        </StyledProjectInfoWidgetContainer>
    );
};

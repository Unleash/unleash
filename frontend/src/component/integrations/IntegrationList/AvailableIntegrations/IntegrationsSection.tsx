import { FC, type VFC } from 'react';
import type { AddonTypeSchema } from 'openapi';
import useLoading from 'hooks/useLoading';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { styled, Typography } from '@mui/material';

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

interface IIntegrationsSectionProps {
    title?: string;
    description?: string;
    loading?: boolean;
}
export const IntegrationsSection: FC<IIntegrationsSectionProps> = ({
    title,
    description,
    loading,
    children,
}) => {
    const ref = useLoading(loading || false);
    return (
        <StyledDiv>
            <Typography variant="h3">Title</Typography>
            <Typography variant="body2" color={'text.secondary'}>
                Description
            </Typography>
            <StyledCardsGrid ref={ref}>{children}</StyledCardsGrid>
        </StyledDiv>
    );
};

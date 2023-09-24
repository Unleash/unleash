import { AddonTypeSchema } from 'openapi';
import { VFC } from 'react';
import { StyledRaisedSection } from '../IntegrationForm/IntegrationForm.styles';
import { Typography, styled } from '@mui/material';
import { IntegrationIcon } from '../IntegrationList/IntegrationIcon/IntegrationIcon';
import ReactMarkdown from 'react-markdown';

const StyledHowDoesItWorkSection = styled(StyledRaisedSection)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    gap: theme.spacing(1.5),
}));

interface IIntegrationHowToSectionProps {
    provider?: Pick<AddonTypeSchema, 'howTo' | 'name'>;
    title?: string;
}

export const IntegrationHowToSection: VFC<IIntegrationHowToSectionProps> = ({
    provider,
    title = 'How does it work?',
}) => {
    if (!provider?.name || !provider?.howTo) return null;

    return (
        <StyledHowDoesItWorkSection>
            <Typography
                variant="h4"
                component="h3"
                sx={theme => ({
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: theme.spacing(1),
                })}
            >
                <IntegrationIcon name={provider.name} /> {title}
            </Typography>
            <ReactMarkdown>{provider!.howTo || ''}</ReactMarkdown>
        </StyledHowDoesItWorkSection>
    );
};

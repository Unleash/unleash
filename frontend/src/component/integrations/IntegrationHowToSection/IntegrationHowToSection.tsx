import { AddonTypeSchema } from 'openapi';
import { VFC } from 'react';
import { StyledRaisedSection } from '../IntegrationForm/IntegrationForm.styles';
import { Typography } from '@mui/material';
import { IntegrationIcon } from '../IntegrationList/IntegrationIcon/IntegrationIcon';
import ReactMarkdown from 'react-markdown';

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
        <StyledRaisedSection>
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
        </StyledRaisedSection>
    );
};

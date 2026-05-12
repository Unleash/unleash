import { styled, useTheme } from '@mui/material';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { useIsElementWiderThan } from 'hooks/useIsElementWiderThan';

const SecretExplanation = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const TokenDisplay = styled('div')({
    wordBreak: 'break-all',
});

const DescriptionBox = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    flex: 1,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    background: theme.palette.background.default,
}));

const ProjectDescription = styled(DescriptionBox)(({ theme }) => ({
    border: `1px solid ${theme.palette.primary.main}`,
}));

const EnvironmentDescription = styled(DescriptionBox)(({ theme }) => ({
    border: `1px solid ${theme.palette.success.main}`,
}));

const SecretDescription = styled(DescriptionBox)(({ theme }) => ({
    border: `1px solid ${theme.palette.text.secondary}`,
}));

const TokenExplanationBox = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
    marginTop: theme.spacing(8),
    flexWrap: 'wrap',
}));

const SmallScreenLayout = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    width: '100%',
}));

const TokenPart = styled('span')(({ theme }) => ({
    fontFamily: 'Sen',
    fontSize: theme.typography.body2.fontSize,
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
}));

const ProjectToken = styled(TokenPart)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const EnvironmentToken = styled(TokenPart)(({ theme }) => ({
    color: theme.palette.success.main,
}));

const SecretToken = styled(TokenPart)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const SeparatorToken = styled(TokenPart)(({ theme }) => ({
    color: theme.palette.text.disabled,
}));

const descriptions = {
    project: 'The project this API key can retrieve feature flags from',
    environment:
        'The environment this API key can retrieve feature flag configuration from',
    secret: 'The API key secret',
} as const;

export interface TokenExplanationProps {
    project: string;
    environment: string;
    secret: string;
}

export const TokenExplanation = ({
    project,
    environment,
    secret,
}: TokenExplanationProps) => {
    const theme = useTheme();
    const { ref, isWide: isLargeScreen } =
        useIsElementWiderThan<HTMLDivElement>(700);

    return (
        <div ref={ref} style={{ width: '100%' }}>
            <ArcherContainer
                strokeColor={theme.palette.secondary.border}
                endMarker={false}
                lineStyle='curve'
            >
                <SecretExplanation>
                    <TokenDisplay>
                        <ArcherElement id='project'>
                            <ProjectToken>{project}</ProjectToken>
                        </ArcherElement>
                        <SeparatorToken>:</SeparatorToken>
                        <ArcherElement id='environment'>
                            <EnvironmentToken>{environment}</EnvironmentToken>
                        </ArcherElement>
                        <SeparatorToken>.</SeparatorToken>
                        <ArcherElement id='secret'>
                            <SecretToken>{secret}</SecretToken>
                        </ArcherElement>
                    </TokenDisplay>

                    {isLargeScreen ? (
                        <TokenExplanationBox>
                            <ArcherElement
                                id='project-description'
                                relations={[
                                    {
                                        targetId: 'project',
                                        targetAnchor: 'bottom',
                                        sourceAnchor: 'top',
                                        style: {
                                            strokeColor:
                                                theme.palette.primary.main,
                                            strokeWidth: 2,
                                        },
                                    },
                                ]}
                            >
                                <ProjectDescription>
                                    {descriptions.project}
                                </ProjectDescription>
                            </ArcherElement>
                            <ArcherElement
                                id='environment-description'
                                relations={[
                                    {
                                        targetId: 'environment',
                                        targetAnchor: 'bottom',
                                        sourceAnchor: 'top',
                                        style: {
                                            strokeColor:
                                                theme.palette.success.main,
                                            strokeWidth: 2,
                                        },
                                    },
                                ]}
                            >
                                <EnvironmentDescription>
                                    {descriptions.environment}
                                </EnvironmentDescription>
                            </ArcherElement>
                            <ArcherElement
                                id='secret-description'
                                relations={[
                                    {
                                        targetId: 'secret',
                                        targetAnchor: 'bottom',
                                        sourceAnchor: 'top',
                                        style: {
                                            strokeColor:
                                                theme.palette.text.secondary,
                                            strokeWidth: 2,
                                        },
                                    },
                                ]}
                            >
                                <SecretDescription>
                                    {descriptions.secret}
                                </SecretDescription>
                            </ArcherElement>
                        </TokenExplanationBox>
                    ) : (
                        <SmallScreenLayout>
                            <ProjectDescription>
                                <ProjectToken>{project}</ProjectToken>
                                <div>{descriptions.project}</div>
                            </ProjectDescription>
                            <EnvironmentDescription>
                                <EnvironmentToken>
                                    {environment}
                                </EnvironmentToken>
                                <div>{descriptions.environment}</div>
                            </EnvironmentDescription>
                            <SecretDescription>
                                <TokenDisplay>
                                    <SecretToken>{secret}</SecretToken>
                                </TokenDisplay>
                                <div>{descriptions.secret}</div>
                            </SecretDescription>
                        </SmallScreenLayout>
                    )}
                </SecretExplanation>
            </ArcherContainer>
        </div>
    );
};

import { Alert, Box, Typography } from '@mui/material';
import { FC } from 'react';

const Paragraph: FC = ({ children }) => (
    <Typography
        component={'span'}
        variant="body2"
        sx={theme => ({
            marginBottom: theme.spacing(2),
        })}
    >
        {children}
    </Typography>
);

export const CustomStrategyInfo: FC<{ alert?: boolean }> = ({ alert }) => {
    const content = (
        <>
            <Paragraph>
                We recommend you to use the predefined strategies like Gradual
                rollout with constraints instead of creating a custom strategy.
            </Paragraph>
            <Paragraph>
                If you decide to create a custom strategy be aware of:
                <ul>
                    <li>
                        They require writing custom code and deployments for
                        each SDK you’re using.
                    </li>
                    <li>
                        Differing implementation in each SDK will cause toggles
                        to evaluate differently
                    </li>
                    <li>
                        Requires a lot of configuration in both Unleash admin UI
                        and the SDK.
                    </li>
                </ul>
            </Paragraph>
            <Paragraph>
                Constraints don’t have these problems. They’re configured once
                in the admin UI and behave in the same way in each SDK without
                further configuration.
            </Paragraph>
        </>
    );

    if (alert) {
        return (
            <Alert
                severity="info"
                sx={theme => ({
                    marginBottom: theme.spacing(3),
                })}
            >
                {content}
            </Alert>
        );
    }

    return (
        <Box
            sx={theme => ({
                maxWidth: '720px',
                padding: theme.spacing(4, 2),
                margin: '0 auto',
            })}
        >
            {content}
        </Box>
    );
};

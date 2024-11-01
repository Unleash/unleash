import { styled } from '@mui/material';

const StyledDisclaimer = styled('aside')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    color: theme.palette.secondary.dark,
    fontSize: theme.fontSizes.smallerBody,
    marginBottom: theme.spacing(2),
}));

export const AIChatDisclaimer = () => (
    <StyledDisclaimer>
        By using this assistant you accept that all data you share in this chat
        can be shared with OpenAI
    </StyledDisclaimer>
);

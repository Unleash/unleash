import { Alert } from '@mui/material';

export const ConflictWarning: React.FC<{
    conflict: string | null | undefined;
}> = ({ conflict }) =>
    conflict ? (
        <Alert
            severity='warning'
            sx={{
                px: 3,
                mb: 2,
                '&.MuiAlert-standardWarning': {
                    borderStyle: 'none',
                },
                borderRadius: '0px',
            }}
        >
            <strong>Conflict!</strong> {conflict}.
        </Alert>
    ) : null;

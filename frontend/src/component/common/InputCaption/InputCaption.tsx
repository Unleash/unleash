import { Box } from '@mui/material';

export interface IInputCaptionProps {
    text?: string;
}

export const InputCaption = ({ text }: IInputCaptionProps) => {
    if (!text) {
        return null;
    }

    return (
        <Box
            sx={theme => ({
                color: theme.palette.text.secondary,
                fontSize: theme.fontSizes.smallerBody,
                marginTop: theme.spacing(1),
            })}
        >
            {text}
        </Box>
    );
};

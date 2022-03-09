import { useTheme } from '@material-ui/core';

interface IStrategySeparatorProps {
    text: string;
    maxWidth?: string;
}

export const StrategySeparator = ({
    text,
    maxWidth = '50px',
}: IStrategySeparatorProps) => {
    const theme = useTheme();
    return (
        <div
            style={{
                color: theme.palette.primary.main,
                padding: '0.1rem 0.25rem',
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: '0.25rem',
                maxWidth,
                fontSize: theme.fontSizes.smallerBody,
                textAlign: 'center',
                margin: '0.5rem 0rem 0.5rem 1rem',
                backgroundColor: '#fff',
            }}
        >
            {text}
        </div>
    );
};

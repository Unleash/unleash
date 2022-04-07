import { useTheme } from '@material-ui/core';

interface IStrategySeparatorProps {
    text: string;
}

export const StrategySeparator = ({ text }: IStrategySeparatorProps) => {
    const theme = useTheme();

    return (
        <div
            style={{
                color: theme.palette.primary.main,
                padding: '0.1rem 0.25rem',
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: '0.25rem',
                fontSize: theme.fontSizes.smallerBody,
                backgroundColor: '#fff',
            }}
        >
            {text}
        </div>
    );
};

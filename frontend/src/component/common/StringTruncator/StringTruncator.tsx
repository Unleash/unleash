import { Tooltip } from '@mui/material';

interface IStringTruncatorProps {
    text: string;
    maxWidth: string;
    className?: string;
    maxLength: number;
}

const StringTruncator = ({
    text,
    maxWidth,
    maxLength,
    className,
    ...rest
}: IStringTruncatorProps) => {
    return (text?.length ?? 0) > maxLength ? (
        <Tooltip title={text} arrow>
            <span
                data-loading
                className={className}
                style={{
                    maxWidth: `${maxWidth}px`,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                }}
                {...rest}
            >
                {text}
            </span>
        </Tooltip>
    ) : (
        <span className={className}>{text}</span>
    );
};

export default StringTruncator;

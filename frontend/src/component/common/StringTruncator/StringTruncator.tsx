import { Tooltip } from '@material-ui/core';

interface IStringTruncatorProps {
    text: string;
    maxWidth: string;
    className?: string;
}

const StringTruncator = ({
    text,
    maxWidth,
    className,
    ...rest
}: IStringTruncatorProps) => {
    return (
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
                }}
                {...rest}
            >
                {text}
            </span>
        </Tooltip>
    );
};

export default StringTruncator;

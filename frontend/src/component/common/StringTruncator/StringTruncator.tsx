import { Tooltip } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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
    return (
        <ConditionallyRender
            condition={(text?.length ?? 0) > maxLength}
            show={
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
            }
            elseShow={<span className={className}>{text}</span>}
        />
    );
};

export default StringTruncator;

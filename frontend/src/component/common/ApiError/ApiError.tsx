import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

interface IApiErrorProps {
    className?: string;
    onClick: () => void;
    text: string;
}

const ApiError: React.FC<IApiErrorProps> = ({
    className,
    onClick,
    text,
    ...rest
}) => {
    return (
        <Alert
            className={className ? className : ''}
            action={
                <Button color="inherit" size="small" onClick={onClick}>
                    TRY AGAIN
                </Button>
            }
            severity="error"
            {...rest}
        >
            {text}
        </Alert>
    );
};

export default ApiError;

import { Button } from '@mui/material';
import { Alert } from '@mui/material';
import React from 'react';

interface IApiErrorProps {
    className?: string;
    onClick: () => void;
    text: string;
    style?: React.CSSProperties;
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

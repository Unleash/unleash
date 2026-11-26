import type React from 'react';
import { type FC, useEffect } from 'react';
import { Box } from '@mui/material';
import { useJsonFileUpload } from 'component/common/JsonFileUpload/useJsonFileUpload';

interface IFileDropZoneProps {
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
    onDragStatusChange: (dragOn: boolean) => void;
    children?: React.ReactNode;
}

// This component has no styling on purpose
export const FileDropZone: FC<IFileDropZoneProps> = ({
    onSuccess,
    onError,
    children,
    onDragStatusChange,
    ...props
}) => {
    const { getRootProps, getInputProps, isDragActive } = useJsonFileUpload({
        onLoad: (json) => onSuccess(JSON.stringify(json, null, 4)),
        onError,
    });
    useEffect(() => {
        onDragStatusChange(isDragActive);
    }, [isDragActive]);

    return (
        <Box {...getRootProps()} {...props}>
            <input data-testid='import-file' {...getInputProps()} />
            {children}
        </Box>
    );
};

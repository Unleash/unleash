import React, { FC, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box } from '@mui/material';

const formatJSON = (json: string) => {
    try {
        return JSON.stringify(JSON.parse(json), null, 4);
    } catch (e) {
        console.error(e);
        return '';
    }
};

interface IFileDropZoneProps {
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
}

// This component has no styling on purpose
export const FileDropZone: FC<IFileDropZoneProps> = ({
    onSuccess,
    onError,
    children,
    ...props
}) => {
    const onDrop = useCallback(([file]) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e?.target?.result;
            if (typeof contents === 'string') {
                onSuccess(formatJSON(contents));
            } else {
                onError('Unsupported format');
            }
        };
        reader.readAsText(file);
    }, []);
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json'],
        },
        maxFiles: 1,
    });

    return (
        <Box {...getRootProps()} {...props}>
            <input {...getInputProps()} />
            {children}
        </Box>
    );
};

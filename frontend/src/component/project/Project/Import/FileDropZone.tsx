import React, { FC, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box } from '@mui/material';

const formatJSON = (json: string) => JSON.stringify(JSON.parse(json), null, 4);

interface IFileDropZoneProps {
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
}

const onFileDropped =
    ({ onSuccess, onError }: IFileDropZoneProps) =>
    (e: ProgressEvent<FileReader>) => {
        const contents = e?.target?.result;
        if (typeof contents === 'string') {
            try {
                const json = formatJSON(contents);
                onSuccess(json);
            } catch (e) {
                onError('Cannot format as valid JSON');
            }
        } else {
            onError('Unsupported format');
        }
    };

// This component has no styling on purpose
export const FileDropZone: FC<IFileDropZoneProps> = ({
    onSuccess,
    onError,
    children,
    ...props
}) => {
    const onDrop = useCallback(([file]) => {
        const reader = new FileReader();
        reader.onload = onFileDropped({ onSuccess, onError });
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

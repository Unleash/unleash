import { Button } from '@mui/material';
import FileUpload from '@mui/icons-material/FileUpload';
import { useJsonFileUpload } from './useJsonFileUpload.ts';

interface IJsonFileUploadButtonProps {
    onLoad: (json: unknown) => void;
    onError: (message: string) => void;
}

export const JsonFileUploadButton = ({
    onLoad,
    onError,
}: IJsonFileUploadButtonProps) => {
    const { getInputProps, open } = useJsonFileUpload({ onLoad, onError });

    return (
        <>
            <Button
                size='small'
                variant='outlined'
                startIcon={<FileUpload />}
                onClick={open}
                sx={{ backgroundColor: 'background.paper' }}
            >
                Upload .json
            </Button>
            <input data-testid='json-file-input' {...getInputProps()} />
        </>
    );
};

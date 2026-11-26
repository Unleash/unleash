import { ErrorCode, type FileRejection, useDropzone } from 'react-dropzone';

interface IUseJsonFileUploadOptions {
    maxBytes: number;
    onLoad: (json: unknown) => void;
    onError: (message: string) => void;
}

const rejectionMessage = ([rejection]: FileRejection[], maxBytes: number) => {
    const [error] = rejection.errors;
    switch (error.code) {
        case ErrorCode.FileTooLarge:
            return `The file is larger than ${Math.floor(maxBytes / 1024)} kB`;
        case ErrorCode.FileInvalidType:
            return 'Only .json files can be uploaded';
        case ErrorCode.TooManyFiles:
            return 'Upload one file at a time';
        default:
            return error.message;
    }
};

export const useJsonFileUpload = ({
    maxBytes,
    onLoad,
    onError,
}: IUseJsonFileUploadOptions) =>
    useDropzone({
        accept: { 'application/json': ['.json'] },
        maxFiles: 1,
        maxSize: maxBytes,
        onDropAccepted: ([file]) => {
            const reader = new FileReader();
            reader.onload = () => {
                let json: unknown;
                try {
                    json = JSON.parse(String(reader.result));
                } catch {
                    onError('The file is not valid JSON');
                    return;
                }
                onLoad(json);
            };
            reader.readAsText(file);
        },
        onDropRejected: (rejections) =>
            onError(rejectionMessage(rejections, maxBytes)),
    });

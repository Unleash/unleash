import { useDropzone } from 'react-dropzone';

interface IUseJsonFileUploadOptions {
    onLoad: (json: unknown) => void;
    onError: (message: string) => void;
}

export const useJsonFileUpload = ({
    onLoad,
    onError,
}: IUseJsonFileUploadOptions) =>
    useDropzone({
        accept: { 'application/json': ['.json'] },
        maxFiles: 1,
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
    });

export interface IToast {
    type: 'success' | 'error';
    text: string;
    components?: JSX.Element[];
    show?: boolean;
    persist?: boolean;
    autoHideDuration?: number;
}

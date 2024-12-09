export interface IToast {
    type: 'success' | 'error';
    title: string;
    components?: JSX.Element[];
    show?: boolean;
    persist?: boolean;
    autoHideDuration?: number;
}

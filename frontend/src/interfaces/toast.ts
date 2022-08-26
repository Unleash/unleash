export interface IToast {
    type: 'success' | 'error';
    title: string;
    text?: string;
    components?: JSX.Element[];
    show?: boolean;
    persist?: boolean;
    confetti?: boolean;
    autoHideDuration?: number;
}

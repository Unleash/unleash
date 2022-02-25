export interface IToast {
    type: string;
    title: string;
    text?: string;
    components?: JSX.Element[];
    show?: boolean;
    persist?: boolean;
    confetti?: boolean;
    autoHideDuration?: number;
}

export interface IProfile {
    role: string;
    projects: string[];
    toggles: IProfileToggle[];
}

interface IProfileToggle {
    project: string;
    name: string;
}

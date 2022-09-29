export interface IProfile {
    rootRole: string;
    projects: IProfileProject[];
}

interface IProfileProject {
    project: string;
}

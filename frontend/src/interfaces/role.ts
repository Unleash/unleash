interface IRole {
    id: number;
    name: string;
    project: string | null;
    description: string;
    type: string;
}

export default IRole;

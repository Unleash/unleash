export type SdkType = 'client' | 'frontend';
export type Sdk = { name: SdkName; type: SdkType };
export type ServerSdkName =
    | 'Node'
    | 'Golang'
    | 'Ruby'
    | 'PHP'
    | 'Rust'
    | 'DotNet'
    | 'Java'
    | 'Python';
export type ClientSdkName =
    | 'Javascript'
    | 'React'
    | 'Vue'
    | 'Svelte'
    | 'Swift'
    | 'Android'
    | 'Flutter';
export type SdkName = ServerSdkName | ClientSdkName;

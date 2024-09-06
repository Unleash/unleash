import node from '../../assets/icons/sdks/Logo-node.svg';
import go from '../../assets/icons/sdks/Logo-go.svg';
import ruby from '../../assets/icons/sdks/Logo-ruby.svg';
import php from '../../assets/icons/sdks/Logo-php.svg';
import rust from '../../assets/icons/sdks/Logo-rust.svg';
import dotnet from '../../assets/icons/sdks/Logo-net.svg';
import java from '../../assets/icons/sdks/Logo-java.svg';
import python from '../../assets/icons/sdks/Logo-python.svg';
import javascript from '../../assets/icons/sdks/Logo-javascript.svg';
import react from '../../assets/icons/sdks/Logo-react.svg';
import vue from '../../assets/icons/sdks/Logo-vue.svg';
import svelte from '../../assets/icons/sdks/Logo-svelte.svg';
import swift from '../../assets/icons/sdks/Logo-swift.svg';
import android from '../../assets/icons/sdks/Logo-android.svg';
import flutter from '../../assets/icons/sdks/Logo-flutter.svg';

export type SdkType = 'client' | 'frontend';
export type Sdk = { name: SdkName; type: SdkType };
export type ServerSdkName =
    | 'Node.js'
    | 'Go'
    | '.NET'
    | 'Ruby'
    | 'PHP'
    | 'Rust'
    | 'DotNet'
    | 'Java'
    | 'Python';
export type ClientSdkName =
    | 'JavaScript'
    | 'React'
    | 'Vue'
    | 'Svelte'
    | 'Swift'
    | 'Android'
    | 'Flutter';
export type SdkName = ServerSdkName | ClientSdkName;

export const serverSdks: { name: ServerSdkName; icon: string }[] = [
    { name: 'Node.js', icon: node },
    { name: 'Go', icon: go },
    { name: 'Ruby', icon: ruby },
    { name: 'PHP', icon: php },
    { name: 'Rust', icon: rust },
    { name: '.NET', icon: dotnet },
    { name: 'Java', icon: java },
    { name: 'Python', icon: python },
];
export const clientSdks: { name: ClientSdkName; icon: string }[] = [
    { name: 'JavaScript', icon: javascript },
    { name: 'React', icon: react },
    { name: 'Vue', icon: vue },
    { name: 'Svelte', icon: svelte },
    { name: 'Swift', icon: swift },
    { name: 'Android', icon: android },
    { name: 'Flutter', icon: flutter },
];

export const allSdks: { name: ClientSdkName | ServerSdkName; icon: string }[] =
    [...serverSdks, ...clientSdks];

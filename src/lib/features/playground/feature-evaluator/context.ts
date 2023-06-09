export interface Properties {
    [key: string]: string | undefined | number;
}

export interface Context {
    [key: string]: string | Date | undefined | number | Properties;
    currentTime?: Date;
    userId?: string;
    sessionId?: string;
    remoteAddress?: string;
    environment?: string;
    appName?: string;
    properties?: Properties;
}

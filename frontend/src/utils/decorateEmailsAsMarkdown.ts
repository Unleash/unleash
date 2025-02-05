export function decorateEmailsAsMarkdown(text: string): string {
    const emailRegex =
        /(?<!\[)(?<!\]\()(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)(?!\]\()/g;
    return text.replace(emailRegex, (email) => `[${email}](${email})`);
}

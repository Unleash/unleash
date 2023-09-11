const packageInfo = await Bun.file('package.json', {
    type: 'application/json',
}).json();
export const version = packageInfo.version;
export default version;

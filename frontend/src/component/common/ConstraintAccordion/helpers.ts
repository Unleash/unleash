export function getTextWidth(text: string | null) {
    if (text != null) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context != null) {
            context.font = getComputedStyle(document.body).font;

            return context.measureText(text).width;
        }
    }
    return 0;
}

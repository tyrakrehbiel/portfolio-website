/**
 * Handles opening a url in a new tab
 */
export const openLink = (url: string) => {
    window.open(url, '_blank');
};
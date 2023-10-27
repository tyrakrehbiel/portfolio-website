import { AppRoute } from '../@types';

/**
 * Handles opening a url in a new tab
 */
export const openLink = (url: string) => {
    window.open(url, '_blank');
};

/**
 * List of all application routes. Will be mapped to buttons in navigation.
 * 
 * If no path is provided, a custom onClick will be used
 */
export const routes: AppRoute[] = [
    {
        label: 'About',
        path: '/about'
    }, {
        label: 'Projects',
        path: '/projects'
    }, {
        label: 'Experience',
        url: 'https://drive.google.com/file/d/1lZT_jhyvQS83g-3mvYOBzQUFKRUyvd55/view?usp=sharing'
    }, {
        label: 'Get in Touch',
        path: '/contact'
    }
];
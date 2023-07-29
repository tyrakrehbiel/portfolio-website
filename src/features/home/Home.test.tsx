import React from 'react';
import { render } from '@testing-library/react';
import Home from './Home';

describe('Home', () => {

    it('renders all content', () => {
        const { container } = render(<Home />);

        expect(container.querySelectorAll('h1')).toHaveLength(1);
        expect(container.querySelectorAll('p')).toHaveLength(5);
    });
});
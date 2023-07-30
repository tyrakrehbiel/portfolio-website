import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Home from './Home';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate
}));

describe('Home', () => {

    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders all content', () => {
        const { container } = render(<Home />);

        // 2 title sections
        expect(container.querySelectorAll('h1')).toHaveLength(2);

        // 3 subtitles for job titles
        expect(container.querySelectorAll('h2')).toHaveLength(3);

        // 4 additional text bodies
        expect(container.querySelectorAll('p')).toHaveLength(4);
    });

    it('navigates to call to action page', () => {
        render(<Home />);

        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Hire Me');
        
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });
});
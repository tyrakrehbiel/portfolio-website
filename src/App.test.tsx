import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./features/home/Home', () =>
    () => <div data-testid='home' />
);

describe('App', () => {
    it('renders home page on load', () => {
        render(<App />);
        expect(screen.getByTestId('home')).toBeInTheDocument();
    });
});
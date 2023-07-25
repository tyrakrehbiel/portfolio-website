import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./features/temp-page/TempPage', () =>
    () => <div data-testid='temp-page' />
);

describe('App', () => {
    it('renders home page on load', () => {
        render(<App />);
        expect(screen.getByTestId('temp-page')).toBeInTheDocument();
    });
});
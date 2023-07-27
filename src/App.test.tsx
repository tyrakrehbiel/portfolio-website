import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./common/layout/Layout', () =>
    () => <div data-testid='layout' />
);

describe('App', () => {
    it('renders page layout on load', () => {
        render(<App />);
        expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
});
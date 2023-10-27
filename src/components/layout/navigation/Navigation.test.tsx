import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import Header from './Navigation';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: jest.fn()
}));

jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    useMediaQuery: jest.fn(),
}));

const mockUseLocation = jest.requireMock('react-router-dom').useLocation;
const mockUseMediaQuery = jest.requireMock('@mui/material').useMediaQuery;

describe('Header', () => {

    beforeEach(() => {
        mockUseLocation.mockReturnValue({ pathname: '/about' });
        mockNavigate.mockClear();
    });

    it('renders buttons in header appbar on larger screens', () => {
        mockUseMediaQuery.mockReturnValue(true);

        render(<Header />);

        // page should have header navigation, not drawer
        expect(screen.getByTestId('appbar-header-nav')).toBeInTheDocument();
        expect(screen.queryByTestId('nav-menu-button')).not.toBeInTheDocument();
    });

    it('renders buttons in header drawer on smaller screens', () => {
        mockUseMediaQuery.mockReturnValue(false);

        render(<Header />);

        // page should have drawer navigation, not header
        expect(screen.queryByTestId('appbar-header-nav')).not.toBeInTheDocument();

        // click button to open drawer
        const menuButton = screen.getByTestId('nav-menu-button');
        fireEvent.click(menuButton);
        
        expect(screen.getByTestId('drawer-header-nav')).toBeInTheDocument();
    });

    it('handles button click', () => {
        const mockWindowOpen = jest.fn();
        jest.spyOn(window, 'open').mockImplementation(mockWindowOpen);

        mockUseMediaQuery.mockReturnValue(true);

        render(<Header />);

        // get all navigation buttons
        const buttons = screen.getAllByTestId('navigation-button');
        expect(buttons).toHaveLength(4);

        // click contact tab
        const contact = buttons[3];
        expect(contact).toHaveTextContent('Contact');
        fireEvent.click(contact);
        expect(mockNavigate).toHaveBeenCalledWith('/contact');

        // click resume
        const resume = buttons[2];
        expect(resume).toHaveTextContent('Resume');
        fireEvent.click(resume);
        expect(mockNavigate).not.toHaveBeenCalledWith('/resume');
        expect(mockWindowOpen).toHaveBeenCalled();

        // click logo button
        const logo = screen.getByTestId('logo-button');
        fireEvent.click(logo);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import reportWebVitals from './reportWebVitals';
import App from './App';
import theme from './styles/_Theme.module.scss';
import './index.scss';
//redux
import { Provider } from 'react-redux';
import {store} from './store/store';


const MuiTheme = createTheme({
    overrides: {
        MuiAppBar: {
            root: {
                boxShadow: theme.shadows_5,
            },
        },
    },
    palette: {
        primary: {
            light: theme.palette_primary_light,
            main: theme.palette_primary_main,
            dark: theme.palette_primary_dark,
            contrastText: theme.palette_primary_contrastText,
        },
        secondary: {
            light: theme.palette_secondary_light,
            main: theme.palette_secondary_main,
            dark: theme.palette_secondary_dark,
            contrastText: theme.palette_secondary_contrastText,
        },
        error: {
            light: theme.palette_error_light,
            main: theme.palette_error_main,
            dark: theme.palette_error_dark,
            contrastText: theme.palette_error_contrastText,
        },
        warning: {
            light: theme.palette_warning_light,
            main: theme.palette_warning_main,
            dark: theme.palette_warning_dark,
            contrastText: theme.palette_warning_contrastText,
        },
        info: {
            light: theme.palette_info_light,
            main: theme.palette_info_main,
            dark: theme.palette_info_dark,
            contrastText: theme.palette_info_contrastText,
        },
        success: {
            light: theme.palette_success_light,
            main: theme.palette_success_main,
            dark: theme.palette_success_dark,
            contrastText: theme.palette_success_contrastText,
        },
        text: {
            primary: theme.palette_text_primary,
            secondary: theme.palette_text_secondary,
            disabled: theme.palette_text_disabled,
            hint: theme.palette_text_hint,
        },
        background: {
            default: theme.palette_background_default,
            paper: theme.palette_background_paper,
        },
    },
    shadows: [
        'none',
        theme.shadows_1,
        theme.shadows_2,
        theme.shadows_3,
        theme.shadows_4,
        theme.shadows_5,
        theme.shadows_6,
        theme.shadows_7,
        theme.shadows_8,
        theme.shadows_9,
        theme.shadows_10,
        theme.shadows_11,
        theme.shadows_12,
        theme.shadows_13,
        theme.shadows_14,
        theme.shadows_15,
        theme.shadows_16,
        theme.shadows_17,
        theme.shadows_18,
        theme.shadows_19,
        theme.shadows_20,
        theme.shadows_21,
        theme.shadows_22,
        theme.shadows_23,
        theme.shadows_24,
    ],
    typography: {
        fontFamily: theme.typography_fontFamily,
        h1: {
            fontFamily: theme.typography_h1_fontFamily,
            fontWeight: parseInt(theme.typography_h1_fontWeight),
            fontSize: theme.typography_h1_fontSize,
            lineHeight: theme.typography_h1_lineHeight,
            letterSpacing: theme.typography_h1_letterSpacing,
        },
        h2: {
            fontFamily: theme.typography_h2_fontFamily,
            fontWeight: parseInt(theme.typography_h2_fontWeight),
            fontSize: theme.typography_h2_fontSize,
            lineHeight: theme.typography_h2_lineHeight,
            letterSpacing: theme.typography_h2_letterSpacing,
        },
        h3: {
            fontFamily: theme.typography_h3_fontFamily,
            fontWeight: parseInt(theme.typography_h3_fontWeight),
            fontSize: theme.typography_h3_fontSize,
            lineHeight: theme.typography_h3_lineHeight,
            letterSpacing: theme.typography_h3_letterSpacing,
        },
        h4: {
            fontFamily: theme.typography_h4_fontFamily,
            fontWeight: parseInt(theme.typography_h4_fontWeight),
            fontSize: theme.typography_h4_fontSize,
            lineHeight: theme.typography_h4_lineHeight,
            letterSpacing: theme.typography_h4_letterSpacing,
        },
        h5: {
            fontFamily: theme.typography_h5_fontFamily,
            fontWeight: parseInt(theme.typography_h5_fontWeight),
            fontSize: theme.typography_h5_fontSize,
            lineHeight: theme.typography_h5_lineHeight,
            letterSpacing: theme.typography_h5_letterSpacing,
        },
        h6: {
            fontFamily: theme.typography_h6_fontFamily,
            fontWeight: parseInt(theme.typography_h6_fontWeight),
            fontSize: theme.typography_h6_fontSize,
            lineHeight: theme.typography_h6_lineHeight,
            letterSpacing: theme.typography_h6_letterSpacing,
        },
        subtitle1: {
            fontFamily: theme.typography_subtitle1_fontFamily,
            fontWeight: parseInt(theme.typography_subtitle1_fontWeight),
            fontSize: theme.typography_subtitle1_fontSize,
            lineHeight: theme.typography_subtitle1_lineHeight,
            letterSpacing: theme.typography_subtitle1_letterSpacing,
        },
        subtitle2: {
            fontFamily: theme.typography_subtitle2_fontFamily,
            fontWeight: parseInt(theme.typography_subtitle2_fontWeight),
            fontSize: theme.typography_subtitle2_fontSize,
            lineHeight: theme.typography_subtitle2_lineHeight,
            letterSpacing: theme.typography_subtitle2_letterSpacing,
        },
        body1: {
            fontFamily: theme.typography_body1_fontFamily,
            fontWeight: parseInt(theme.typography_body1_fontWeight),
            fontSize: theme.typography_body1_fontSize,
            lineHeight: theme.typography_body1_lineHeight,
            letterSpacing: theme.typography_body1_letterSpacing,
        },
        body2: {
            fontFamily: theme.typography_body2_fontFamily,
            fontWeight: parseInt(theme.typography_body2_fontWeight),
            fontSize: theme.typography_body2_fontSize,
            lineHeight: theme.typography_body2_lineHeight,
            letterSpacing: theme.typography_body2_letterSpacing,
        },
        button: {
            fontFamily: theme.typography_button_fontFamily,
            fontWeight: parseInt(theme.typography_button_fontWeight),
            fontSize: theme.typography_button_fontSize,
            lineHeight: theme.typography_button_lineHeight,
            letterSpacing: theme.typography_button_letterSpacing,
        },
        caption: {
            fontFamily: theme.typography_caption_fontFamily,
            fontWeight: parseInt(theme.typography_caption_fontWeight),
            fontSize: theme.typography_caption_fontSize,
            lineHeight: theme.typography_caption_lineHeight,
            letterSpacing: theme.typography_caption_letterSpacing,
        },
        overline: {
            fontFamily: theme.typography_overline_fontFamily,
            fontWeight: parseInt(theme.typography_overline_fontWeight),
            fontSize: theme.typography_overline_fontSize,
            lineHeight: theme.typography_overline_lineHeight,
            letterSpacing: theme.typography_overline_letterSpacing,
        }
    },
    shape: {
        borderRadius: parseInt(theme.shape_borderRadius),
    },
    zIndex: {
        modal: 1200,
        appBar: 1300,
        drawer: 1100,
    },
});
export default MuiTheme;
ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider theme={MuiTheme}>
            <Router>
                <App />
            </Router>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

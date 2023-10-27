import { createTheme } from '@mui/material/styles';
import tm from './_theme.module.scss';
import zIndex from '@mui/material/styles/zIndex';

type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase' | 'full-width' | 'full-size-kana';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: tm.palette_primary_main
        },
        secondary: {
            main: tm.palette_secondary_main
        },
        text: {
            primary: tm.palette_text_primary,
            secondary: tm.palette_text_secondary
        },
        background: {
            default: tm.palette_background_default,
            paper: tm.palette_background_paper,
        }
    },
    breakpoints: {
        values: {
            xs: parseInt(tm.breakpoints_xs),
            sm: parseInt(tm.breakpoints_sm),
            md: parseInt(tm.breakpoints_md),
            lg: parseInt(tm.breakpoints_lg),
            xl: parseInt(tm.breakpoints_xl),
        },
    },
    typography: {
        fontFamily: tm.typography_fontFamily,
        h1: {
            fontFamily: tm.typography_h1_fontFamily,
            fontWeight: parseInt(tm.typography_h1_fontWeight),
            fontSize: tm.typography_h1_fontSize
        },
        h2: {
            fontFamily: tm.typography_h2_fontFamily,
            fontWeight: parseInt(tm.typography_h2_fontWeight),
            fontSize: tm.typography_h2_fontSize
        },
        h3: {
            fontFamily: tm.typography_h3_fontFamily,
            fontWeight: parseInt(tm.typography_h3_fontWeight),
            fontSize: tm.typography_h3_fontSize
        },
        subtitle1: {
            fontFamily: tm.typography_subtitle1_fontFamily,
            fontWeight: parseInt(tm.typography_subtitle1_fontWeight),
            fontSize: tm.typography_subtitle1_fontSize
        },
        body1: {
            fontFamily: tm.typography_body1_fontFamily,
            fontWeight: parseInt(tm.typography_body1_fontWeight),
            fontSize: tm.typography_body1_fontSize
        },
        button: {
            fontFamily: tm.typography_button_fontFamily,
            fontWeight: parseInt(tm.typography_button_fontWeight),
            fontSize: tm.typography_button_fontSize,
            textTransform: tm.typography_button_textTransform as TextTransform
        }
    },
    zIndex: {
        appBar: zIndex.drawer + 1
    }
});

export default theme;
import { createTheme } from '@mui/material/styles';
import tm from './base/_theme.module.scss';
import zIndex from '@mui/material/styles/zIndex';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: tm.palette_primary_main,
            contrastText: tm.palette_primary_contrastText,
        },
        secondary: {
            main: tm.palette_secondary_main,
            contrastText: tm.palette_secondary_contrastText,
        },
        error: {
            main: tm.palette_error_main,
            contrastText: tm.palette_error_contrastText,
        },
        warning: {
            main: tm.palette_warning_main,
            contrastText: tm.palette_warning_contrastText,
        },
        info: {
            main: tm.palette_info_main,
            contrastText: tm.palette_info_contrastText,
        },
        success: {
            main: tm.palette_success_main,
            contrastText: tm.palette_success_contrastText,
        },
        text: {
            primary: tm.palette_text_primary,
            secondary: tm.palette_text_secondary,
            disabled: tm.palette_text_disabled,
        },
        grey: {
            50: tm.common_palette_grey_50,
            100: tm.common_palette_grey_100,
            200: tm.common_palette_grey_200,
            300: tm.common_palette_grey_300,
            400: tm.common_palette_grey_400,
            500: tm.common_palette_grey_500,
            600: tm.common_palette_grey_600,
            700: tm.common_palette_grey_700,
            800: tm.common_palette_grey_800,
            900: tm.common_palette_grey_900,
            A100: tm.common_palette_grey_A100,
            A200: tm.common_palette_grey_A200,
            A400: tm.common_palette_grey_A400,
            A700: tm.common_palette_grey_A700,
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
    shadows: [
        'none', tm.shadows_1,tm.shadows_2,tm.shadows_3,tm.shadows_4,
        tm.shadows_5,tm.shadows_6,tm.shadows_7,tm.shadows_8,tm.shadows_9,
        tm.shadows_10,tm.shadows_11,tm.shadows_12,tm.shadows_13,tm.shadows_14,
        tm.shadows_15,tm.shadows_16,tm.shadows_17,tm.shadows_18,tm.shadows_19,
        tm.shadows_20,tm.shadows_21,tm.shadows_22,tm.shadows_23,tm.shadows_24,
    ],
    shape: {
        borderRadius: parseInt(tm.shape_borderRadius),
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
        h4: {
            fontFamily: tm.typography_h4_fontFamily,
            fontWeight: parseInt(tm.typography_h4_fontWeight),
            fontSize: tm.typography_h4_fontSize
        },
        h5: {
            fontFamily: tm.typography_h5_fontFamily,
            fontWeight: parseInt(tm.typography_h5_fontWeight),
            fontSize: tm.typography_h5_fontSize
        },
        h6: {
            fontFamily: tm.typography_h6_fontFamily,
            fontWeight: parseInt(tm.typography_h6_fontWeight),
            fontSize: tm.typography_h6_fontSize
        },
        subtitle1: {
            fontFamily: tm.typography_subtitle1_fontFamily,
            fontWeight: parseInt(tm.typography_subtitle1_fontWeight),
            fontSize: tm.typography_subtitle1_fontSize
        },
        subtitle2: {
            fontFamily: tm.typography_subtitle2_fontFamily,
            fontWeight: parseInt(tm.typography_subtitle2_fontWeight),
            fontSize: tm.typography_subtitle2_fontSize
        },
        body1: {
            fontFamily: tm.typography_body1_fontFamily,
            fontWeight: parseInt(tm.typography_body1_fontWeight),
            fontSize: tm.typography_body1_fontSize
        },
        body2: {
            fontFamily: tm.typography_body2_fontFamily,
            fontWeight: parseInt(tm.typography_body2_fontWeight),
            fontSize: tm.typography_body2_fontSize
        },
        button: {
            fontFamily: tm.typography_button_fontFamily,
            fontWeight: parseInt(tm.typography_button_fontWeight),
            fontSize: tm.typography_button_fontSize
        },
        caption: {
            fontFamily: tm.typography_caption_fontFamily,
            fontWeight: parseInt(tm.typography_caption_fontWeight),
            fontSize: tm.typography_caption_fontSize
        },
        overline: {
            fontFamily: tm.typography_overline_fontFamily,
            fontWeight: parseInt(tm.typography_overline_fontWeight),
            fontSize: tm.typography_overline_fontSize
        }
    },
    zIndex: {
        appBar: zIndex.drawer + 1
    }
});

export default theme;
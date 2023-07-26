# 2-Utils

Purpose: define common functions, mixins, and style exports

## _functions.scss

Purpose: 

How to use:

```scss

.class {
    // set specific width
    width: breakpoints(md);

    // styling based on screen size
    @media (max-width: breakpoints(md)) {
        // styles to be applied for screensizes less than md
    }

    // use palette colors
    background-color: palette(primary, main);
    color: palette(text, secondary);

    // shadows
    box-shadow: shadows(5);

    border-radius: shape(borderRadius);
}

```

## _mixins.scss

Purpose

How to use:

```scss
// apply typography styling
@include typography(h3);
@use typography(h1);
```

## _theme.module.scss

Purpose: export style theme

How to use:

```ts
// import modules, assign name
import tm from './2-utils/_theme.module.scss';

// use theme variables
const temp = {
    main: tm.palette_primary_main,
    contrastText: tm.palette_primary_contrastText,
}
```
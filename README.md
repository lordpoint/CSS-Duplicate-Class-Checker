# CSS-Duplicate-Class-Checker

As a project gets larger, it can be easy to forget whether or not you already have a class for a particular set of styles. So you might end up creating multiple classes that do the same thing or applying the same styles with element selectors when you could just use an existing class. This script is designed to help prevent this by pointing out selectors and classes that apply the same styles.

The script takes a .css file as input and breaks it apart into a nested array of selectors and styles. It then alphabetizes the styles within each selector and then sorts the selectors (descending order) according to how many styles they specify before performing a (possibly overcomplicated) comparison to determine if any selectors specify the same styles.

so, for example, the following situation would be detected by this script:

```
.headline {
    background-color: #fff;
    color: #191919;
    font-size: 25px;
}

/* --- Hundreds more lines of CSS --- */

.article h1 {
    background-color: #fff;
    color: #191919;
    font-size: 25px;
}

```

*note* Classes and selectors that are defined within media queries are omitted from the script. This is for a number of reasons. Mostly because it doesn't seem useful.

# Cookie tracker

Keep an historical record of available cookies for a domain. Useful for debugging whether or not cookies are persistent
across a number of days/weeks. Helps non-technical users provide debugging information.

The history is stored in the browsers local storage - so a modern (IE9+) browser is required.

Using a custom data source it is possible to track changes to any data, not just cookies. See #HttpOnly Cookies for more info.

## Getting started

### 1. Installation

1. Checkout/download the files 
2. Browse to index.html
3. Keep coming back to the page to check for cookie changes

### Assumptions

* Cookie tracker is installed on the same domain (and path) that you wish to track cookies for
* Local storage is available and won't be deleted (i.e. on logout)

## Cookie filter

If you are only interested in tracking certain cookies, you can write a regular expression to match the cookie name.
This example will only match the _ga (Google Analtics) cookie:

```js
var history = new CookieHistory({
    url: null,
    filter: '^_ga$',
    onDataSuccess: function(){
        init(this);
    }
});
```

## HttpOnly Cookies

By default cookie-tracker only tracks cookies available to Javascript. If you would like to track HttpOnly cookies you
will need to provide cookie-tracker with a JSON endpoint instead.

Specify the URL in index.html:

```js
var history = new CookieHistory({
    url: 'http://www.example.com/session_cookies.php',
    filter: null,
    onDataSuccess: function(){
        init(this);
    }
});
```

Any JSON response will be tracked, so you can use this to track more than just cookies. Here is an example of what your
PHP script could look like:

```php
<?php

header('Content-Type: application/json');
echo json_encode(array(
  'cookies' => $_COOKIES,
  'sessionId' => session_id()
));
```
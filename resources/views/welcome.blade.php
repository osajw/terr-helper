<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="apple-touch-icon" sizes="180x180" href="./img/icons/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="./img/icons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="./img/icons/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="mask-icon" href="./img/icons/safari-pinned-tab.svg" color="#5bbad5">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-navbutton-color" content="#8bc34a">
        <meta name="theme-color" content="#8bc34a">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>Terr Helper</title>
    </head>
    <body>
        <div id="app"></div>
        <noscript>Please enable javascript...</noscript>
        <script src="{{ mix('/js/app.js') }}"></script>
    </body>
</html>

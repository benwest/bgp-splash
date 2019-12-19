## Bruce Gillingham Pollard Splash Animation

dist/splash.js is a universal module which should work with `require` or `import`. Or include it in a `<script>` tag and it will declare `BGPSplash` globally.

Usage:
```
BGPSplash({
    container: document.body,
    logoURL: 'path/to/logo.svg',
    videoURL: 'path/to/video.mp4',
    imageURL: 'path/to/fallback.jpg',
    onExitStart: function () {},
    onExitComplete: function () {}
})
```
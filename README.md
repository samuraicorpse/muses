<h1 align="center">Muses</h1>

<p align="center">
<img src="https://img.shields.io/badge/Typescript-^4.5.4-blue?logo=typescript"/>
<img src="https://img.shields.io/badge/Webpack-Yes-8DD6F9?logo=webpack"/>

Create a virtual *mixing console* to take control over your audio sources by adding channels to group all them to manage all the **audio-signals**.
</p>

***

## Support

This module use `AudioContext` feature to work properly. No need to worry, most modern browsers have support of this functionality. Also, remember that [electron](https://www.electronjs.org/) uses *Chromium* technology, so you can also use this package to develop your desktop apps.

Please see [this table](https://caniuse.com/?search=AudioContext) if you have any doubts about the support in the different browsers.

***

## Install

This package was designed to be supported in different frameworks (like [Webpack](https://webpack.js.org/) or any other module bundlers), but you can also just import it in your *HTML* file to start using it. 

### CDN

```html
<script src="//unpkg.com/@corpsemedia/muses/dist/muses.min.js"></script>
```

You can also download the full library from the [GitHub Repository](https://github.com/corpsemedia/muses/tree/main/dist) and then import it with the `<script>` tag in your project.

### NPM

```sh
npm install --save @corpsemedia/muses
```

### YARN

```sh
yarn add @corpsemedia/muses
```

***

## Usage


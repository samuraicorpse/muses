<p align="center">
  <img src="./thumbnail.jpg" style="max-height : 256px"/>
</p>

<h1 align="center">Muses</h1>

<p align="center">
<img src="https://img.shields.io/badge/Typescript-^4.5.4-blue?logo=typescript"/>
<img src="https://img.shields.io/badge/Webpack-Yes-8DD6F9?logo=webpack"/>
</p>

<p align="center">
Create a virtual <i>mixing console</i> to take control over your audio sources by adding channels to group all them to manage all the <b>audio-signals</b>.
</p>

***

## Support

This module uses `AudioContext` feature to work properly. No need to worry, most modern browsers have support of this functionality. Also, remember that [electron](https://www.electronjs.org/) uses *Chromium* technology, so you can also use this package to develop your desktop apps.

Please see [this table](https://caniuse.com/?search=AudioContext) if you have any doubts about the support in the different browsers.

***

## Live Test

See [this basic example of usage](https://rawcdn.githack.com/corpsemedia/muses/main/test.html) to test the module in your current browser by loading local files from your device and creating multiple channels.

***

## Installation

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

## Creating an AudioMixer

Let's import the library to connect an audio element to the *AudioMixer*.

### Standard JavaScript

```javascript
// You can use this example if you have imported the library via <script> tag.

// Create the mixer...
const mixer = muses.createAudioMixer( ) ;

// Add a channel with an optional ID...
const channel = mixer.addChannel( "main" ) ;

// Add an audio source from an existing HTMLAudioElement...
const audioElement = document.querySelector( "audio" ) ;
const track = channel.input( audioElement ) ;

// Create a new audio element automatically by providing an URL...
const track2 = channel.input( "./my-file.mp3" ) ;
```

### Module Import

```javascript
import { AudioMixer, createAudioMixer } from "@corpsemedia/muses" ;

const mixer = new AudioMixer( ) ;
// or
const mixer = createAudioMixer( ) ;

// Then you can just use the previous "Standard JavaScript" example.
```

## Using Controllers

Is pretty easy to use the *mixer*, but you need to understand that *channels* are the «real players», the *mixer* is just a way to keep all *channels* grouped for better organization, to send a final audio-signal to the speakers.

Like a basic AudioMixer in the real life, all channels have a few controllers to modify the audio signal: *Gain*, *Panning* and *Basic Equalization (Low, Mid and High)*

```javascript
// All connected audio-sources to the channel will be affected by the parameters in each controller.

channel.volume = 0.5 ; // <= 0 Silence, 1 Max Volume.

channel.panning = -1 ; // <= -1 Left, 1 Right, 0 Center.

// All equalization controllers can be changed between -40dB and 36dB (don't include "dB" string).
// WARNING: You can actually set a higher number, but it will only cause an annoying and distorted sound.
channel.lowEQ = 20 ; // <= Increase Low frequencies.
channel.midEQ = 0 ; // <= Reset Mid frequencies.
channel.highEQ = -40 ; // <= Remove High frequencies.
```

```javascript
// you can also modify the AudioMixer volume.
mixer.volume = 0.2 ;
```

***

## Documentation

To see the full documentation *(all classes, properties and methods)*, please visit the [official website](https://corpsemedia.github.io/muses).
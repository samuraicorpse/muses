<h1 align="center">Muses - Audio Mixing Module</h1>

<p align="center">
<img src="https://img.shields.io/badge/ES6-Supported-F7DF1E"/>
<img src="https://img.shields.io/badge/CommonJS-Supported-F7DF1E"/>
<!--img src="https://img.shields.io/node/v/muses-mixer"/-->
<img src="https://img.shields.io/badge/Typescript->=4.5.4-blue"/>
<img src="https://packagephobia.com/badge?p=muses-mixer"/>
<img src="https://badge.fury.io/js/muses-mixer.svg"/>
<img src="https://img.shields.io/npm/dm/muses-mixer"/>
<img src="https://img.shields.io/librariesio/release/npm/muses-mixer"/>
<!--img src="https://img.shields.io/librariesio/dependent-repos/npm/muses-mixer"/-->
<!--img src="https://img.shields.io/github/last-commit/samuraicorpse/muses"/-->
</p>

<p align="center">
Create <b>audio mixers</b> to group your audio sources into channels with basic controllers like <i>Volume</i>, <i>Panning</i> and <i>Basic EQ</i>.
</p>

## Table of Contents

- [Browsers Support](#browsers-support)
- [Live Test](#live-test)
- [Installation](#installation)
  * [CDN](#cdn)
  * [NPM](#npm)
  * [YARN](#yarn)
- [Autoplay Policy](#autoplay-policy)
- [Creating an AudioMixer](#creating-an-audiomixer)
  * [Standard JavaScript](#standard-javascript)
  * [Module Import](#module-import)
- [Using Controllers](#using-controllers)
- [Connecting A Microphone or Any Other StreamSource](#connecting-a-microphone-or-any-other-streamsource)
- [Connecting *External Sounds*](#connecting-external-sounds)
- [Adding Custom Effects and AudioNodes](#adding-custom-effects-and-audionodes)
  * [Manual Connection](#manual-connection)
  * [Using *Module-Solution*](#using-module-solution)
- [Documentation](#documentation)

***

## Browsers Support

This module uses `AudioContext` feature to work properly. No need to worry, most modern browsers have support of this functionality. Also, remember that [electron](https://www.electronjs.org/) uses *Chromium* technology, so you can also use this package to develop your desktop apps.

Please see [this table](https://caniuse.com/?search=AudioContext) if you have any doubts about the support in the different browsers.

***

## Live Test

See [this basic example of usage](https://rawcdn.githack.com/samuraicorpse/muses/main/test.html) to test the module in your current browser by loading local files from your device and creating multiple channels.

***

## Installation

This package was designed to be supported in different frameworks (like [Webpack](https://webpack.js.org/) or any other module bundlers), but you can also just import it in your *HTML* file to start using it. 

### CDN

```html
<script src="//unpkg.com/muses-mixer/dist/muses.min.js"></script>
```

You can also download the full library from the [GitHub Repository](https://github.com/samuraicorpse/muses/tree/main/dist) and then import it with the `<script>` tag in your project.

### NPM

```sh
npm install --save muses-mixer
```

### YARN

```sh
yarn add muses-mixer
```

***

## Autoplay Policy

Due to the constant change in web security, in some browsers, it's necessary to wait for the user to perform an action within the website in order to execute the *AudioContext* correctly.

There are two solutions to prevent the problem:

1. Don't create a [new mixer](#creating-an-audiomixer) automatically on page load.
2. Or, just call [.resumeContext()](https://samuraicorpse.github.io/muses/classes/AudioMixer.html#resumeContext) method before any *play-audio* function.

**Note:** This problem is common in *Chromium*-based browsers. However, it is important to take into account that it is a problem that can occur in other environments such as applications created in *Electron* or mobile applications.

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
import { AudioMixer, createAudioMixer } from "muses-mixer" ;

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

## Connecting A Microphone or Any Other StreamSource

Remember, this module uses `AudioContext` to work, so is really easy to connect any other audio source like a microphone input.

```javascript
// Prepare our mixer and channels first.
const mixer = muses.createAudioMixer( ) ;
const channel = mixer.addChannel( "mic" ) ;

// Now, let's request the microphone input with the getUserMedia API.
navigator
  .mediaDevices
  .getUserMedia( { video : false, audio : true } )
  .then( function( stream ) {
    // Using the audio-context from our mixer just to prevent any error.
    mic = mixer.ctx.createMediaStreamSource( stream ) ;
    // Connect to the channel.
    channel.input( mic ) ;
    // or
    mic.connect( channel.inputNode ) ;
  } )
  .catch( err => {
    console.error( "GET_MIC_STREAM_ERROR ~>", err ) ;
  } ) ;
```

We have included a little *async-function* just to get microphone stream-node quickly (basically the process of the previous example, just adding it into a `Promise`).

```javascript
muses
  .getMicStreamNode( )
  .then( streamNode => {
    channel.input( streamNode ) ;
  } )
  .catch( err => {
    console.error( "GET_MIC_STREAM_ERROR ~>", err ) ;
  } ) ;
```

You can try this feature in the [Live Test](#live-test) example.

***

## Connecting *External Sounds*

Many *audio-related* packages use the same structure, creating *AudioNodes* from the *AudioContext* and making connections to get an output signal. So, if the package provide a audio-node connection method, you can just use **channel.inputNode** property as an input for that connection method.

Let's see an example with [PizzicatoJS](https://www.npmjs.com/package/pizzicato) package.
```javascript
// First, import both pacakages (Muses and Pizzicato) only if you're using modules instead <script> tags in html.
import { createAudioMixer } from "muses-mixer" ;
import Pizzicato from "pizzicato" ;

// Create a mixer and a channel.
const mixer = muses.createAudioMixer( ) ;
const channel = mixer.addChannel( "main-channel" ) ;

// Create a sound from Pizzicato
var sound = new Pizzicato.Sound( { 
    source : 'file' ,
    options: { path: './audio/sound.wav' }
} , function( ) {
    console.log('sound file loaded!');
} ) ;

// Finally, connect the previous sound to the channel.
sound.connect( channel.inputNode ) ;

```

***

## Adding Custom Effects and AudioNodes

It is very easy to add new effects and nodes to the channels of our mixer, you just need to understand the connection structure between the channel and the mixer itself.

```
                      Channel                                         Mixer
┌──────────────────────────────────────────────────┐            ┌──────────────┐
│                                                  │            │              │
  ┌─────────┐   ┌────────────────┐    ┌──────────┐   ┌─────────┐   ┌─────────┐
  │inputNode├──►│BasicControllers├───►│outputNode├──►│delayNode├──►│inputNode│
  └─────────┘   │      Nodes     │    └──────────┘   └────▲────┘   └─────────┘
                └────────────────┘                        │
                                                     CustomEffect
```

As you can see, what is really important is the channel's `outputNode` and the mixer's `inputNode`. Just break the link between these two elements to introduce new `AudioNodes` between them.

**Tip:** If you're looking for *basic-effects* like **delay**, **distortion**, **compressor**, etc. I recommend to use [PizzicatoJS](https://www.npmjs.com/package/pizzicato), then, just connect the sounds to the mixer just like [this](#connecting-external-sounds)

### Manual Connection

```javascript
// [!] Rememeber to create your mixer and channels first.
// Create our delayNode from audio-context.
const delayNode = muses.getAudioContext( ).createDelay( 0.5 ) ;

// Disconnect channel-output from all receivers (eg. the mixer).
channel.outputNode.disconnect( ) ;
// Connect output to delayNode and delayNode's output to mixer's input.
channel.outputNode.connect( delayNode ) ;
delayNode.connect( mixer.inputNode ) ;

// Removing the node.
channel.outputNode.disconnect( delayNode ) ;
channel.outputNode.connect( mixer.inputNode ) ;
```

### Using *Module-Solution*

```javascript
// Just call one method in your channel instance.
channel.addNode( delayNode ) ;
// By default, the channel will re-connect all custom nodes for safety. But you can reset the nodes-connection with...
channel.reconnectNodes( ) ;

// Remove one custom-node ;
channel.removeNode( delayNode ) ;
// or
channel.removeAllNodes( ) ;
```

***

## Documentation

To see the full documentation *(all classes, properties and methods)*, please visit the [official website](https://samuraicorpse.github.io/muses).
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "audio-context"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAudioContext = exports.getMicStreamNode = exports.AudioTrack = exports.AudioChannel = exports.createAudioMixer = exports.AudioMixer = void 0;
    const audio_context_1 = __importDefault(require("audio-context"));
    /** Create a virtual mixing-console with audio channels */
    class AudioMixer {
        /**
         * Create a new AudioMixer instance.
         * @param {AudioContext} [audioContext] - A custom audio-context to connect the audio-mixer output signal. By default, muses will add a new AudioContext.
         * @returns {AudioMixer}
         * @example <caption>Standard JavaScript</caption>
         * ```javascript
         * const mixer = new muses.AudioMixer( ) ;
         * ```
         * @example <caption>TypeScript</caption>
         * ```typescript
         * const mixer : AudioMixer = new AudioMixer( ) ;
         * ```
         */
        constructor(audioContext) {
            /** All channels added to the current AudioMixer instance */
            this.channels = [];
            this.ctx = audioContext || (0, audio_context_1.default)();
            this.inputNode = this.ctx.createGain();
            this.inputNode.connect(this.ctx.destination);
        }
        /**
         * Add a new channel in the current AudioMixer.
         * @param {String} [id] - (Default) The current channel index.
         */
        addChannel(id) {
            const channel = new AudioChannel(this);
            channel.id = id || this.channels.length.toString();
            this.channels.push(channel);
            return channel;
        }
        /**
         * Look for a channel with a specific id.
         * @param id - The previous defined id on the addChannel( ) method call.
         */
        getChannel(id) {
            const i = this.channels.findIndex((c) => c.id === id);
            return this.channels[i] || null;
        }
        /** Modify the volume of the current mixer (from 0 to 1) */
        set volume(value) {
            this.inputNode.gain.value = value;
        }
        /** Get the current volume value of the mixer */
        get volume() {
            return this.inputNode.gain.value;
        }
    }
    exports.AudioMixer = AudioMixer;
    ;
    /**
     * Create a new audio-mixer to start adding channels with controllers (gain, panning and basic EQ).
     * @param {AudioContext} [context] - A custom audio-context to connect the audio-mixer output signal.
     *
     * @example <caption>Standard JavaScript</caption>
     * ```javascript
     * // Import muses globally with <script> tag in your HTML file.
     * // Then just use it in any script or file.
     * const mixer = muses.createAudioMixer( ) ;
     * ```
     * @example <caption>Module Import</caption>
     * ```javascript
     * import { createAudioMixer } from "@corpsemedia/muses" ;
     * const mixer = createAudioMixer( ) ;
     * ```
     * @returns {AudioMixer}
     */
    function createAudioMixer(context) {
        if (typeof context === "undefined") {
            context = (0, audio_context_1.default)();
        }
        return new AudioMixer(context);
    }
    exports.createAudioMixer = createAudioMixer;
    // CHANNEL [v] ;
    /**
     * The audio-channel class used to manage AudioMixer's channels.
     * Each channel have a few **basic controllers** (Volume, Panning and Basic EQ) to modify the audio-output of all the connected audio sources.
     */
    class AudioChannel {
        /**
         * Create a new AudioChannel to connect and take control over multiple audio sources.
         * @param mixingConsole - The parent AudioMixer instance.
         * @returns {AudioChannel}
         * @example <caption>Standard JavaScript</caption>
         * ```javascript
         * const mixer = muses.createAudioMixer( ) ;
         * const channel = new muses.AudioChannel( mixer ) ;
         * ```
         * @example <caption>TypeScript</caption>
         * ```javascript
         * const mixer : AudioMixer = createAudioMixer( ) ;
         * const channel : AudioChannel = new AudioChannel( mixer ) ;
         * // use it [v] ;
         * channel.input( $audioElement ) ;
         * channel.volume = 0.4 ;
         * channel.panning = -0.4 ;
         * ```
         */
        constructor(mixingConsole) {
            /** All the AudioTracks added to the current channel. **WARNING:** Other sources (like manual stream-source additions) will be not showed in this array, only *AudioTrack* instances added through *input()* method. */
            this.tracks = [];
            this.customNodes = [];
            /** The current channel id provided from AudioMixer instance */
            this.id = "N/A";
            this.mixer = mixingConsole;
            const ctx = this.mixer.ctx;
            this.inputNode = new GainNode(ctx, { gain: 1 });
            this.outputNode = new GainNode(ctx, { gain: 1 });
            this.gainNode = new GainNode(ctx, { gain: 1 });
            this.stereoPannerNode = new StereoPannerNode(ctx, { pan: 0 });
            this.LowEQNode = new BiquadFilterNode(ctx, { type: "lowshelf", Q: 1, gain: 0 });
            this.MidEQNode = new BiquadFilterNode(ctx, { type: "peaking", Q: 1, gain: 0 });
            this.HighEQNode = new BiquadFilterNode(ctx, { type: "highshelf", Q: 1, gain: 0 });
            // connect [v] ;
            this.inputNode
                .connect(this.LowEQNode)
                .connect(this.MidEQNode)
                .connect(this.HighEQNode)
                .connect(this.stereoPannerNode)
                .connect(this.gainNode)
                .connect(this.outputNode)
                .connect(mixingConsole.inputNode);
        }
        /**
         * Add a custom node or effect to the channel (in-order).
         * @param {AudioNode} customNode - The effect or audio node to connect between the channelOutputNode nad the mixerInputNode.
         */
        addNode(customNode) {
            this.customNodes.push(customNode);
            this.reconnectNodes();
        }
        /**
         * Remove an specific customNode from the channel's customNodes list and then reconnect all nodes.
         * @param {AudioNode} node - The previously added effect or audio node.
         */
        removeNode(node) {
            const i = this.customNodes.findIndex(n => n === node);
            if (i === -1) {
                throw new Error("Can\'t find out the provided customNode in the channel's customNodes list.");
            }
            this.customNodes.splice(i, 1);
            this.reconnectNodes();
        }
        /**
         * Remove all custom nodes from the channel and then reconnect the channel-output with the mixer-input.
         */
        removeAllNodes() {
            this.customNodes.splice(0, this.customNodes.length);
            this.reconnectNodes();
        }
        /**
         * Reconnect all custom nodes if you have added them previously (outputNode -> customNodes -> mixerInputNode).
         * If you don't have custom nodes added, this method will ensure the connection between the **channelOutputNode** and the **mixerInputNode**.
         */
        reconnectNodes() {
            this.volume = 0;
            this.outputNode.disconnect();
            try {
                if (this.customNodes.length <= 0) {
                    this.outputNode.connect(this.mixer.inputNode);
                }
                else {
                    const size = this.customNodes.length;
                    for (var i = 0; i < size; i++) {
                        this.customNodes[i].disconnect();
                        this.customNodes[i].connect(i >= (size - 1) ? this.mixer.inputNode : this.customNodes[i + 1]);
                    } // connect first node [v] ;
                    this.outputNode.connect(this.customNodes[0]);
                }
            }
            catch (ex) {
                console.error("CHANNEL_RECONNECT:NODES_eRROR ~>", ex);
                this.outputNode.disconnect();
                this.outputNode.connect(this.mixer.inputNode);
                throw ex;
            }
            finally {
                this.volume = 1;
            }
        }
        /**
         * Disconnect from the audio-context component used in the current channel's mixing-console.
         * @returns {AudioChannel} The current audio-channel instance.
         */
        disconnectFromContext() {
            this.outputNode.disconnect(this.mixer.ctx.destination);
            return this;
        }
        /**
         * Connect to the audio-context component (Generally used to hear it in the speakers)
         * @returns {AudioContext} The audio-context used in the current channel's mixing-console.
         */
        connectToContext() {
            this.outputNode.connect(this.mixer.ctx.destination);
            return this.mixer.ctx;
        }
        /**
         * Send outputNode signal to a custom AudioNode or AudioContext instance.
         * Warning: Be sure to disconnect the current audio-context or audio-node.
         * @returns {AudioChannel} The current channel instance.
         */
        connect(node) {
            this.outputNode.connect(node);
        }
        /**
         * Disconnect from one or all current AudioNode receivers.
         * @param {AudioContext|AudioNode} [node] - If is "undefined" the output-node will be disconnected from all receivers.
         */
        disconnect(node) {
            if (typeof node !== "undefined") {
                this.outputNode.disconnect(node);
            }
            else {
                this.outputNode.disconnect();
            }
        }
        /**
         * Connect a track to the current audio-channel instance.
         * @param {AudioTrack} track - The audio-track instance to connect processing nodes.
         * @returns {AudioChannel} - The current audio-channel instance.
         */
        addTrack(track) {
            track.output(this);
            return this;
        }
        /**
         * Add a new audio input from an audio-element, stream-source, media-source or create a new element by loading a file from a provided URL<string>
         * @param {MediaStreamAudioSourceNode|MediaElementAudioSourceNode|HTMLAudioElement|String|AudioTrack} source - An audio-element to create a new *AudioTrack* instance, an URL of the file to create that element automatically (Base64 supported) or the audio-node to connect directly into channel's *inputNode*
         */
        input(source) {
            if (source instanceof MediaStreamAudioSourceNode || source instanceof MediaElementAudioSourceNode) {
                return source.connect(this.inputNode);
            }
            if (source instanceof AudioTrack) {
                this.addTrack(source);
                return source;
            }
            const track = new AudioTrack(source, this.mixer.ctx);
            this.addTrack(track);
            return track;
        }
        /** Modify the Panning Effect (-1 Left, 1 Right, 0 Center) */
        set pan(value) {
            this.stereoPannerNode.pan.value = value;
        }
        /** Get the current Panning Effect value */
        get pan() {
            return this.stereoPannerNode.pan.value;
        }
        /** Modify the Gain of the current channel (from 0 to 1) */
        set volume(value) {
            this.gainNode.gain.value = value;
        }
        /** Get the current Gain value */
        get volume() {
            return this.gainNode.gain.value;
        }
        /**
         * Modify the low-EQ value of the current channel (from -40 to 36) dB
         * @param {number} value - from -40dB to 36dB
        */
        set lowEQ(value) {
            this.LowEQNode.gain.value = value;
        }
        /** Get the current low-EQ value */
        get lowEQ() {
            return this.LowEQNode.gain.value;
        }
        /**
         * Modify the mid-EQ value of the current channel (from -40 to 36) dB
         * @param {number} value - from -40dB to 36dB
        */
        set midEQ(value) {
            this.MidEQNode.gain.value = value;
        }
        /** Get the current mid-EQ value */
        get midEQ() {
            return this.MidEQNode.gain.value;
        }
        /**
         * Modify the high-EQ value of the current channel (from -40 to 36) dB
         * @param {number} value - from -40dB to 36dB
        */
        set highEQ(value) {
            this.HighEQNode.gain.value = value;
        }
        /** Get the current high-EQ value */
        get highEQ() {
            return this.HighEQNode.gain.value;
        }
        /** Mute output signal from the current channel */
        set muted(status) {
            this.outputNode.gain.value = status === true ? 0 : 1;
        }
        /** Check if the current channel is muted */
        get muted() {
            return this.outputNode.gain.value > 0 ? false : true;
        }
        /** Decrease volume smoothly until it is silent */
        fadeOut(ms = 2000) {
            const channel = this;
            if (typeof ms !== "number") {
                ms = 2000;
            }
            return new Promise((res, rej) => {
                const vpc = (2 / ms) * 10;
                const int = setInterval(() => {
                    if (channel.inputNode.gain.value <= 0) {
                        channel.inputNode.gain.value = 0;
                        clearInterval(int);
                        return res(true);
                    } // continue [v] ;
                    channel.inputNode.gain.value -= vpc;
                }, 2);
            });
        }
        /** Increase volume smoothly until it's in maximun input volume (this doesn't affect other features like "muted" or "volume" properties) */
        fadeIn(ms = 2000) {
            const channel = this;
            if (typeof ms !== "number") {
                ms = 2000;
            }
            return new Promise((res, rej) => {
                const vpc = (2 / ms) * 10;
                const int = setInterval(() => {
                    if (channel.inputNode.gain.value >= 1) {
                        channel.inputNode.gain.value = 1;
                        clearInterval(int);
                        return res(true);
                    } // continue [v] ;
                    channel.inputNode.gain.value += vpc;
                }, 2);
            });
        }
    }
    exports.AudioChannel = AudioChannel;
    ;
    // TRACK [v] ;
    /** Creates a new audio instance compatible with the AudioChannel class. Anyways, you will able to control the final audio-source<element> (playing, pause, loop, etc.)*/
    class AudioTrack {
        /**
         * Create a new audio-track from a audio-element or create a new one from an URL<stirng> (Base64 supported).
         *
         * **WARNING:** Local files with `file:///` protocol are not supported (cross-origin error). To load local files please load them with FileReader and convert them into *Base64*.
         *
         * @param {HTMLElement|String} audioSource
         * @returns {AudioTrack}
         * @example <caption>Connecting an Element</caption>
         * ```javascript
         * const el = document.querySelector( "audio" ) ;
         * channel.input( el, mixer.ctx ) ;
         * // or
         * const track = new AudioTrack( el ) ;
         * channel.input( track, myCustomAudioContext ) ;
         * ```
         * @example <caption>Loading from URL</caption>
         * ```javascript
         * const track1 = channel.input( "./my-file.mp3", mixer.ctx ) ;
         * // Base64 is supported.
         * const track2 = channel.input( "data:audio/mpeg;base64,...", mixer.ctx ) ;
         * ```
         */
        constructor(audioSource, audioContext) {
            if (typeof audioSource === "string") {
                const el = document.createElement("audio");
                el.src = audioSource;
                el.controls = false;
                el.volume = 1;
                el.load();
                audioSource = el;
            } // set [v] ;
            this.audioElement = audioSource;
            this.sourceNode = audioContext.createMediaElementSource(this.audioElement);
            this.sourceNode.disconnect();
        }
        /** Connect the track output to a channel input. */
        output(channel) {
            const connected = channel.tracks.findIndex((t) => t === this);
            if (connected !== -1) {
                return true;
            }
            this.sourceNode.disconnect();
            this.sourceNode.connect(channel.inputNode);
            channel.tracks.push(this);
        }
        /** Set the volume of the current track (from 0 to 1) */
        set volume(value) {
            this.audioElement.volume = value;
        }
        /** Get the volume of the current track (from 0 to 1) */
        get volume() {
            return this.audioElement.volume;
        }
        /** Enable/Disable the loop feature of the current track */
        set loop(status) {
            this.audioElement.loop = status;
        }
        /** Get loop status of the current track */
        get loop() {
            return this.audioElement.loop;
        }
        /** Enable/Disable the mute feature of the current track */
        set muted(status) {
            this.audioElement.muted = status;
        }
        /** Get mute status of the current track */
        get muted() {
            return this.audioElement.muted;
        }
        /** Set the current time (in seconds) in of the current track. Use this property to forward or backward the audio. */
        set time(seconds) {
            this.audioElement.currentTime = seconds;
        }
        /** Get the current time (in seconds) of the track. */
        get time() {
            return this.audioElement.currentTime;
        }
        /** Play the current audio from the last time value. Use stop() to start from the beginning or pause() to resume the audio. */
        play() {
            return this.audioElement.play();
        }
        /** Check if the current track is playing. */
        get playing() {
            return !this.audioElement.paused;
        }
        /** Check if the current track is paused. */
        get paused() {
            return this.audioElement.paused;
        }
        /** Pause the current audio and resume it with play() method. */
        pause() {
            return this.audioElement.pause();
        }
        /** Pause the current audio track and set time to 0, playing audio from the start again with play() method. */
        stop() {
            this.audioElement.pause();
            return this.audioElement.currentTime = 0;
        }
    }
    exports.AudioTrack = AudioTrack;
    ;
    // MIC STREAM [v] ;
    /**
     * Request the microphone audio-stream to connect with a mixer's channel.
     * **This method will request the user permission automatically.**
     * @returns {MediaStreamAudioSourceNode} - The final audio-node to connect with a mixer's channel.
     * @example <caption>Promise Based</caption>
     * ```javascript
     * muses
     *   .getMicStreamNode( )
     *   .then( streamNode => {
     *     channel.input( streamNode ) ;
     *   } )
     *   .catch( err => {
     *     console.error( "GET_MIC_STREAM_ERROR ~>", err ) ;
     *   } ) ;
     * ```
     * @example <caption>Async Call</caption>
     * ```javascript
     * const micNode = await muses.getMicStreamNode( ) ;
     * channel.input( micNode ) ;
     * ```
     */
    function getMicStreamNode() {
        return new Promise((res, rej) => {
            navigator
                .mediaDevices
                .getUserMedia({ video: false, audio: true })
                .then(function (stream) {
                const ctx = (0, audio_context_1.default)();
                const micNode = ctx.createMediaStreamSource(stream);
                return res(micNode);
            })
                .catch(err => {
                rej(err);
            });
        });
    }
    exports.getMicStreamNode = getMicStreamNode;
    /**
     * Get an audio-context instance.
     * @returns {AudioContext}
     */
    function getAudioContext() {
        return (0, audio_context_1.default)();
    }
    exports.getAudioContext = getAudioContext;
    // EXPORT [v] ;
    if (typeof window === "object") {
        window.muses = { AudioMixer, AudioChannel, AudioTrack, createAudioMixer, getMicStreamNode, getAudioContext };
    }
});

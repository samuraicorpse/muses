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
    exports.AudioTrack = exports.AudioChannel = exports.MixingConsole = void 0;
    const audio_context_1 = __importDefault(require("audio-context"));
    /** Create a virtual mixing-console with audio channels */
    class MixingConsole {
        constructor(audioContext) {
            /** All channels added to the current MixingConsole instance */
            this.channels = [];
            this.ctx = audioContext || (0, audio_context_1.default)();
        }
        /**
         * Add a new channel in the current MixingConsole.
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
    }
    exports.MixingConsole = MixingConsole;
    ;
    // CHANNEL [v] ;
    /** The channel class used to manage mixing-console's channels */
    class AudioChannel {
        constructor(mixingConsole) {
            this.tracks = [];
            /** The current channel id provided from MixingConsole instance */
            this.id = "N/A";
            this.console = mixingConsole;
            const ctx = this.console.ctx;
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
                .connect(ctx.destination);
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
        /** Add a new audio input from an audio-element or create it from an URL<string> */
        input(source) {
            if (source instanceof AudioTrack) {
                this.addTrack(source);
                return source;
            }
            const track = new AudioTrack(source, this.console.ctx);
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
        /** Modify the LowEQ value of the current channel (from -20 to 20) dB*/
        set lowEQ(value) {
            this.LowEQNode.gain.value = value;
        }
        /** Get the current low-EQ value */
        get lowEQ() {
            return this.LowEQNode.gain.value;
        }
        /** Modify the mid-EQ value of the current channel (from -20 to 20) dB*/
        set midEQ(value) {
            this.MidEQNode.gain.value = value;
        }
        /** Get the current mid-EQ value */
        get midEQ() {
            return this.MidEQNode.gain.value;
        }
        /** Modify the high-EQ value of the current channel (from -20 to 20) dB*/
        set highEQ(value) {
            this.HighEQNode.gain.value = value;
        }
        /** Get the current high-EQ value */
        get highEQ() {
            return this.HighEQNode.gain.value;
        }
    }
    exports.AudioChannel = AudioChannel;
    ;
    // TRACK [v] ;
    /** The audio class used to send output to the mixing-console's audio-channels */
    class AudioTrack {
        /**
         * Create a new audio-track from a audio-element or create a new one from an URL<stirng>.
         * @param {HTMLElement|String} audioSource
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
    // EXPORT [v] ;
    if (typeof window === "object") {
        window.muses = { MixingConsole, AudioChannel, AudioTrack };
    }
});

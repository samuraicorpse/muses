declare global {
    interface Window {
        muses: Object;
    }
}
/** Create a virtual mixing-console with audio channels */
export declare class AudioMixer {
    /** The audio-context instance used to process audio. */
    ctx: AudioContext;
    /** All channels added to the current AudioMixer instance */
    channels: AudioChannel[];
    /** The node to control the mixer output volume */
    gainNode: GainNode;
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
    constructor(audioContext?: AudioContext);
    /**
     * Add a new channel in the current AudioMixer.
     * @param {String} [id] - (Default) The current channel index.
     */
    addChannel(id?: string): AudioChannel;
    /**
     * Look for a channel with a specific id.
     * @param id - The previous defined id on the addChannel( ) method call.
     */
    getChannel(id: string): AudioChannel | null;
    /** Modify the volume of the current mixer (from 0 to 1) */
    set volume(value: number);
    /** Get the current volume value of the mixer */
    get volume(): number;
}
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
export declare function createAudioMixer(context?: AudioContext): AudioMixer;
/**
 * The audio-channel class used to manage AudioMixer's channels.
 * Each channel have a few **basic controllers** (Volume, Panning and Basic EQ) to modify the audio-output of all the connected audio sources.
 */
export declare class AudioChannel {
    inputNode: GainNode;
    outputNode: GainNode;
    tracks: AudioTrack[];
    gainNode: GainNode;
    LowEQNode: BiquadFilterNode;
    MidEQNode: BiquadFilterNode;
    HighEQNode: BiquadFilterNode;
    stereoPannerNode: StereoPannerNode;
    private mixer;
    /** The current channel id provided from AudioMixer instance */
    id: string;
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
    constructor(mixingConsole: AudioMixer);
    /**
     * Disconnect from the audio-context component used in the current channel's mixing-console.
     * @returns {AudioChannel} The current audio-channel instance.
     */
    disconnectFromContext(): AudioChannel;
    /**
     * Connect to the audio-context component (Generally used to hear it in the speakers)
     * @returns {AudioContext} The audio-context used in the current channel's mixing-console.
     */
    connectToContext(): AudioContext;
    /**
     * Send outputNode signal to a custom AudioNode or AudioContext instance.
     * Warning: Be sure to disconnect the current audio-context or audio-node.
     * @returns {AudioChannel} The current channel instance.
     */
    connect(node: AudioContext | AudioNode): void;
    /**
     * Disconnect from one or all current AudioNode receivers.
     * @param {AudioContext|AudioNode} [node] - If is "undefined" the output-node will be disconnected from all receivers.
     */
    disconnect(node?: AudioContext | AudioNode): void;
    /**
     * Connect a track to the current audio-channel instance.
     * @param {AudioTrack} track - The audio-track instance to connect processing nodes.
     * @returns {AudioChannel} - The current audio-channel instance.
     */
    addTrack(track: AudioTrack): AudioChannel;
    /** Add a new audio input from an audio-element or create it from an URL<string> */
    input(source: HTMLAudioElement | String | AudioTrack): AudioTrack;
    /** Modify the Panning Effect (-1 Left, 1 Right, 0 Center) */
    set pan(value: number);
    /** Get the current Panning Effect value */
    get pan(): number;
    /** Modify the Gain of the current channel (from 0 to 1) */
    set volume(value: number);
    /** Get the current Gain value */
    get volume(): number;
    /**
     * Modify the low-EQ value of the current channel (from -40 to 36) dB
     * @param {number} value - from -40dB to 36dB
    */
    set lowEQ(value: number);
    /** Get the current low-EQ value */
    get lowEQ(): number;
    /**
     * Modify the mid-EQ value of the current channel (from -40 to 36) dB
     * @param {number} value - from -40dB to 36dB
    */
    set midEQ(value: number);
    /** Get the current mid-EQ value */
    get midEQ(): number;
    /**
     * Modify the high-EQ value of the current channel (from -40 to 36) dB
     * @param {number} value - from -40dB to 36dB
    */
    set highEQ(value: number);
    /** Get the current high-EQ value */
    get highEQ(): number;
    /** Mute output signal from the current channel */
    set muted(status: boolean);
    /** Check if the current channel is muted */
    get muted(): boolean;
    /** Decrease volume smoothly until it is silent */
    fadeOut(ms?: number): Promise<boolean>;
    /** Increase volume smoothly until it's in maximun input volume (this doesn't affect other features like "muted" or "volume" properties) */
    fadeIn(ms?: number): Promise<boolean>;
}
/** Creates a new audio instance compatible with the AudioChannel class. Anyways, you will able to control the final audio-source<element> (playing, pause, loop, etc.)*/
export declare class AudioTrack {
    audioElement: HTMLAudioElement;
    sourceNode: MediaElementAudioSourceNode;
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
    constructor(audioSource: HTMLAudioElement | String, audioContext: AudioContext);
    /** Connect the track output to a channel input. */
    output(channel: AudioChannel): true | undefined;
    /** Set the volume of the current track (from 0 to 1) */
    set volume(value: number);
    /** Get the volume of the current track (from 0 to 1) */
    get volume(): number;
    /** Enable/Disable the loop feature of the current track */
    set loop(status: boolean);
    /** Get loop status of the current track */
    get loop(): boolean;
    /** Enable/Disable the mute feature of the current track */
    set muted(status: boolean);
    /** Get mute status of the current track */
    get muted(): boolean;
    /** Set the current time (in seconds) in of the current track. Use this property to forward or backward the audio. */
    set time(seconds: number);
    /** Get the current time (in seconds) of the track. */
    get time(): number;
    /** Play the current audio from the last time value. Use stop() to start from the beginning or pause() to resume the audio. */
    play(): Promise<void>;
    /** Check if the current track is playing. */
    get playing(): boolean;
    /** Check if the current track is paused. */
    get paused(): boolean;
    /** Pause the current audio and resume it with play() method. */
    pause(): void;
    /** Pause the current audio track and set time to 0, playing audio from the start again with play() method. */
    stop(): number;
}
//# sourceMappingURL=index.d.ts.map
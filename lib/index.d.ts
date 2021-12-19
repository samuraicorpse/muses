declare global {
    interface Window {
        muses: Object;
    }
}
/** Create a virtual mixing-console with audio channels */
export declare class MixingConsole {
    /** The audio-context instance used to process audio. */
    ctx: AudioContext;
    /** All channels added to the current MixingConsole instance */
    channels: AudioChannel[];
    constructor(audioContext: AudioContext);
    /**
     * Add a new channel in the current MixingConsole.
     * @param {String} [id] - (Default) The current channel index.
     */
    addChannel(id?: string): AudioChannel;
    /**
     * Look for a channel with a specific id.
     * @param id - The previous defined id on the addChannel( ) method call.
     */
    getChannel(id: string): AudioChannel | null;
}
/** The channel class used to manage mixing-console's channels */
export declare class AudioChannel {
    tracks: AudioTrack[];
    console: MixingConsole;
    inputNode: AudioNode;
    outputNode: AudioNode;
    gainNode: GainNode;
    stereoPannerNode: StereoPannerNode;
    LowEQNode: BiquadFilterNode;
    MidEQNode: BiquadFilterNode;
    HighEQNode: BiquadFilterNode;
    /** The current channel id provided from MixingConsole instance */
    id: string;
    constructor(mixingConsole: MixingConsole);
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
    /** Modify the LowEQ value of the current channel (from -20 to 20) dB*/
    set lowEQ(value: number);
    /** Get the current low-EQ value */
    get lowEQ(): number;
    /** Modify the mid-EQ value of the current channel (from -20 to 20) dB*/
    set midEQ(value: number);
    /** Get the current mid-EQ value */
    get midEQ(): number;
    /** Modify the high-EQ value of the current channel (from -20 to 20) dB*/
    set highEQ(value: number);
    /** Get the current high-EQ value */
    get highEQ(): number;
}
/** The audio class used to send output to the mixing-console's audio-channels */
export declare class AudioTrack {
    audioElement: HTMLAudioElement;
    sourceNode: MediaElementAudioSourceNode;
    /**
     * Create a new audio-track from a audio-element or create a new one from an URL<stirng>.
     * @param {HTMLElement|String} audioSource
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
    /** Pause the current audio and resume it with play() method. */
    pause(): void;
    /** Pause the current audio track and set time to 0, playing audio from the start again with play() method. */
    stop(): number;
}
//# sourceMappingURL=index.d.ts.map
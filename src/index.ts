import AudioContext from "audio-context" ;

declare global {
  interface Window { muses : Object ; }
}

/** Create a virtual mixing-console with audio channels */
export class MixingConsole {
  /** The audio-context instance used to process audio. */
  ctx : AudioContext ;
  /** All channels added to the current MixingConsole instance */
  channels : AudioChannel[ ] = [ ] ;

  constructor( audioContext : AudioContext ) {
    this.ctx = audioContext || <AudioContext>AudioContext( ) ;
  }

  /**
   * Add a new channel in the current MixingConsole.
   * @param {String} [id] - (Default) The current channel index.
   */
  addChannel( id? : string ) : AudioChannel {
    const channel = new AudioChannel( this ) ;
    channel.id = id || this.channels.length.toString( ) ;
    this.channels.push( channel ) ;
    return channel ;
  }

  /**
   * Look for a channel with a specific id.
   * @param id - The previous defined id on the addChannel( ) method call.
   */
  getChannel( id : string ) : AudioChannel | null {
    const i = this.channels.findIndex( ( c ) => c.id === id ) ;
    return this.channels[ i ] || null ;
  }
} ;

// CHANNEL [v] ;

/** The channel class used to manage mixing-console's channels */
export class AudioChannel {
  tracks     : AudioTrack[ ] = [ ] ;
  console    : MixingConsole ;
  inputNode  : GainNode ;
  outputNode : GainNode ;
  gainNode   : GainNode ;
  stereoPannerNode : StereoPannerNode ;
  LowEQNode  : BiquadFilterNode ;
  MidEQNode  : BiquadFilterNode ;
  HighEQNode : BiquadFilterNode ;

  /** The current channel id provided from MixingConsole instance */
  id : string = "N/A" ;

  constructor( mixingConsole : MixingConsole ) {
    this.console = mixingConsole ;
    const ctx = this.console.ctx ;
    this.inputNode = new GainNode( ctx, { gain : 1 } ) ;
    this.outputNode = new GainNode( ctx, { gain : 1 } ) ;
    this.gainNode = new GainNode( ctx, { gain : 1 } ) ;
    this.stereoPannerNode = new StereoPannerNode( ctx, { pan : 0 } ) ;
    this.LowEQNode  = new BiquadFilterNode( ctx, { type : "lowshelf", Q : 1, gain : 0 } ) ;
    this.MidEQNode  = new BiquadFilterNode( ctx, { type : "peaking", Q : 1, gain : 0 } ) ;
    this.HighEQNode = new BiquadFilterNode( ctx, { type : "highshelf", Q : 1, gain : 0 } ) ;
    // connect [v] ;
    this.inputNode
      .connect( this.LowEQNode  )
      .connect( this.MidEQNode  )
      .connect( this.HighEQNode )
      .connect( this.stereoPannerNode )
      .connect( this.gainNode   )
      .connect( this.outputNode )
      .connect( ctx.destination ) ;
  }

  /**
   * Disconnect from the audio-context component used in the current channel's mixing-console.
   * @returns {AudioChannel} The current audio-channel instance.
   */
  disconnectFromContext( ) : AudioChannel {
    this.outputNode.disconnect( this.console.ctx.destination ) ;
    return this ;
  }

  /** 
   * Connect to the audio-context component (Generally used to hear it in the speakers) 
   * @returns {AudioContext} The audio-context used in the current channel's mixing-console.
   */
  connectToContext( ) : AudioContext {
    this.outputNode.connect( this.console.ctx.destination ) ;
    return this.console.ctx ;
  }

  /**
   * Send outputNode signal to a custom AudioNode or AudioContext instance.
   * Warning: Be sure to disconnect the current audio-context or audio-node.
   * @returns {AudioChannel} The current channel instance.
   */
  connect( node : AudioContext | AudioNode ) {
    this.outputNode.connect( <AudioNode>node ) ;
  }


  /**
   * Disconnect from one or all current AudioNode receivers.
   * @param {AudioContext|AudioNode} [node] - If is "undefined" the output-node will be disconnected from all receivers.
   */
  disconnect( node? : AudioContext | AudioNode ) {
    if( typeof node !== "undefined" ) {
      this.outputNode.disconnect( <AudioNode>node ) ;
    } else {
      this.outputNode.disconnect( ) ;
    }
  }

  /**
   * Connect a track to the current audio-channel instance.
   * @param {AudioTrack} track - The audio-track instance to connect processing nodes.
   * @returns {AudioChannel} - The current audio-channel instance.
   */
  addTrack( track : AudioTrack ) : AudioChannel {
    track.output( this ) ;
    return this ;
  }

  /** Add a new audio input from an audio-element or create it from an URL<string> */
  input( source : HTMLAudioElement | String | AudioTrack ) : AudioTrack {
    if( source instanceof AudioTrack ) { this.addTrack( source ) ; return source ; }
    const track = new AudioTrack( source, this.console.ctx ) ;
    this.addTrack( track ) ;
    return track ;
  }

  /** Modify the Panning Effect (-1 Left, 1 Right, 0 Center) */
  set pan( value : number ) {
    this.stereoPannerNode.pan.value = value ;
  }

  /** Get the current Panning Effect value */
  get pan( ) : number {
    return this.stereoPannerNode.pan.value ;
  }

  /** Modify the Gain of the current channel (from 0 to 1) */
  set volume( value : number ) {
    this.gainNode.gain.value = value ;
  }

  /** Get the current Gain value */
  get volume( ) : number {
    return this.gainNode.gain.value ;
  }

  /** 
   * Modify the low-EQ value of the current channel (from -40 to 36) dB
   * @param {number} value - from -40dB to 36dB
  */
  set lowEQ( value : number ) {
    this.LowEQNode.gain.value = value ;
  }

  /** Get the current low-EQ value */
  get lowEQ( ) : number {
    return this.LowEQNode.gain.value ;
  } 

  /** 
   * Modify the mid-EQ value of the current channel (from -40 to 36) dB
   * @param {number} value - from -40dB to 36dB
  */
  set midEQ( value : number ) {
    this.MidEQNode.gain.value = value ;
  }

  /** Get the current mid-EQ value */
  get midEQ( ) : number {
    return this.MidEQNode.gain.value ;
  } 

  /** 
   * Modify the high-EQ value of the current channel (from -40 to 36) dB
   * @param {number} value - from -40dB to 36dB
  */
  set highEQ( value : number ) {
    this.HighEQNode.gain.value = value ;
  }

  /** Get the current high-EQ value */
  get highEQ( ) : number {
    return this.HighEQNode.gain.value ;
  }

  /** Mute output signal from the current channel */
  set muted( status : boolean ) {
    this.outputNode.gain.value = status === true ? 0 : 1 ;
  }

  /** Check if the current channel is muted */
  get muted( ) : boolean {
    return this.outputNode.gain.value > 0 ? false : true ;
  }

  /** Decrease volume smoothly until it is silent */
  fadeOut( ms : number = 2000 ) : Promise<boolean> {
    const channel = this ;
    if( typeof ms !== "number" ) { ms = 2000 ; }
    return new Promise( ( res, rej ) => {
      const vpc : number = ( 2 / ms ) * 10 ;
      const int = setInterval( ( ) => {
        if( channel.inputNode.gain.value <= 0 ) {
          channel.inputNode.gain.value = 0 ;
          clearInterval( int ) ;
          return res( true ) ;
        } // continue [v] ;
        channel.inputNode.gain.value -= vpc ;
      } , 2 ) ;
    } ) ;
  }

  /** Increase volume smoothly until it's in maximun input volume (this doesn't affect other features like "muted" or "volume" properties) */
  fadeIn( ms : number = 2000 ) : Promise<boolean> {
    const channel = this ;
    if( typeof ms !== "number" ) { ms = 2000 ; }
    return new Promise( ( res, rej ) => {
      const vpc : number = ( 2 / ms ) * 10 ;
      const int = setInterval( ( ) => {
        if( channel.inputNode.gain.value >= 1 ) {
          channel.inputNode.gain.value = 1 ;
          clearInterval( int ) ;
          return res( true ) ;
        } // continue [v] ;
        channel.inputNode.gain.value += vpc ;
      } , 2 ) ;
    } ) ;
  }
} ;

// TRACK [v] ;

/** The audio class used to send output to the mixing-console's audio-channels */
export class AudioTrack {
  /* The current HTMLAudioElement used to play and have control over the audio. */
  audioElement : HTMLAudioElement ;
  sourceNode   : MediaElementAudioSourceNode ;

  /**
   * Create a new audio-track from a audio-element or create a new one from an URL<stirng> (Base64 supported).
   * @param {HTMLElement|String} audioSource
   */
  constructor( audioSource : HTMLAudioElement | String, audioContext : AudioContext ) {
    if( typeof audioSource === "string" ) {
      const el = document.createElement( "audio" ) ;
      el.src = audioSource ;
      el.controls = false ;
      el.volume = 1 ;
      el.load( ) ;
      audioSource = el ;
    } // set [v] ;
    this.audioElement = <HTMLAudioElement>audioSource ;
    this.sourceNode = audioContext.createMediaElementSource( this.audioElement ) ;
    this.sourceNode.disconnect( ) ;
  }

  /** Connect the track output to a channel input. */
  output( channel : AudioChannel ) {
    const connected = channel.tracks.findIndex( ( t ) => t === this ) ;
    if( connected !== -1 ) { return true ; }
    this.sourceNode.disconnect( ) ;
    this.sourceNode.connect( channel.inputNode ) ;
    channel.tracks.push( this ) ;
  }

  /** Set the volume of the current track (from 0 to 1) */
  set volume( value : number ) {
    this.audioElement.volume = value ;
  }

  /** Get the volume of the current track (from 0 to 1) */
  get volume( ) : number {
    return this.audioElement.volume ;
  }

  /** Enable/Disable the loop feature of the current track */
  set loop( status : boolean ) {
    this.audioElement.loop = status ;
  }

  /** Get loop status of the current track */
  get loop( ) : boolean {
    return this.audioElement.loop ;
  }

  /** Enable/Disable the mute feature of the current track */
  set muted( status : boolean ) {
    this.audioElement.muted = status ;
  }

  /** Get mute status of the current track */
  get muted( ) : boolean {
    return this.audioElement.muted ;
  }

  /** Set the current time (in seconds) in of the current track. Use this property to forward or backward the audio. */
  set time( seconds : number ) {
    this.audioElement.currentTime = seconds ;
  }

  /** Get the current time (in seconds) of the track. */
  get time( ) : number {
    return this.audioElement.currentTime ;
  }

  /** Play the current audio from the last time value. Use stop() to start from the beginning or pause() to resume the audio. */
  play( ) {
    return this.audioElement.play( ) ;
  }

  /** Check if the current track is playing. */
  get playing( ) {
    return !this.audioElement.paused ;
  }

  /** Check if the current track is paused. */
  get paused( ) {
    return this.audioElement.paused ;
  }

  /** Pause the current audio and resume it with play() method. */
  pause( ) {
    return this.audioElement.pause( ) ;
  }
  
  /** Pause the current audio track and set time to 0, playing audio from the start again with play() method. */
  stop( ) {
    this.audioElement.pause( ) ;
    return this.audioElement.currentTime = 0 ;
  }
} ;

// EXPORT [v] ;
if( typeof window === "object" ) {
  window.muses = { MixingConsole, AudioChannel, AudioTrack } ;
}
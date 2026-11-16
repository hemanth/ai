/**
 * Deterministic MockAudioContext & MockMediaStream Test Doubles
 * Simulates Web Audio API and MediaStream for zero-hardware microphone capture testing.
 */

export class MockMediaStreamTrack {
  constructor(kind = 'audio') {
    this.kind = kind;
    this.enabled = true;
    this.readyState = 'live';
  }

  stop() {
    this.readyState = 'ended';
  }
}

export class MockMediaStream {
  constructor() {
    this._tracks = [new MockMediaStreamTrack('audio')];
  }

  getTracks() {
    return [...this._tracks];
  }

  getAudioTracks() {
    return this._tracks.filter(t => t.kind === 'audio');
  }

  stop() {
    for (const track of this._tracks) {
      track.stop();
    }
  }
}

export class MockScriptProcessor {
  constructor(bufferSize = 4096, inputChannels = 1, outputChannels = 1) {
    this.bufferSize = bufferSize;
    this.inputChannels = inputChannels;
    this.outputChannels = outputChannels;
    this.onaudioprocess = null;
    this.connected = false;
  }

  connect(destination) {
    this.connected = true;
    this.destination = destination;
  }

  disconnect() {
    this.connected = false;
    this.destination = null;
  }

  /**
   * Helper to simulate audio hardware feeding PCM float32 buffers
   * @param {Float32Array} pcmData
   */
  simulateAudio(pcmData = new Float32Array(this.bufferSize)) {
    if (!this.onaudioprocess) return;
    const event = {
      inputBuffer: {
        getChannelData: (ch = 0) => pcmData,
        sampleRate: 16000,
        length: pcmData.length,
      },
    };
    this.onaudioprocess(event);
  }
}

export class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 16000;
    this.destination = {};
    this.audioWorklet = {
      addModule: async () => true,
    };
  }

  async resume() {
    this.state = 'running';
    return true;
  }

  async suspend() {
    this.state = 'suspended';
    return true;
  }

  async close() {
    this.state = 'closed';
    return true;
  }

  createMediaStreamSource(stream) {
    return {
      stream,
      connect: (dest) => dest,
      disconnect: () => {},
    };
  }

  createScriptProcessor(bufferSize = 4096, inChannels = 1, outChannels = 1) {
    return new MockScriptProcessor(bufferSize, inChannels, outChannels);
  }
}

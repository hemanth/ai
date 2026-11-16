/**
 * Deterministic MockSpeechRecognition Test Double
 * Implements Web Speech API SpeechRecognition interface for offline testing.
 */

export class MockSpeechRecognition {
  constructor() {
    this.continuous = true;
    this.interimResults = true;
    this.lang = 'kn-IN';
    this.maxAlternatives = 1;
    this.isStarted = false;

    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;

    this._listeners = new Map();
  }

  addEventListener(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
  }

  removeEventListener(event, handler) {
    if (this._listeners.has(event)) {
      this._listeners.get(event).delete(handler);
    }
  }

  dispatchEvent(event, data) {
    const handlers = this._listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  start() {
    this.isStarted = true;
    queueMicrotask(() => {
      if (this.onstart) this.onstart();
      this.dispatchEvent('start', {});
    });
  }

  stop() {
    this.isStarted = false;
    queueMicrotask(() => {
      if (this.onend) this.onend();
      this.dispatchEvent('end', {});
    });
  }

  abort() {
    this.isStarted = false;
    queueMicrotask(() => {
      if (this.onend) this.onend();
      this.dispatchEvent('end', {});
    });
  }

  /**
   * Helper for tests to simulate streaming speech recognition results
   * @param {string} transcript
   * @param {boolean} isFinal
   */
  emitResult(transcript, isFinal = false) {
    const item = { transcript, confidence: 0.98 };
    const speechResult = [item];
    speechResult.isFinal = isFinal;

    const results = [speechResult];
    const event = {
      resultIndex: 0,
      results,
    };

    if (this.onresult) this.onresult(event);
    this.dispatchEvent('result', event);
  }

  /**
   * Helper for tests to simulate speech errors (e.g. 'not-allowed', 'network')
   * @param {string} error
   */
  emitError(error = 'no-speech') {
    const event = { error };
    if (this.onerror) this.onerror(event);
    this.dispatchEvent('error', event);
  }

  /**
   * Helper for tests to simulate speech end event
   */
  emitEnd() {
    this.isStarted = false;
    if (this.onend) this.onend();
    this.dispatchEvent('end', {});
  }
}

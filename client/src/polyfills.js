// Create the readable state
const READABLE_STATE = {
  reading: false,
  ended: false,
  endEmitted: false,
  length: 0,
  flowing: null,
  needReadable: false,
  emittedReadable: false,
  readableListening: false,
  resumeScheduled: false,
  paused: true,
  destroyed: false,
  decoder: null,
  encoding: null,
  buffer: { head: null, tail: null, length: 0 },
  pipes: [],
  pipesCount: 0,
  awaitDrain: 0,
  readingMore: false,
  objectMode: false,
  defaultEncoding: 'utf8',
  constructed: true,
  sync: true,
  emitClose: true
};

// Create base stream implementation
class Stream {
  constructor() {
    this._readableState = READABLE_STATE;
    this.readable = true;
    this._events = {};
  }

  read() { return null; }
  push() { return true; }
  pipe() { return this; }
  on() { return this; }
  emit() { return false; }
  pause() { return this; }
  resume() { return this; }
  destroy() { return this; }
}

// Create stream instance
const STREAM = new Stream();

// Ensure stream methods are bound
Object.getOwnPropertyNames(Stream.prototype).forEach(key => {
  if (typeof STREAM[key] === 'function') {
    STREAM[key] = STREAM[key].bind(STREAM);
  }
});

if (typeof window !== 'undefined') {
  // Create or get process object
  if (!window.process) {
    window.process = {};
  }

  // Create process with stream implementation
  const processObj = {
    env: { NODE_ENV: 'development' },
    nextTick: fn => setTimeout(fn, 0),
    browser: true,
    title: 'browser',
    stdout: STREAM,
    stderr: STREAM,
    stdin: STREAM
  };

  // Add stream methods to process
  Object.getOwnPropertyNames(Stream.prototype).forEach(key => {
    if (typeof STREAM[key] === 'function') {
      processObj[key] = STREAM[key];
    }
  });

  // Define non-configurable _readableState
  Object.defineProperty(processObj, '_readableState', {
    value: READABLE_STATE,
    writable: false,
    configurable: false,
    enumerable: true
  });

  // Replace process object
  window.process = processObj;

  // Add global error handlers
  window.addEventListener('error', (event) => {
    if (event.error?.stack?.includes('emitReadable_') || 
        event.error?.message?.includes('_readableState')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Add readable-stream polyfill
  if (!window.Stream) {
    window.Stream = Stream;
  }
  
  // Polyfill stream module
  if (!window.stream) {
    window.stream = {
      Stream,
      Readable: Stream,
      Writable: Stream,
      Duplex: Stream,
      Transform: Stream,
      PassThrough: Stream
    };
  }
} 
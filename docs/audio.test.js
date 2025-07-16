const { initAudio } = require('./audio');

class MockAudioContext {
  constructor() {
    this.createMediaStreamSource = jest.fn().mockReturnValue({
      connect: jest.fn()
    });
    this.createAnalyser = jest.fn().mockReturnValue({});
  }
}
global.AudioContext = MockAudioContext;

beforeAll(() => {
  global.navigator = {
    mediaDevices: {
      getUserMedia: jest.fn().mockResolvedValue({})
    }
  };
});

describe('Audio Initialization', () => {
  it('initializes AudioContext', () => {
    const audio = initAudio();
    expect(audio.context).toBeInstanceOf(MockAudioContext);
  });
});

describe('Audio Setup', () => {
  it('sets up microphone input', async () => {
    const audio = initAudio();
    await audio.setupMic();
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(audio.context.createMediaStreamSource).toHaveBeenCalled();
    expect(audio.context.createAnalyser).toHaveBeenCalled();
    expect(audio.source).toBeDefined();
    expect(audio.analyser).toBeDefined();
  });
  it('gets frequency data', () => {
    const audio = initAudio();
    audio.analyser = { getByteFrequencyData: jest.fn() };
    audio.dataArray = new Uint8Array(128);
    audio.getFrequencyData();
    expect(audio.analyser.getByteFrequencyData).toHaveBeenCalledWith(audio.dataArray);
  });
}); 
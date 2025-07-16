function initAudio() {
  const context = new AudioContext();
  const audio = {
    context,
    async setupMic() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audio.source = context.createMediaStreamSource(stream);
      audio.analyser = context.createAnalyser();
      audio.source.connect(audio.analyser);
      audio.analyser.fftSize = 256;
      audio.dataArray = new Uint8Array(audio.analyser.frequencyBinCount);
    },
    getFrequencyData() {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
  };
  return audio;
}

module.exports = { initAudio }; 
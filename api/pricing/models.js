// GET /api/pricing/models
// Feeds the LLM / STT / TTS dropdowns in the pricing calculator.
// TODO: replace with real, current rate-card data (and keep it in sync
// with whatever /api/pricing/quotes actually bills against).
module.exports = (req, res) => {
  res.status(200).json({
    llm: [
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', route: 'OpenAI', inputPer1k: 0.00015, outputPer1k: 0.0006 },
      { id: 'gpt-4o', name: 'GPT-4o', route: 'OpenAI', inputPer1k: 0.0025, outputPer1k: 0.01 },
      { id: 'claude-sonnet', name: 'Claude Sonnet', route: 'Anthropic', inputPer1k: 0.003, outputPer1k: 0.015 },
    ],
    stt: [
      { id: 'deepgram-nova', name: 'Nova 2', provider: 'Deepgram', perMinute: 0.0043 },
      { id: 'whisper', name: 'Whisper', provider: 'OpenAI', perMinute: 0.006 },
    ],
    tts: [
      { id: 'elevenlabs-turbo', name: 'ElevenLabs Turbo', perThousandChars: 0.18 },
      { id: 'openai-tts', name: 'OpenAI TTS', perThousandChars: 0.015 },
    ],
  });
};

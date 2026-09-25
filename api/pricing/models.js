// GET /api/pricing/models
// Real rate card, sourced from Truffl's own pricing workbooks
// (Truffl_LLM_Pricing_Calculator, STT_Provider_Cost_Planner, TTS_Provider_Cost_Planner,
// Truffl_Provider_Matrix — see /Downloads). Update this file whenever those change.
//
// llm[].kind is always 'standard' here (no realtime/voice-to-voice model priced yet).
// stt[].rate is cost per connected audio minute, in stt[].currency.
// tts[].kind is 'usage' (rate per tts[].divisor units of tts[].unit) or 'plan'
// (a monthly-fee + overage ladder, e.g. Cartesia's self-serve plans).
module.exports = (req, res) => {
  res.status(200).json({
    llm: [
      {
        id: 'openai-gpt-5.6-luna-standard',
        name: 'GPT-5.6 Luna',
        route: 'OpenAI API — Standard',
        kind: 'standard',
        input: 0.2,   // $ / 1M input tokens
        output: 1.2,  // $ / 1M output tokens
      },
    ],
    stt: [
      { id: 'deepgram-flux-en', provider: 'Deepgram', name: 'Flux English', currency: 'USD', rate: 0.0065 },
      { id: 'deepgram-flux-multi', provider: 'Deepgram', name: 'Flux Multilingual', currency: 'USD', rate: 0.0078 },
      { id: 'deepgram-nova3-mono', provider: 'Deepgram', name: 'Nova-3 Monolingual', currency: 'USD', rate: 0.0048 },
      { id: 'deepgram-nova3-multi', provider: 'Deepgram', name: 'Nova-3 Multilingual', currency: 'USD', rate: 0.0058 },
      { id: 'sarvam-saaras-v3', provider: 'Sarvam AI', name: 'Saaras v3', currency: 'INR', rate: 0.5 },
      { id: 'sarvam-saaras-v4', provider: 'Sarvam AI', name: 'Saaras v4', currency: 'INR', rate: 0.5 },
      { id: 'azure-stt-standard', provider: 'Microsoft Azure', name: 'Standard Real-time', currency: 'USD', rate: 0.016666666666666666 },
      { id: 'azure-stt-custom', provider: 'Microsoft Azure', name: 'Custom Real-time', currency: 'USD', rate: 0.02 },
    ],
    tts: [
      { id: 'murf-falcon-2', name: 'Murf Falcon 2', kind: 'usage', currency: 'USD', unit: 'chars', divisor: 1000, rate: 0.01 },
      { id: 'sarvam-bulbul-v3', name: 'Sarvam Bulbul v3', kind: 'usage', currency: 'INR', unit: 'chars', divisor: 1000, rate: 3 },
      { id: 'fish-s2-pro', name: 'Fish Audio S2-Pro', kind: 'usage', currency: 'USD', unit: 'bytes', divisor: 1000000, rate: 15 },
      { id: 'fish-s1', name: 'Fish Audio S1', kind: 'usage', currency: 'USD', unit: 'bytes', divisor: 1000000, rate: 10 },
      {
        id: 'cartesia-sonic-3.6', name: 'Cartesia Sonic 3.6', kind: 'plan', currency: 'USD', unit: 'chars',
        plans: [
          { name: 'Free', fee: 0, included: 20000, overagePerM: null },
          { name: 'Pro', fee: 5, included: 100000, overagePerM: 65 },
          { name: 'Startup', fee: 49, included: 1250000, overagePerM: 45 },
          { name: 'Scale', fee: 299, included: 8000000, overagePerM: 38 },
        ],
      },
      {
        id: 'cartesia-sonic-3.5', name: 'Cartesia Sonic 3.5', kind: 'plan', currency: 'USD', unit: 'chars',
        plans: [
          { name: 'Free', fee: 0, included: 20000, overagePerM: null },
          { name: 'Pro', fee: 5, included: 100000, overagePerM: 65 },
          { name: 'Startup', fee: 49, included: 1250000, overagePerM: 45 },
          { name: 'Scale', fee: 299, included: 8000000, overagePerM: 38 },
        ],
      },
      {
        id: 'cartesia-sonic-3', name: 'Cartesia Sonic 3', kind: 'plan', currency: 'USD', unit: 'chars',
        plans: [
          { name: 'Free', fee: 0, included: 20000, overagePerM: null },
          { name: 'Pro', fee: 5, included: 100000, overagePerM: 65 },
          { name: 'Startup', fee: 49, included: 1250000, overagePerM: 45 },
          { name: 'Scale', fee: 299, included: 8000000, overagePerM: 38 },
        ],
      },
      {
        id: 'cartesia-sonic-turbo', name: 'Cartesia Sonic Turbo', kind: 'plan', currency: 'USD', unit: 'chars',
        plans: [
          { name: 'Free', fee: 0, included: 20000, overagePerM: null },
          { name: 'Pro', fee: 5, included: 100000, overagePerM: 65 },
          { name: 'Startup', fee: 49, included: 1250000, overagePerM: 45 },
          { name: 'Scale', fee: 299, included: 8000000, overagePerM: 38 },
        ],
      },
      {
        id: 'cartesia-sonic-2', name: 'Cartesia Sonic 2', kind: 'plan', currency: 'USD', unit: 'chars',
        plans: [
          { name: 'Free', fee: 0, included: 20000, overagePerM: null },
          { name: 'Pro', fee: 5, included: 100000, overagePerM: 65 },
          { name: 'Startup', fee: 49, included: 1250000, overagePerM: 45 },
          { name: 'Scale', fee: 299, included: 8000000, overagePerM: 38 },
        ],
      },
    ],
  });
};

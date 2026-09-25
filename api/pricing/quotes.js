// POST /api/pricing/quotes
// header: X-Calculator-Access: <token from /api/pricing/access>
// body: { idempotencyKey, inputs }
//
// inputs (all from the pricing-page form):
//   calls          connected calls / month
//   duration       avg connected call duration, minutes
//   inputTokens    avg billed LLM input tokens / connected call
//   outputTokens   avg billed LLM output tokens / connected call
//   share          AI talk share of the call (0-1)
//   buffer         production buffer (0-1), applied on top of raw usage
//   chars          characters / AI speech minute (for char-billed TTS)
//   bytes          UTF-8 bytes / AI speech minute (for byte-billed TTS, e.g. Fish Audio)
//   fx             USD -> INR rate to use
//   llm, stt, tts  index into the arrays returned by /api/pricing/models
//
// Mirrors the math in Truffl's own pricing workbooks (Client Pricing / STT & TTS
// Provider Cost Planners): usage is computed from calls+duration+share, a production
// buffer is added, then priced at each model's rate and converted to INR.
//
// TODO: replace the flat ₹1 "Truffl platform" line with your real margin/markup logic.
const models = require('./models.js');

function getModels() {
  let out;
  models({}, { status: () => ({ json: (v) => (out = v) }) });
  return out;
}

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const token = req.headers['x-calculator-access'];
  if (!token) return res.status(401).json({ message: 'Missing calculator access token.' });

  const { inputs: p } = req.body || {};
  if (!p) return res.status(400).json({ message: 'Missing inputs.' });

  const required = ['calls', 'duration', 'inputTokens', 'outputTokens', 'share', 'buffer', 'chars', 'bytes', 'fx', 'llm', 'stt', 'tts'];
  for (const key of required) {
    if (typeof p[key] !== 'number' || !Number.isFinite(p[key])) {
      return res.status(400).json({ message: `Invalid or missing "${key}" in inputs.` });
    }
  }

  const rates = getModels();
  const l = rates.llm[p.llm], s = rates.stt[p.stt], t = rates.tts[p.tts];
  if (!l || !s || !t) return res.status(400).json({ message: 'Unknown model selection.' });

  const fx = p.fx;
  const callMinutes = p.calls * p.duration;               // total connected call minutes / month
  const aiMinutes = callMinutes * p.share;                 // minutes the AI is actually speaking
  const audioMinutesBuffered = callMinutes * (1 + p.buffer);

  // --- LLM ---
  const inputTokensBuffered = p.calls * p.inputTokens * (1 + p.buffer);
  const outputTokensBuffered = p.calls * p.outputTokens * (1 + p.buffer);
  const llmCostUsd = (inputTokensBuffered / 1e6) * l.input + (outputTokensBuffered / 1e6) * l.output;
  const llmCostInr = llmCostUsd * fx;

  // --- STT ---
  const sttCostNative = audioMinutesBuffered * s.rate;
  const sttCostInr = s.currency === 'INR' ? sttCostNative : sttCostNative * fx;

  // --- TTS ---
  const ttsUnitsRaw = aiMinutes * (t.unit === 'bytes' ? p.bytes : p.chars);
  const ttsUnitsBuffered = ttsUnitsRaw * (1 + p.buffer);
  let ttsCostInr, plan = null;

  if (t.kind === 'plan') {
    // Pick the cheapest plan (fee + overage beyond included credits) for this volume.
    let best = null;
    for (const pl of t.plans) {
      if (pl.overagePerM === null && ttsUnitsBuffered > pl.included) continue; // Free tier can't cover overage
      const overage = Math.max(0, ttsUnitsBuffered - pl.included);
      const cost = pl.fee + (pl.overagePerM ? (overage / 1e6) * pl.overagePerM : 0);
      if (!best || cost < best.cost) best = { ...pl, cost };
    }
    if (!best) best = t.plans[t.plans.length - 1]; // fall back to the largest tier
    const ttsCostUsd = best.cost;
    ttsCostInr = t.currency === 'INR' ? ttsCostUsd : ttsCostUsd * fx;
    plan = { name: best.name, fee: best.fee, included: best.included };
  } else {
    const units = ttsUnitsBuffered / t.divisor;
    const ttsCostNative = units * t.rate;
    ttsCostInr = t.currency === 'INR' ? ttsCostNative : ttsCostNative * fx;
  }

  const provider = llmCostInr + sttCostInr + ttsCostInr;
  const platform = 1; // flat ₹1 platform line — TODO: real markup
  const total = provider + platform;
  const perMinute = callMinutes > 0 ? total / callMinutes : null;

  res.status(200).json({
    sheetStatus: 'synced',
    quote: {
      realtime: false,
      llm: llmCostInr,
      stt: sttCostInr,
      tts: ttsCostInr,
      provider,
      platform,
      total,
      minutes: callMinutes,
      perMinute,
      plan,
    },
  });
};

const fs = require('fs');
const path = require('path');
const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

(async () => {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node transcribe-file.js <audio-file-path>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  try {
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'scribe_v1';

    const transcription = await client.speechToText.convert({
      file: fs.createReadStream(resolvedPath),
      model_id: modelId,
      file_format: 'other',
      language_code: process.env.ELEVENLABS_LANGUAGE_CODE || 'uk',
      num_speakers: Number(process.env.ELEVENLABS_NUM_SPEAKERS || 2),
      tag_audio_events: false,
      diarize: true
    });

    console.log(transcription.text || '');
  } catch (err) {
    console.error('Error transcribing file:', err.message || err);
    process.exit(1);
  }
})();


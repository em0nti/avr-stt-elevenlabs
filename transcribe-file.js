const fs = require('fs');
const path = require('path');
const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

(async () => {
  const filePath = process.argv[2];
  const outputPath = process.argv[3];
  if (!filePath) {
    console.error('Usage: node transcribe-file.js <audio-file-path> [output-file]');
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
      modelId: modelId,
      fileFormat: "other",
      languageCode: process.env.ELEVENLABS_LANGUAGE_CODE || "uk",
      tagAudioEvents: false,
      diarize: true,
      additionalFormats: [
        {
          format: "txt",
          includeSpeakers: true,
        },
      ],
    });

    let output = '';

    if (Array.isArray(transcription.additionalFormats)) {
      const txt = transcription.additionalFormats.find(f => f.requestedFormat === 'txt');
      if (txt) {
        output = txt.isBase64Encoded ? Buffer.from(txt.content, 'base64').toString('utf8') : txt.content;
      }
    }

    if (!output) {
      if (Array.isArray(transcription.words) && transcription.words.length > 0) {
        const segments = [];
        let currentSpeaker = transcription.words[0].speakerId || '0';
        let buffer = [];
        for (const word of transcription.words) {
          const speaker = word.speakerId || '0';
          if (speaker !== currentSpeaker) {
            segments.push({ speaker: currentSpeaker, text: buffer.join(' ') });
            currentSpeaker = speaker;
            buffer = [];
          }
          buffer.push(word.text);
        }
        if (buffer.length > 0) {
          segments.push({ speaker: currentSpeaker, text: buffer.join(' ') });
        }
        output = segments.map(seg => `[Speaker ${seg.speaker}]\n${seg.text}`).join('\n\n');
      } else {
        output = transcription.text || '';
      }
    }

    if (outputPath) {
      fs.writeFileSync(path.resolve(outputPath), output, 'utf8');
    } else {
      console.log(output);
    }
  } catch (err) {
    console.error('Error transcribing file:', err.message || err);
    process.exit(1);
  }
})();


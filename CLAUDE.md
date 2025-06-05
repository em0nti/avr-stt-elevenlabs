# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start the server**: `npm run start` or `npm run start:dev` (with nodemon and debugging)
- **Transcribe local files**: `npm run transcribe -- path/to/audio.wav [output.txt]`
- **Docker build**: `npm run dc:build` (builds for linux/amd64 platform)
- **Docker push**: `npm run dc:push` (pushes both latest and versioned tags)

## Architecture Overview

This is an Express.js-based speech-to-text service that integrates ElevenLabs API with the Agent Voice Response (AVR) system. The architecture consists of:

### Core Components

1. **HTTP Server** (`index.js`): Main Express server that receives PCM audio from Asterisk/AVR Core via `/transcribe` endpoint
2. **File Transcriber** (`transcribe-file.js`): Standalone CLI tool for transcribing local audio files with speaker diarization
3. **Audio Processing Pipeline**: Converts raw PCM audio (16-bit signed linear) to WAV format before sending to ElevenLabs

### Key Flows

- **Real-time transcription**: Asterisk → AVR Core → `/transcribe` endpoint → ElevenLabs API → JSON response
- **File transcription**: Local audio file → `transcribe-file.js` → ElevenLabs API → speaker-labeled text output

### Environment Configuration

Required environment variables (see `.env.example`):
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `PORT`: Server port (default: 6022)
- `ELEVENLABS_MODEL_ID`: Model to use (default: scribe_v1)
- `ELEVENLABS_LANGUAGE_CODE`: Language code (default: en for server, uk for file transcription)

### Audio Format Handling

- **Input**: Raw PCM audio with `X-Sample-Rate` header (typically from Asterisk slin format)
- **Processing**: Converts 16-bit PCM samples to normalized WAV format
- **Output**: JSON with transcription text for server, formatted speaker-labeled text for file transcription

The file transcriber supports speaker diarization and outputs in `[speaker_id]\ntext` format, while the server endpoint focuses on simple transcription for real-time AVR integration.
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Edge Function for Google Cloud Text-to-Speech API
 * Converts text to natural-sounding MP3 audio with British English voice
 *
 * Security: API key stored in environment variables (never exposed to client)
 * Caching: Client-side caching in ttsService.ts prevents duplicate API calls
 *
 * Request:
 *   POST /api/tts
 *   { "text": "Hello, this is a test" }
 *
 * Response:
 *   { "audioContent": "//NExAAR..." } // Base64 MP3
 */

export const config = {
  runtime: 'nodejs', // Edge runtime for speed
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text field is required and must be a string' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text must be less than 5000 characters' });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    // Get API key from environment variables
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_TTS_API_KEY environment variable not set');
      return res.status(500).json({
        error: 'TTS service not configured',
        details: 'Missing GOOGLE_TTS_API_KEY environment variable'
      });
    }

    // Call Google Cloud Text-to-Speech API
    const googleResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-GB',
            name: 'en-GB-Neural2-B', // Male British voice (high quality neural)
            ssmlGender: 'MALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0, // Natural pitch (0 = baseline)
            speakingRate: 0.95, // Slightly slower than normal (1.0) for clarity
            volumeGainDb: 0, // Natural volume
          },
        }),
      }
    );

    // Handle API errors
    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();
      console.error('Google TTS API error:', errorData);

      // Provide specific error messages for debugging
      const errorMessage = errorData.error?.message || 'Google TTS API request failed';
      return res.status(googleResponse.status).json({
        error: errorMessage,
        details: errorData.error?.details
      });
    }

    // Parse successful response
    const data = await googleResponse.json();

    if (!data.audioContent) {
      console.error('Google TTS response missing audioContent');
      return res.status(500).json({ error: 'Invalid response from TTS service' });
    }

    // Return base64 audio content
    // Client will convert this to Blob and play via HTML5 <audio>
    return res.status(200).json({
      audioContent: data.audioContent, // Base64-encoded MP3
      duration: data.audioConfig?.sampleRateHertz ? 'unknown' : 'unknown' // Could calculate if needed
    });

  } catch (error: any) {
    console.error('TTS handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

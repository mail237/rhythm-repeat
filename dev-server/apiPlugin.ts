import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { synthesizeWithGemini } from '../api/_geminiTts';

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function handleTts(
  req: IncomingMessage,
  res: ServerResponse,
  geminiKey: string,
  cloudKey: string,
) {
  const body = JSON.parse(await readBody(req)) as {
    text: string;
    languageCode: string;
    voiceName: string;
    speed: number;
  };

  if (geminiKey) {
    try {
      const result = await synthesizeWithGemini(
        geminiKey,
        body.text,
        body.languageCode,
      );
      sendJson(res, {
        audioContent: result.audioContent,
        mimeType: result.mimeType,
        timepoints: [],
      });
      return;
    } catch {
      if (!cloudKey) throw new Error('Gemini TTS failed');
    }
  }

  if (!cloudKey) {
    sendJson(res, { error: { message: 'TTS API key not set' } }, 500);
    return;
  }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${cloudKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: body.text },
        voice: { languageCode: body.languageCode, name: body.voiceName },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: body.speed,
          pitch: 0,
          enableTimePointing: ['WORD'],
        },
      }),
    },
  );

  const data = await response.json();
  sendJson(res, data, response.status);
}

async function handleClaude(
  req: IncomingMessage,
  res: ServerResponse,
  apiKey: string,
) {
  const body = JSON.parse(await readBody(req)) as {
    userInput: string;
    languageLabel: string;
  };

  const systemPrompt = `You are a language coach specializing in natural, colloquial expressions.
The user will describe in Japanese what they want to say or a situation they're in.
Generate 3-5 natural, colloquial phrases in the target language (English or German).

Respond ONLY in JSON format:
{
  "phrases": [
    {
      "text": "phrase in target language",
      "translation": "日本語訳",
      "context": "どんな場面で使うか（日本語で1〜2文）",
      "register": "casual | neutral | formal"
    }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `言語: ${body.languageLabel}\nユーザーのリクエスト: ${body.userInput}`,
        },
      ],
    }),
  });

  const data = await response.json();
  sendJson(res, data, response.status);
}

async function handleSuggest(
  req: IncomingMessage,
  res: ServerResponse,
  geminiKey: string,
) {
  const body = JSON.parse(await readBody(req)) as {
    userInput: string;
    languageLabel: string;
  };

  const prompt = `You are a language coach specializing in natural, colloquial expressions.
The user will describe in Japanese what they want to say or a situation they're in.
Generate 3-5 natural, colloquial phrases in the target language (English or German).

Respond ONLY in JSON format:
{
  "phrases": [
    {
      "text": "phrase in target language",
      "translation": "日本語訳",
      "context": "どんな場面で使うか（日本語で1〜2文）",
      "register": "casual | neutral | formal"
    }
  ]
}

言語: ${body.languageLabel}
ユーザーのリクエスト: ${body.userInput}`;

  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'] as const;
  let data: unknown;
  let response: Response | undefined;

  for (const model of models) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 1200,
          },
        }),
      },
    );

    data = await response.json();
    if (response.ok) break;
    if (response.status !== 404 && response.status !== 429 && response.status !== 503) {
      sendJson(res, data, response.status);
      return;
    }
  }

  if (!response?.ok) {
    sendJson(res, data, response?.status ?? 500);
    return;
  }

  const text =
    (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      .candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    sendJson(res, { error: { message: 'Invalid AI JSON' } }, 500);
    return;
  }
  sendJson(res, JSON.parse(jsonMatch[0]));
}

async function handleTranslate(
  req: IncomingMessage,
  res: ServerResponse,
  geminiKey: string,
) {
  const body = JSON.parse(await readBody(req)) as {
    text: string;
    languageLabel: string;
  };

  const prompt = `Translate this ${body.languageLabel} phrase into natural Japanese suitable for language learners.
Keep the tone (casual/neutral/formal) of the original.
Return ONLY JSON: {"translation":"日本語訳"}

Phrase: ${body.text}`;

  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'] as const;
  let data: unknown;
  let response: Response | undefined;

  for (const model of models) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 256,
          },
        }),
      },
    );

    data = await response.json();
    if (response.ok) break;
    if (response.status !== 404 && response.status !== 429 && response.status !== 503) {
      sendJson(res, data, response.status);
      return;
    }
  }

  if (!response?.ok) {
    sendJson(res, data, response?.status ?? 500);
    return;
  }

  const text =
    (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      .candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    sendJson(res, { error: { message: 'Invalid translation JSON' } }, 500);
    return;
  }
  sendJson(res, JSON.parse(jsonMatch[0]));
}

function createMiddleware(env: Record<string, string>) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    const url = req.url ?? '';
    if (!url.startsWith('/api/')) return next();

    if (req.method !== 'POST') {
      sendJson(res, { error: { message: 'Method not allowed' } }, 405);
      return;
    }

    try {
      if (url === '/api/tts') {
        const geminiKey = env.GEMINI_API_KEY || '';
        const cloudKey =
          env.GOOGLE_TTS_API_KEY || env.VITE_GOOGLE_TTS_API_KEY || '';
        if (!geminiKey && !cloudKey) {
          sendJson(
            res,
            { error: { message: 'GEMINI_API_KEY not set in .env' } },
            500,
          );
          return;
        }
        await handleTts(req, res, geminiKey, cloudKey);
        return;
      }

      if (url === '/api/claude') {
        const apiKey =
          env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY || '';
        if (!apiKey) {
          sendJson(
            res,
            { error: { message: 'ANTHROPIC_API_KEY not set in .env' } },
            500,
          );
          return;
        }
        await handleClaude(req, res, apiKey);
        return;
      }

      if (url === '/api/suggest') {
        const apiKey =
          env.GEMINI_API_KEY ||
          env.GOOGLE_TTS_API_KEY ||
          env.VITE_GOOGLE_TTS_API_KEY ||
          '';
        if (!apiKey) {
          sendJson(
            res,
            { error: { message: 'GEMINI_API_KEY not set in .env' } },
            500,
          );
          return;
        }
        await handleSuggest(req, res, apiKey);
        return;
      }

      if (url === '/api/translate') {
        const apiKey =
          env.GEMINI_API_KEY ||
          env.GOOGLE_TTS_API_KEY ||
          env.VITE_GOOGLE_TTS_API_KEY ||
          '';
        if (!apiKey) {
          sendJson(
            res,
            { error: { message: 'GEMINI_API_KEY not set in .env' } },
            500,
          );
          return;
        }
        await handleTranslate(req, res, apiKey);
        return;
      }

      sendJson(res, { error: { message: 'Not found' } }, 404);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Internal error';
      sendJson(res, { error: { message } }, 500);
    }
  };
}

export function apiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'rhythm-repeat-api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(createMiddleware(env));
    },
  };
}

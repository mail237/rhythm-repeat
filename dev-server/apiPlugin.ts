import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

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
  apiKey: string,
) {
  const body = JSON.parse(await readBody(req)) as {
    text: string;
    languageCode: string;
    voiceName: string;
    speed: number;
  };

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
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
        const apiKey =
          env.GOOGLE_TTS_API_KEY || env.VITE_GOOGLE_TTS_API_KEY || '';
        if (!apiKey) {
          sendJson(
            res,
            { error: { message: 'GOOGLE_TTS_API_KEY not set in .env' } },
            500,
          );
          return;
        }
        await handleTts(req, res, apiKey);
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

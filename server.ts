import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Suppress experimental native config loader warning in Vite 8+
process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of GoogleGenAI to prevent premature missing-key warnings at boot time
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Multi-turn Gemini Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, model = 'gemini-3.8-flash', role = 'scientist' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your hosting environment variables.',
        });
      }

      // Valid models selection: gemini-4-argon (complex), gemini-3.8-flash (general), gemini-3.1-flash-lite (fast)
      const validModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'];
      const selectedModel = validModels.includes(model) ? model : 'gemini-3.8-flash';

      // Role-specific system instructions
      const systemInstructions: Record<string, string> = {
        scientist: `You are the Lead Climate Scientist at India's National Climate Digital Twin Observatory. You specialize in spatiotemporal climate modeling (ConvLSTM), atmosphere-ocean-cryosphere coupling across the Indian subcontinent, monsoon variability, and IPCC AR6 projections. Provide rigorous, quantitative, and insightful scientific analysis with clear actionable summaries. Always format your responses with structured markdown, bold key figures, and concise bullet points.`,
        strategist: `You are the Senior Climate Adaptation & Disaster Resilience Strategist for India. You advise national and state disaster management authorities (NDMA, SDMAs) on heat action plans, flood resilience, agricultural water stress, and coastal defenses. Provide pragmatic, prioritized adaptation recommendations tailored to regional socioeconomic realities. Format with structured markdown and clear action priorities.`,
        meteorologist: `You are the Chief Operational Meteorologist specializing in Indian weather systems, utilizing IMD gridded surface data (0.25° resolution) and ISRO INSAT-3DR multi-spectral radiometer/sounder observations. Explain weather phenomena (monsoon depressions, western disturbances, tropical cyclones, cloudbursts) with observational context and synoptic telemetry. Format with structured markdown.`,
      };

      const systemInstruction = systemInstructions[role] || systemInstructions.scientist;

      // Transform messages into contents format for multi-turn history
      const contents = messages.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.text || '') }],
      }));

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
        },
      });

      const text = response.text || 'No response generated.';
      return res.json({ text, model: selectedModel, role });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      const errorMessage = error?.message || 'An error occurred while generating the response.';
      return res.status(500).json({
        error: errorMessage,
        status: error?.status,
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      twinOnline: true,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
      time: new Date().toISOString(),
    });
  });

  // Static asset serving and Vite middleware integration
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.resolve(distPath, 'index.html');

  if (isProduction && fs.existsSync(distIndexPath)) {
    console.log('[Digital Twin Server] Production mode: Serving static build from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      // Never intercept API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      if (fs.existsSync(distIndexPath)) {
        res.sendFile(distIndexPath, (err) => {
          if (err && !res.headersSent) {
            console.error('[Digital Twin Server] Error sending dist/index.html:', err.message);
            res.status(500).send('Error serving application.');
          }
        });
      } else {
        res.status(404).send('Production build not found. Please run npm run build.');
      }
    });
  } else {
    // In development mode (or if production dist is missing), launch Vite in middleware mode
    console.log(`[Digital Twin Server] ${isProduction ? 'Static dist missing' : 'Development mode'}: Initializing Vite runtime middleware...`);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Digital Twin Server Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Unknown error' });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Twin Server running on http://localhost:${PORT}`);
  });
}

startServer();

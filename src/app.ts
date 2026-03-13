// src/app.ts
import express from 'express';
import router from './routers/router';
import cors from 'cors';
import docClient from './config/dynamo';
import { SEARCH_CONFIG } from './config/secret';
import { store, keywordEngine, semanticEngine, hybridEngine, embeddingRouter, syncHandler } from './search/searchContext';
import { internalAuth } from './middleware/internalAuth';

const app = express();
const port = 3004;
const cookieParser = require('cookie-parser');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Health Check — keyword_only도 200 반환 (트래픽 수신 가능)
app.get('/health', (req, res) => {
  const readiness = store.readiness;
  const statusCode = readiness === 'loading' ? 503 : 200;
  return res.status(statusCode).json({
    status: readiness,
    search: readiness === 'ready' ? true : readiness === 'keyword_only' ? 'keyword_only' : false,
  });
});

// Sync 엔드포인트
app.post('/internal/sync', internalAuth, async (req, res) => {
  const result = await syncHandler.enqueue(req.body);
  return res.status(result.success ? 200 : 400).json(result);
});

app.use(router);

app.listen(port, async () => {
  console.log('server running on http://localhost:' + port);

  try {
    await store.loadFromDynamoDB(docClient);
    await store.buildKeywordIndex(keywordEngine);
    hybridEngine.setSemanticReady(false);

    if (embeddingRouter) {
      store.buildVectorIndex(semanticEngine, embeddingRouter, SEARCH_CONFIG.EMBEDDING_BATCH_SIZE, docClient)
        .then(() => {
          hybridEngine.setSemanticReady(true);
          console.log('[App] Hybrid search engine fully ready');
        })
        .catch((err) => {
          console.error('[App] Vector index build failed, keyword-only mode:', err);
          retryVectorBuild(1);
        });
    } else {
      console.log('[App] No embedding API keys configured, running keyword-only mode');
    }
  } catch (err) {
    console.error('[App] Failed to load data from DynamoDB:', err);
  }
});

function retryVectorBuild(attempt: number): void {
  if (!embeddingRouter) return;
  const delay = Math.min(1000 * Math.pow(2, attempt), 60000);
  console.log(`[App] Retrying vector build in ${delay}ms (attempt ${attempt})`);
  setTimeout(async () => {
    try {
      await store.buildVectorIndex(semanticEngine, embeddingRouter!, SEARCH_CONFIG.EMBEDDING_BATCH_SIZE, docClient);
      hybridEngine.setSemanticReady(true);
      console.log('[App] Vector index built on retry');
    } catch (err) {
      console.error('[App] Vector build retry failed:', err);
      if (attempt < 5) retryVectorBuild(attempt + 1);
    }
  }, delay);
}

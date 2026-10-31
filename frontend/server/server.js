import app from './app.js';
import { initDb } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Start Server and Initialize Database
const startServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Sahayak AI Backend running on http://localhost:${PORT}`);
    console.log(`🛡️  Model: gemini-2.5-flash (@google/genai SDK)`);
    console.log(`🌐 Ready to serve multimodal requests & protect users.`);
    console.log(`=======================================================`);
  });
};

startServer();

// Load environment variables
import 'dotenv/config';

import { runSongWithAnimalsPipeline } from './dist/pipeline/index.js';

// Тестовые данные
const testInput = [
  {
    topic: "Robot Animals Song",
    lyrics: `The robot dog says, "Beep, beep, beep!"
The robot cat says, "Whirr, whirr, whirr!"
The robot bird says, "Chirp, chirp, chirp!"
The robot fish says, "Blub, blub, blub!"`
  }
];

// Функция для логирования
const emitLog = (message, requestId) => {
  console.log(`[${requestId || 'TEST'}] ${message}`);
};

// Запуск пайплайна
async function testPipeline() {
  try {
    console.log('🚀 Starting Song with Animals Pipeline Test...');
    
    const results = await runSongWithAnimalsPipeline(testInput, {
      requestId: 'test-123',
      emitLog: emitLog
    });
    
    console.log('\n📋 Results:');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPipeline(); 
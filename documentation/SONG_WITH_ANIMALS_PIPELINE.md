# Song with Animals Pipeline

Новый пайплайн для генерации контента на основе детских песен с животными.

## Описание

Пайплайн `song_with_animals` предназначен для обработки детских песен с животными персонажами и генерации:
- Промтов для изображений (image prompts)
- Глобального стиля для всех изображений
- Заголовка и описания для видео
- Хештегов для социальных сетей

## Входные данные

```typescript
interface SongWithAnimalsInputItem {
  lyrics: string;     // Текст песни
}

type SongWithAnimalsInput = SongWithAnimalsInputItem[];
```

### Пример входных данных

```javascript
const input = [
  {
    lyrics: `The robot dog says, "Beep, beep, beep!"
The robot cat says, "Whirr, whirr, whirr!"
The robot bird says, "Chirp, chirp, chirp!"
The robot fish says, "Blub, blub, blub!"`
  }
];
```

### Использование в UI

В веб-интерфейсе пользователь просто вводит текст песни:

```
The robot dog says, "Beep, beep, beep!"
The robot cat says, "Whirr, whirr, whirr!"
The robot bird says, "Chirp, chirp, chirp!"
The robot fish says, "Blub, blub, blub!"
```

Система автоматически создает массив с одним объектом, содержащим введенный текст.

## Выходные данные

```typescript
interface SongWithAnimalsOutput {
  global_style: string;                    // Глобальный стиль для всех изображений
  prompts: SongWithAnimalsImagePrompt[];   // Промты для каждого изображения
  title: string;                           // Заголовок видео
  description: string;                     // Описание видео
  hashtags: string;                        // Хештеги для социальных сетей
}

interface SongWithAnimalsImagePrompt {
  line: string;    // Оригинальная строка песни
  prompt: string;  // Промт для генерации изображения
}
```

## Структура пайплайна

1. **Генерация промтов для изображений** - создает `global_style` и промты для каждой строки песни
2. **Генерация заголовка и описания** - создает привлекательный заголовок и описание для видео
3. **Генерация хештегов** - создает релевантные хештеги для социальных сетей

## Использование

```javascript
import { runSongWithAnimalsPipeline } from './pipeline/index.js';

const results = await runSongWithAnimalsPipeline(input, {
  requestId: 'unique-id',
  emitLog: (message, requestId) => console.log(message)
});
```

## Промты

Пайплайн использует следующие промты из папки `src/promts/song_with_animals/`:

- `imagePrompt.ts` - генерация промтов для изображений
- `titleDescPrompt.ts` - генерация заголовка и описания
- `hashtagsPrompt.ts` - генерация хештегов

## Особенности

- Поддерживает множественные попытки генерации (до 3 попыток)
- Сохраняет результаты в папку `unprocessed`
- Логирует процесс генерации
- Обрабатывает ошибки и продолжает работу с другими песнями
- Использует Claude 3.7 Sonnet для всех шагов

## Расширение

Для добавления новых промтов:
1. Создайте новый файл в `src/promts/song_with_animals/`
2. Добавьте экспорт в `src/promts/song_with_animals/index.ts`
3. Обновите пайплайн для использования нового промта 
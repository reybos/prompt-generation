# Prompt Content Generation

A comprehensive Node.js/TypeScript pipeline for generating educational video content for children using the fal.ai API. Features multiple specialized pipelines for different content types with a modern web interface.

## 🚀 Features

- **Multiple Content Pipelines**: Halloween, Horror, Study (Short/Long), Halloween Patchwork
- **AI-Powered Generation**: Uses fal.ai API with Claude models for high-quality content
- **Web Interface**: User-friendly interface for content generation and management
- **Modular Architecture**: TypeScript-based with clean separation of concerns
- **Style Support**: Multiple visual styles for different content types
- **Async Processing**: Support for both synchronous and asynchronous content generation

## 📦 Installation

1. **Clone the repository**

```bash
git clone https://github.com/reybos/prompt-content-generation.git
cd prompt-content-generation
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env` file** with your [fal.ai](https://fal.ai) API key:

```dotenv
# Required for content generation
FAL_KEY=your_fal_api_key_here
FAL_DEFAULT_MODEL=anthropic/claude-3.7-sonnet

# Optional: Configure generations directory location
# GENERATIONS_DIR_PATH=/absolute/path/to/generations
# GENERATIONS_DIR_RELATIVE_PATH=../generations

# Optional: Song segmentation configuration
SONG_SEGMENT_LINES=3
```

4. **Build the TypeScript code**

```bash
npm run build
```

This will:
- Compile TypeScript files into JavaScript in the `dist/` directory
- Copy static assets from the `public/` directory to `dist/public/`

## 🎯 Usage

### Web Interface

Start the web server:

```bash
npm run web
```

Then open your browser and navigate to:
```
http://localhost:4000
```

The web interface provides:
- **Theme Selection**: Choose from different content pipelines
- **JSON Input**: Enter topics organized by themes
- **Real-time Logs**: Monitor generation progress
- **Content Management**: View and save generated content

### Available Pipelines

#### 🎃 Halloween Pipeline
- Generates Halloween-themed educational content
- Includes image prompts, video prompts, titles, and descriptions
- Specialized for spooky but child-friendly content

#### 📚 Study Pipelines
- **Short Study**: Quick educational content generation
- **Long Study**: Comprehensive educational content with async processing
- Includes character prompts, media enhancement, and narration

#### 🎃 Halloween Patchwork Pipeline
- **Automatic Segmentation**: Splits songs into 3-line segments
- **Multi-format Output**: Generates images, videos, titles, descriptions, and hashtags
- **Halloween Patchwork Style**: Hardcoded spooky-cute 3D cartoon style with patchwork characters
- **Scalable Content**: One song generates multiple content pieces

### Development

#### Building the Project

```bash
npm run build
```

#### Development Mode

```bash
npm run dev
```

#### Type Checking

```bash
npm run type-check
```

## 🏗️ Architecture

```
src/
├── chains/          # LangChain integration
├── config/          # Configuration management
├── pipeline/        # Content generation pipelines
├── promts/          # Prompt templates by theme
├── schemas/         # Data validation schemas
├── services/        # External service integrations
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 📋 Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start the application
- `npm run web` - Start with web interface
- `npm run dev` - Development mode with hot reload
- `npm run type-check` - TypeScript type checking
- `npm run clean` - Clean build directory

## 🔧 Configuration

### Environment Variables

- `FAL_KEY` - Your fal.ai API key (required)
- `FAL_DEFAULT_MODEL` - Default model for content generation
- `GENERATIONS_DIR_PATH` - Absolute path to generations directory
- `GENERATIONS_DIR_RELATIVE_PATH` - Relative path to generations directory
- `SONG_SEGMENT_LINES` - Number of lines per song segment (default: 3)

### Content Pipelines

Each pipeline is designed for specific content types:

- **Halloween**: Spooky educational content
- **Horror**: Engaging scary content for older children
- **Study**: Traditional educational content
- **Song with Animals**: Music-based educational content with automatic segmentation

## 📖 Documentation

- [Halloween Patchwork Pipeline](documentation/HALLOWEEN_PATCHWORK_PIPELINE.md)
- [Async Pipeline](documentation/ASYNC_PIPELINE_README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

ISC License

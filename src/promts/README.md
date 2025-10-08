# Prompt and Style Files System

This directory contains the prompt templates, style configurations, and logic for the content generation pipelines. The system is designed to keep actual prompt and style content private while maintaining the project structure in the repository.

## File Structure

### Prompt Files
- **`.ts` files**: Contain TypeScript logic, imports, and exports (tracked in Git)
- **`.prompt.template.txt` files**: Template prompt content (tracked in Git)
- **`.prompt.txt` files**: Actual prompt content (gitignored, private)

### Style Files
- **`.ts` files**: Contain TypeScript logic, imports, and exports (tracked in Git)
- **`.style.template.txt` files**: Template style content (tracked in Git)
- **`.style.txt` files**: Actual style content (gitignored, private)

## How It Works

1. **TypeScript files** read content from external `.txt` files (prompts and styles)
2. If actual `.txt` files don't exist, they fallback to `.template.txt` files
3. A warning is shown when using template content
4. All logic, functions, and structure remain in the repository

## Setup Instructions

### For New Developers

1. **Clone the repository**
2. **Run the setup script**:
   ```bash
   ./scripts/setup-prompts.sh
   ```
3. **Edit content files**: Copy content from `.template.txt` to `.txt` files and customize
4. **Test the build**: Ensure everything compiles correctly

### Manual Setup

If you prefer manual setup:

```bash
# Copy all template files to actual files
find src/promts -name "*.prompt.template.txt" | while read template; do
    actual="${template%.template.txt}.txt"
    cp "$template" "$actual"
done

find src/promts -name "*.style.template.txt" | while read template; do
    actual="${template%.template.txt}.txt"
    cp "$template" "$actual"
done
```

## File Types

### Simple Prompts
Files with basic prompt templates that read from external files:
- `scriptPrompt.ts` → `scriptPrompt.prompt.txt`
- `videoPrompt.ts` → `videoPrompt.prompt.txt`

### Complex Prompts
Files with additional logic (functions, calculations, imports):
- `imagePrompt.ts` → `imagePrompt.prompt.txt` (includes style configuration logic)
- `narrationPrompt.ts` → `narrationPrompt.prompt.txt`

### Style Files
Files with visual style configurations:
- `defaultStyle.ts` → `defaultStyle.style.txt`
- `steampunkStyle.ts` → `steampunkStyle.style.txt`
- `halloweenPatchworkStyle.ts` → `halloweenPatchworkStyle.style.txt`

## Development Workflow

1. **Edit content**: Modify `.prompt.txt` and `.style.txt` files (these are private)
2. **Update logic**: Modify `.ts` files (these are tracked in Git)
3. **Test changes**: Run the build to ensure everything works
4. **Commit changes**: Only `.ts` and `.template.txt` files are committed

## Troubleshooting

### "Using template prompt/style" warnings
- **Cause**: `.prompt.txt` or `.style.txt` file doesn't exist
- **Solution**: Run `./scripts/setup-prompts.sh` or manually copy template files

### Build errors
- **Cause**: Missing imports or syntax errors in `.ts` files
- **Solution**: Check that all imports are correct and file paths are valid

### Import errors
- **Cause**: Missing exports or incorrect file structure
- **Solution**: Ensure all `.ts` files export the required prompts

## Security Notes

- ✅ `.prompt.txt` and `.style.txt` files are gitignored and never committed
- ✅ All TypeScript logic remains in the repository
- ✅ Template files provide structure reference for other developers
- ✅ Project builds successfully with template content

## Directory Structure

```
src/promts/
├── long_study/          # Long-form educational content prompts
│   ├── prompts/         # All prompt files organized here
│   │   ├── *.prompt.template.txt
│   │   └── *.prompt.txt (gitignored)
│   └── *.ts            # TypeScript logic files
├── short_study/         # Short-form educational content prompts
│   ├── prompts/         # All prompt files organized here
│   │   ├── *.prompt.template.txt
│   │   └── *.prompt.txt (gitignored)
│   └── *.ts            # TypeScript logic files
├── horror/              # Horror content prompts
│   ├── prompts/         # All prompt files organized here
│   │   ├── *.prompt.template.txt
│   │   └── *.prompt.txt (gitignored)
│   └── *.ts            # TypeScript logic files
├── halloween/           # Halloween-themed content prompts
│   ├── prompts/         # All prompt files organized here
│   │   ├── *.prompt.template.txt
│   │   └── *.prompt.txt (gitignored)
│   └── *.ts            # TypeScript logic files
├── song_with_animals/   # Animal song content prompts
│   ├── prompts/         # All prompt files organized here
│   │   ├── *.prompt.template.txt
│   │   └── *.prompt.txt (gitignored)
│   ├── styles/          # Style configurations
│   │   ├── styles/      # All style files organized here
│   │   │   ├── *.style.template.txt
│   │   │   └── *.style.txt (gitignored)
│   │   └── *.ts        # TypeScript logic files
│   └── *.ts            # TypeScript logic files
└── index.ts            # Main exports file
```

Each subdirectory contains:
- `prompts/` subdirectory with all prompt files organized together
- `styles/` subdirectory (where applicable) with:
  - `styles/` subdirectory containing all style files organized together
  - `*.ts` files with TypeScript logic for styles
- `*.ts` files with TypeScript logic in the main directory

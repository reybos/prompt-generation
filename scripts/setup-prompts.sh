#!/bin/bash

echo "🔧 Setting up prompt and style files..."

# Setup prompt files
echo "📝 Setting up prompt files..."
find src/promts -name "*.prompt.template.txt" | while read template; do
    actual="${template%.template.txt}.txt"
    if [ ! -f "$actual" ]; then
        cp "$template" "$actual"
        echo "✅ Created: $actual"
    else
        echo "⏭️  Already exists: $actual"
    fi
done

# Setup style files
echo ""
echo "🎨 Setting up style files..."
find src/promts -name "*.style.template.txt" | while read template; do
    actual="${template%.template.txt}.txt"
    if [ ! -f "$actual" ]; then
        cp "$template" "$actual"
        echo "✅ Created: $actual"
    else
        echo "⏭️  Already exists: $actual"
    fi
done

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit the .prompt.txt files with your actual prompt content"
echo "2. Edit the .style.txt files with your actual style content"
echo "3. The .prompt.txt and .style.txt files are gitignored and will stay private"
echo "4. The .prompt.template.txt and .style.template.txt files remain in the repository as reference"
echo ""
echo "⚠️  Note: If you see warning messages about using template prompts/styles,"
echo "   it means you need to copy the template files to actual files."

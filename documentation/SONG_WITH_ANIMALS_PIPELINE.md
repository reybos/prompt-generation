# Song with Animals Pipeline

The Song with Animals Pipeline automatically splits songs into 3-line segments and generates separate content for each segment, allowing for the creation of multiple short videos from a single song.

## Overview

This pipeline is designed to create engaging children's content by:
- Taking a complete children's song with animal themes
- **Automatic Segmentation**: Songs are automatically split into 3-line segments
- **Content Generation**: Creates multiple pieces of content from one song
- **Multi-format Output**: Generates images, videos, titles, descriptions, and hashtags

## Pipeline Steps

1. **Input**: Complete song lyrics
2. **Segmentation**: Splits lyrics into 3-line segments
3. **Image Generation**: Creates image prompts for the entire song
4. **Content Generation**: For each 3-line segment:
   - Title and description
   - Hashtags
5. **Video Generation**: Creates video prompts for each segment
6. **Output**: Complete content package for each segment

## Configuration

The number of lines per segment is configurable via the `SONG_SEGMENT_LINES` environment variable. 

### Environment Variable Configuration

You can set the number of lines per segment using the `SONG_SEGMENT_LINES` environment variable:

```bash
# Set to 3 lines per segment (default)
export SONG_SEGMENT_LINES=3

# Set to 5 lines per segment
export SONG_SEGMENT_LINES=5

# Set to 2 lines per segment
export SONG_SEGMENT_LINES=2
```

### .env File Configuration

Create a `.env` file in your project root:

```bash
# Song segmentation configuration
SONG_SEGMENT_LINES=3

# Other configuration...
FAL_KEY=your_api_key_here
```

### Default Value

If `SONG_SEGMENT_LINES` is not set, the system defaults to **3 lines per segment**.

### Validation

The system validates that the value is between 1 and 10 lines. Values outside this range will generate a warning but will still work.

## Input Format

```json
{
  "songs": [
    {
      "lyrics": "Old MacDonald had a farm\nE-I-E-I-O\nAnd on his farm he had some cows\nE-I-E-I-O\nWith a moo moo here\nAnd a moo moo there\nHere a moo, there a moo\nEverywhere a moo moo"
    }
  ]
}
```

## Output Format

For each song, the pipeline generates:

### Global Content
- **global_style**: Overall visual style for the song
- **prompts**: Array of image prompts for each line

### Per-Segment Content
- **titles**: Array of titles (one per segment)
- **descriptions**: Array of descriptions (one per segment)
- **hashtags**: Array of hashtag strings (one per segment)
- **video_prompts**: Array of video prompts (one per segment)

## Example Output

```json
{
  "global_style": "Bright, colorful, child-friendly animation style",
  "prompts": [
    {
      "line": "Old MacDonald had a farm",
      "prompt": "A cheerful farmer in overalls standing in a bright farmyard"
    }
  ],
  "titles": [
    "Old MacDonald's Farm Adventure",
    "Cows and Pigs on the Farm"
  ],
  "descriptions": [
    "Join Old MacDonald on his fun farm! 🚜 Learn about farm animals and their sounds. Perfect for toddlers and preschoolers! 🐄",
    "Discover the amazing animals on Old MacDonald's farm! 🐷 Educational content that makes learning fun for kids! 🌟"
  ],
  "hashtags": [
    "#shorts #kids #farm #animals #education #toddlers #preschool #learning #fun #children",
    "#shorts #kids #farm #animals #education #toddlers #preschool #learning #fun #children"
  ],
  "video_prompts": [
    {
      "scene": 1,
      "video_prompt": "Animated scene of Old MacDonald on his farm..."
    }
  ]
}
```

## Segmentation Logic

The pipeline automatically splits songs into 3-line segments:

- **Input**: Complete song lyrics
- **Processing**: Filters out empty lines and splits into segments
- **Output**: Array of segments, each containing 3 lines (or fewer for the last segment if the total isn't divisible by 3)

## Content Generation

### Title & Description Generation
Generates engaging titles and descriptions for each 3-line segment:
- **Input**: 3-line song segment
- **Output**: JSON with title and description
- **Features**: Age-appropriate, engaging, educational focus

### Hashtag Generation
Generates relevant hashtags for each 3-line segment:
- **Input**: 3-line song segment
- **Output**: Space-separated hashtag string
- **Features**: Educational, animal-related, parent-focused hashtags

### Video Prompt Generation
Creates detailed video prompts for each segment:
- **Input**: Global style and image prompts
- **Output**: Array of video prompts for each segment
- **Features**: Scene-specific, style-consistent, engaging content

## Usage

```typescript
import { runSongWithAnimalsPipeline } from './pipeline/songWithAnimalsPipeline.js';

const input = {
  songs: [
    {
      lyrics: "Your song lyrics here..."
    }
  ]
};

const result = await runSongWithAnimalsPipeline(input);
```

## Benefits

1. **Scalability**: One song generates multiple content pieces
2. **Consistency**: Maintains visual and thematic consistency across segments
3. **Efficiency**: Automated content generation for multiple platforms
4. **Quality**: Each segment is optimized for short-form video content
5. **Flexibility**: Configurable segmentation allows for different content strategies 
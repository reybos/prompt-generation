// Test script for song with animals pipeline
// This script tests the logic for splitting songs into configurable line segments

function splitLyricsIntoSegments(lyrics) {
  const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
  const segments = [];
  const segmentLines = parseInt(process.env.SONG_SEGMENT_LINES || '3'); // Use environment variable or default to 3
  
  console.log(`\n🔧 Using ${segmentLines} lines per segment (from SONG_SEGMENT_LINES=${process.env.SONG_SEGMENT_LINES || '3'})`);
  
  for (let i = 0; i < lines.length; i += segmentLines) {
    const segment = lines.slice(i, i + segmentLines).join('\n');
    if (segment.trim()) {
      segments.push(segment);
    }
  }
  
  return segments;
}

// Test cases
const testSongs = [
  {
    name: "16-line song",
    lyrics: `Old MacDonald had a farm
E-I-E-I-O
And on his farm he had some cows
E-I-E-I-O
With a moo moo here
And a moo moo there
Here a moo, there a moo
Everywhere a moo moo
Old MacDonald had a farm
E-I-E-I-O
And on his farm he had some pigs
E-I-E-I-O
With an oink oink here
And an oink oink there
Here an oink, there an oink
Everywhere an oink oink
Old MacDonald had a farm
E-I-E-I-O`
  },
  {
    name: "12-line song", 
    lyrics: `Twinkle twinkle little star
How I wonder what you are
Up above the world so high
Like a diamond in the sky
Twinkle twinkle little star
How I wonder what you are
When the blazing sun is gone
When he nothing shines upon
Then you show your little light
Twinkle twinkle all the night
Twinkle twinkle little star
How I wonder what you are`
  },
  {
    name: "8-line song",
    lyrics: `Mary had a little lamb
Its fleece was white as snow
And everywhere that Mary went
The lamb was sure to go
It followed her to school one day
Which was against the rule
It made the children laugh and play
To see a lamb at school`
  }
];

console.log('Testing song segmentation logic:\n');

testSongs.forEach(song => {
  console.log(`\n=== ${song.name} ===`);
  console.log(`Original lyrics (${song.lyrics.split('\n').filter(line => line.trim().length > 0).length} lines):`);
  console.log(song.lyrics);
  
  const segments = splitLyricsIntoSegments(song.lyrics);
  console.log(`\nSegments (${segments.length} total):`);
  segments.forEach((segment, index) => {
    const lineCount = segment.split('\n').filter(line => line.trim().length > 0).length;
    console.log(`\nSegment ${index + 1} (${lineCount} lines):`);
    console.log(segment);
  });
  
  console.log(`\nExpected shorts: ${segments.length}`);
  console.log('---');
});

console.log('\n✅ Test completed!'); 
/**
 * Hashtags Prompt
 * Generates hashtags for a children's educational video
 */

import { PromptTemplate } from '@langchain/core/prompts';

const hashtagsPromptTemplate: string = `
You are a YouTube SEO specialist for a children's educational channel (ages 2–6).
Given the topic, script, main character (if any), and channel name, generate a list of 7–12 relevant hashtags for a YouTube Shorts video.

Rules:
* Mix general hashtags (format, age, genre) and unique, video-specific tags (topic, activity, objects, emotions, actions, character, interactive elements).
* Include hashtags related to the main activity (e.g., #countwithme, #colorhunt, #storytime, #singalong, #findtheobject, #guessgame, #animalfriends, #learnandplay, #funforkids, #rainbowfun, #bedtimestory, #readalong, etc.)
* For each video, make the selection a bit different: don't repeat the same set in every video.
* Use only lowercase English words, no special characters except #.
* Separate hashtags with spaces.

Examples:
Input:
Topic: Learning Colors: Red
Script: Bunny Sunny finds lots of red things in the garden: a red apple, a red flower, a red ball.
Main character: Sunny the Bunny
Channel name: minimarvels
Output:
#shorts #kidslearning #colorhunt #redobjects #findthered #preschoolfun #toddleractivities #minimarvels #sunnythebunny #learncolors

Input:
Topic: Counting to 3
Script: Rizzo the Raccoon and friends find three apples and count them together.
Main character: Rizzo the Raccoon
Channel name: minimarvels
Output:
#shorts #countwithme #numbersforkids #preschoolmath #toddlerfun #rizzotheraccoon #minimarvels #learnnumbers #kidsactivities #mathgames

Input:
Topic: Animals of the Forest
Script: Kids meet different forest animals and learn their sounds.
Main character: none
Channel name: minimarvels
Output:
#shorts #animalfriends #forestanimals #learnanimalsounds #natureforkids #preschooladventures #kidsdiscover #minimarvels #wildlifelearning

Input:
Topic: Shapes Around Us
Script: Robot Dotty finds shapes in the playground: circle, square, triangle.
Main character: Dotty the Robot
Channel name: minimarvels
Output:
#shorts #shapegame #playandlearn #dottytherobot #geometryforkids #preschoollearning #findtheshape #minimarvels #kidschallenge

Input:
* Topic: {topic}
* Script: {script}
* Main character: {character}
* Channel name: {channel}

Output:
#shorts #... #... #... (7-12 hashtags)
`;

const hashtagsPrompt: PromptTemplate = new PromptTemplate({
    inputVariables: ["topic", "script", "character", "channel"],
    template: hashtagsPromptTemplate
});

export {
    hashtagsPrompt,
};
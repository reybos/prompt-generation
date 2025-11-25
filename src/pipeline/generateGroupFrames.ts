/* START GENAI */
/**
 * Universal function for generating group frames
 * Handles the generation of additional group frames (every 3 characters)
 */

import { PromptTemplate } from '@langchain/core/prompts';
import { PipelineOptions, LLMRequest } from '../types/pipeline.js';
import { executePipelineStepWithTracking, safeJsonParse } from '../utils/index.js';
import { PipelineConfig } from './pipelineConfig.js';

/**
 * Interface for image prompt with line property
 */
export interface ImagePromptWithLine {
  line: string;
  prompt: string;
  index: number;
  [key: string]: any;
}

/**
 * Interface for group frame result
 */
export interface GroupFrameResult {
  index: number;
  lines: string[];
  group_image_prompt: string;
  group_video_prompt: string;
}

/**
 * Generate group frames (every 3 characters)
 * @param prompts - Array of image prompts to group
 * @param config - Pipeline configuration
 * @param options - Pipeline options
 * @param requests - Array to track LLM requests
 * @returns Array of group frame results
 */
export async function generateGroupFrames<TImagePrompt extends ImagePromptWithLine>(
  prompts: TImagePrompt[],
  config: PipelineConfig<TImagePrompt, any>,
  options: PipelineOptions,
  requests: LLMRequest[]
): Promise<GroupFrameResult[]> {
  const groupFrames: GroupFrameResult[] = [];
  
  if (!options.generateGroupFrames) {
    return groupFrames;
  }

  if (options.emitLog && options.requestId) {
    options.emitLog(`🎬 Generating group frames (every 3 characters)...`, options.requestId);
  }

  try {
    // Group prompts by 3
    const groups: TImagePrompt[][] = [];
    for (let i = 0; i < prompts.length; i += 3) {
      const group = prompts.slice(i, i + 3);
      if (group.length === 3) {
        groups.push(group);
      }
    }

    if (options.emitLog && options.requestId) {
      options.emitLog(`📚 Created ${groups.length} groups of 3 characters each`, options.requestId);
    }

    // Generate group image and video prompts for each group
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];
      if (!group) continue;
      
      if (options.emitLog && options.requestId) {
        options.emitLog(`🎨 Generating group ${groupIndex + 1}/${groups.length}...`, options.requestId);
      }

      // Prepare three character prompts for this group
      const threePrompts = group.map(p => `Line: "${p.line}"\nPrompt: ${p.prompt}`).join('\n\n');
      
      // Generate group image prompt with retry logic
      // Save last generated version even if it exceeds length limit
      let groupImagePrompt = '';
      let lastGeneratedImagePrompt = '';
      let imageAttempts = 0;
      const maxImageAttempts = 3;
      const maxImagePromptLength = 1800;
      
      while (imageAttempts < maxImageAttempts) {
        imageAttempts++;
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating group image prompt (attempt ${imageAttempts}/${maxImageAttempts})...`, options.requestId);
        }
        
        config.loggers.logGroupImagePrompt(threePrompts);
        
        const groupImageJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
          stepName: config.stepNames.groupImage,
          promptTemplate: config.prompts.groupImagePrompt,
          options: { 
            model: config.models.groupImage.model, 
            temperature: config.models.groupImage.temperature 
          },
          params: { 
            prompts: threePrompts
          },
          requests
        });

        if (groupImageJson) {
          const parsed = typeof groupImageJson === 'string' ? 
            safeJsonParse(groupImageJson, config.stepNames.groupImage) : groupImageJson;
          
          if (parsed && typeof parsed === 'object' && parsed.group_image_prompt) {
            const candidatePrompt = parsed.group_image_prompt;
            // Always save the last generated version
            lastGeneratedImagePrompt = candidatePrompt;
            
            // Validate prompt length (max 1800 characters)
            if (candidatePrompt.length <= maxImagePromptLength) {
              groupImagePrompt = candidatePrompt;
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Group image prompt generated (${candidatePrompt.length} characters)`, options.requestId);
              }
              break; // Found valid prompt, exit loop
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Group image prompt too long: ${candidatePrompt.length} characters (max ${maxImagePromptLength}). Retrying...`, options.requestId);
              }
            }
          }
        }
        
        if (imageAttempts < maxImageAttempts) {
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // If no valid prompt found but we have a last generated version, use it with warning
      if (!groupImagePrompt && lastGeneratedImagePrompt) {
        groupImagePrompt = lastGeneratedImagePrompt;
        if (options.emitLog && options.requestId) {
          options.emitLog(`⚠️ Using last generated group image prompt (${lastGeneratedImagePrompt.length} characters, exceeds max ${maxImagePromptLength})`, options.requestId);
        }
      }

      if (!groupImagePrompt) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Failed to generate group image prompt for group ${groupIndex + 1} after ${maxImageAttempts} attempts. Skipping...`, options.requestId);
        }
        continue;
      }

      // Generate group video prompt with retry logic
      // Save last generated version even if it exceeds length limit
      let groupVideoPrompt = '';
      let lastGeneratedVideoPrompt = '';
      let videoAttempts = 0;
      const maxVideoAttempts = 3;
      const maxVideoPromptLength = 1800;
      
      while (videoAttempts < maxVideoAttempts) {
        videoAttempts++;
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`🎬 Generating group video prompt (attempt ${videoAttempts}/${maxVideoAttempts})...`, options.requestId);
        }
        
        config.loggers.logGroupVideoPrompt(groupImagePrompt);
        
        const groupVideoJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
          stepName: config.stepNames.groupVideo,
          promptTemplate: config.prompts.groupVideoPrompt,
          options: { 
            model: config.models.groupVideo.model, 
            temperature: config.models.groupVideo.temperature 
          },
          params: { 
            groupImagePrompt: groupImagePrompt
          },
          requests
        });

        if (groupVideoJson) {
          const parsed = typeof groupVideoJson === 'string' ? 
            safeJsonParse(groupVideoJson, config.stepNames.groupVideo) : groupVideoJson;
          
          if (parsed && typeof parsed === 'object' && parsed.group_video_prompt) {
            const candidatePrompt = parsed.group_video_prompt;
            // Always save the last generated version
            lastGeneratedVideoPrompt = candidatePrompt;
            
            // Validate prompt length (max 1800 characters)
            if (candidatePrompt.length <= maxVideoPromptLength) {
              groupVideoPrompt = candidatePrompt;
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Group video prompt generated (${candidatePrompt.length} characters)`, options.requestId);
              }
              break; // Found valid prompt, exit loop
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Group video prompt too long: ${candidatePrompt.length} characters (max ${maxVideoPromptLength}). Retrying...`, options.requestId);
              }
            }
          }
        }
        
        if (videoAttempts < maxVideoAttempts) {
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // If no valid prompt found but we have a last generated version, use it with warning
      if (!groupVideoPrompt && lastGeneratedVideoPrompt) {
        groupVideoPrompt = lastGeneratedVideoPrompt;
        if (options.emitLog && options.requestId) {
          options.emitLog(`⚠️ Using last generated group video prompt (${lastGeneratedVideoPrompt.length} characters, exceeds max ${maxVideoPromptLength})`, options.requestId);
        }
      }

      if (!groupVideoPrompt) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Failed to generate group video prompt for group ${groupIndex + 1} after ${maxVideoAttempts} attempts. Skipping...`, options.requestId);
        }
        continue;
      }

      // Add to group frames
      groupFrames.push({
        index: groupIndex,
        lines: group.map(p => p.line),
        group_image_prompt: groupImagePrompt,
        group_video_prompt: groupVideoPrompt
      });

      if (options.emitLog && options.requestId) {
        options.emitLog(`✅ Generated group ${groupIndex + 1} with image and video prompts`, options.requestId);
      }
    }
    
    if (options.emitLog && options.requestId) {
      options.emitLog(`✅ Successfully generated ${groupFrames.length} group frames`, options.requestId);
    }
  } catch (e) {
    if (options.emitLog && options.requestId) {
      options.emitLog(`❌ Error generating group frames: ${e instanceof Error ? e.message : String(e)}. Continuing without them...`, options.requestId);
    }
  }

  return groupFrames;
}

/* END GENAI */


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
 * Interface for additional frame result
 */
export interface AdditionalFrameResult {
  index: number;
  lines: string[];
  group_image_prompt: string;
  group_video_prompt: string;
}

/**
 * Generate additional group frames (every 3 characters)
 * @param prompts - Array of image prompts to group
 * @param globalStyle - Global style string
 * @param config - Pipeline configuration
 * @param options - Pipeline options
 * @param requests - Array to track LLM requests
 * @returns Array of additional frame results
 */
export async function generateGroupFrames<TImagePrompt extends ImagePromptWithLine>(
  prompts: TImagePrompt[],
  globalStyle: string,
  config: PipelineConfig<TImagePrompt, any>,
  options: PipelineOptions,
  requests: LLMRequest[]
): Promise<AdditionalFrameResult[]> {
  const additionalFrames: AdditionalFrameResult[] = [];
  
  if (!options.generateAdditionalFrames) {
    return additionalFrames;
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
      let groupImagePrompt = '';
      let imageAttempts = 0;
      const maxImageAttempts = 3;
      
      while (imageAttempts < maxImageAttempts && !groupImagePrompt) {
        imageAttempts++;
        
        if (options.emitLog && options.requestId) {
          options.emitLog(`🖼️ Generating group image prompt (attempt ${imageAttempts}/${maxImageAttempts})...`, options.requestId);
        }
        
        config.loggers.logGroupImagePrompt(globalStyle, threePrompts);
        
        const groupImageJson: string | Record<string, any> | null = await executePipelineStepWithTracking({
          stepName: config.stepNames.groupImage,
          promptTemplate: config.prompts.groupImagePrompt,
          options: { 
            model: config.models.groupImage.model, 
            temperature: config.models.groupImage.temperature 
          },
          params: { 
            globalStyle: globalStyle,
            prompts: threePrompts
          },
          requests
        });

        if (groupImageJson) {
          const parsed = typeof groupImageJson === 'string' ? 
            safeJsonParse(groupImageJson, config.stepNames.groupImage) : groupImageJson;
          
          if (parsed && typeof parsed === 'object' && parsed.group_image_prompt) {
            const candidatePrompt = parsed.group_image_prompt;
            
            // Validate prompt length (max 1800 characters)
            if (candidatePrompt.length <= 1800) {
              groupImagePrompt = candidatePrompt;
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Group image prompt generated (${candidatePrompt.length} characters)`, options.requestId);
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Group image prompt too long: ${candidatePrompt.length} characters (max 1500). Retrying...`, options.requestId);
              }
            }
          }
        }
        
        if (!groupImagePrompt && imageAttempts < maxImageAttempts) {
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!groupImagePrompt) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Failed to generate group image prompt for group ${groupIndex + 1} after ${maxImageAttempts} attempts. Skipping...`, options.requestId);
        }
        continue;
      }

      // Generate group video prompt with retry logic
      let groupVideoPrompt = '';
      let videoAttempts = 0;
      const maxVideoAttempts = 3;
      
      while (videoAttempts < maxVideoAttempts && !groupVideoPrompt) {
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
            
            // Validate prompt length (max 1500 characters)
            if (candidatePrompt.length <= 1500) {
              groupVideoPrompt = candidatePrompt;
              if (options.emitLog && options.requestId) {
                options.emitLog(`✅ Group video prompt generated (${candidatePrompt.length} characters)`, options.requestId);
              }
            } else {
              if (options.emitLog && options.requestId) {
                options.emitLog(`⚠️ Group video prompt too long: ${candidatePrompt.length} characters (max 1500). Retrying...`, options.requestId);
              }
            }
          }
        }
        
        if (!groupVideoPrompt && videoAttempts < maxVideoAttempts) {
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!groupVideoPrompt) {
        if (options.emitLog && options.requestId) {
          options.emitLog(`❌ Failed to generate group video prompt for group ${groupIndex + 1} after ${maxVideoAttempts} attempts. Skipping...`, options.requestId);
        }
        continue;
      }

      // Add to additional frames
      additionalFrames.push({
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
      options.emitLog(`✅ Successfully generated ${additionalFrames.length} group frames`, options.requestId);
    }
  } catch (e) {
    if (options.emitLog && options.requestId) {
      options.emitLog(`❌ Error generating group frames: ${e instanceof Error ? e.message : String(e)}. Continuing without them...`, options.requestId);
    }
  }

  return additionalFrames;
}

/* END GENAI */


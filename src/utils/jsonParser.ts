/* START GENAI */
/**
 * JSON parsing utilities
 */

/**
 * Safely parse JSON with error handling, removing any markdown formatting
 * @param jsonString - The JSON string to parse
 * @param contextName - Name for error context (for logging)
 * @returns Parsed JSON object or null if parsing failed
 */
export function safeJsonParse<T = Record<string, any>>(
    jsonString: string | null | undefined,
    contextName: string
): T | null {
    try {
        // Return null for empty or non-string inputs
        if (!jsonString || typeof jsonString !== 'string') {
            console.error(`Invalid JSON string for ${contextName}: Input is empty or not a string`);
            return null;
        }

        // Remove markdown code block formatting if present
        let cleanedJson: string = jsonString
            .replace(/^```(?:json)?\s*/i, '')   // remove opening ```
            .replace(/\s*```$/, '')             // remove closing ```
            .trim();                            // remove leading/trailing whitespace

        // Try to fix common JSON issues by attempting to parse and re-stringify
        try {
            // First attempt: parse as-is
            return JSON.parse(cleanedJson) as T;
        } catch (firstError) {
            // Second attempt: fix unescaped control characters in string values
            try {
                // This regex finds string values and escapes control characters within them
                const fixedJson = cleanedJson.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, content) => {
                    const escaped = content
                        .replace(/\n/g, '\\n')
                        .replace(/\r/g, '\\r')
                        .replace(/\t/g, '\\t')
                        .replace(/\f/g, '\\f')
                        .replace(/\v/g, '\\v');
                    return `"${escaped}"`;
                });
                return JSON.parse(fixedJson) as T;
            } catch (secondError) {
                // If both attempts fail, throw the original error
                throw firstError;
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error parsing JSON for ${contextName}: ${error.message}`);
        } else {
            console.error(`Unknown error parsing JSON for ${contextName}`);
        }
        console.error('Problematic JSON string:', jsonString);
        return null;
    }
}
/* END GENAI */
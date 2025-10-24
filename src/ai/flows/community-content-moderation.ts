'use server';

/**
 * @fileOverview AI-powered content moderation flow for detecting toxic language in community posts.
 *
 * - moderateCommunityContent - A function that moderates community content.
 * - ModerateCommunityContentInput - The input type for the moderateCommunityContent function.
 * - ModerateCommunityContentOutput - The return type for the moderateCommunityContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateCommunityContentInputSchema = z.object({
  text: z
    .string() // Enforce non-empty string
    .describe('The text content of the community post to be moderated.'),
});
export type ModerateCommunityContentInput = z.infer<
  typeof ModerateCommunityContentInputSchema
>;

const ModerateCommunityContentOutputSchema = z.object({
  isToxic: z.boolean().describe('Whether the content is toxic or not.'),
  toxicityReason: z
    .string()
    .optional()
    .describe('The reason why the content is considered toxic.'),
});
export type ModerateCommunityContentOutput = z.infer<
  typeof ModerateCommunityContentOutputSchema
>;

export async function moderateCommunityContent(
  input: ModerateCommunityContentInput
): Promise<ModerateCommunityContentOutput> {
  return moderateCommunityContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateCommunityContentPrompt',
  input: {schema: ModerateCommunityContentInputSchema},
  output: {schema: ModerateCommunityContentOutputSchema},
  prompt: `You are an AI content moderator responsible for identifying toxic language in community posts.

  Analyze the following text and determine if it contains toxic language, hate speech, harassment, or any other form of inappropriate content.

  Text: {{{text}}}

  Respond with a JSON object indicating whether the content is toxic and, if so, providing a brief explanation.
  isToxic: <true|false>
  toxicityReason: <reason> // Optional
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const moderateCommunityContentFlow = ai.defineFlow(
  {
    name: 'moderateCommunityContentFlow',
    inputSchema: ModerateCommunityContentInputSchema,
    outputSchema: ModerateCommunityContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

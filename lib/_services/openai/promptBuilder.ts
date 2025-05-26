import { Effect } from "effect";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/index.mjs";
import { z } from "zod/v4";

type ToolFunctionDefinition = {
	name: string;
	description: string;
	parameters: z.ZodTypeAny;
};

export const buildFunctionCallPrompt = ({
	systemPrompt,
	userPrompt,
	tool,
}: {
	systemPrompt: string;
	userPrompt: string;
	tool: ToolFunctionDefinition;
}): Effect.Effect<ChatCompletionCreateParamsNonStreaming, never, never> =>
	Effect.sync(
		() =>
			({
				model: "gpt-4-0613",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				tools: [
					{
						type: "function",
						function: {
							name: tool.name,
							description: tool.description,
							parameters: z.toJSONSchema(tool.parameters),
						},
					},
				],
				tool_choice: {
					type: "function",
					function: { name: tool.name },
				},
			}) satisfies ChatCompletionCreateParamsNonStreaming,
	);

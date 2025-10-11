import {
	OpenAiService,
	type OpenAiServiceInitError,
} from "@/lib/_services/openai/openaiService";
import { Effect } from "effect";
import type { RequestOptions } from "openai/core";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";

export type CallOpenAiError =
	| OpenAiServiceInitError
	| { _tag: "OpenAiResponseError"; cause: unknown }
	| { _tag: "OpenAiEmptyResponseError" };

const defaultOpenAiOptions: RequestOptions = {
	timeout: 10000,
	maxRetries: 2,
};

export const callOpenAi = (
	body: ChatCompletionCreateParamsNonStreaming,
	options: RequestOptions = defaultOpenAiOptions,
): Effect.Effect<string, CallOpenAiError, OpenAiService> =>
	Effect.gen(function* (_) {
		const { client } = yield* _(OpenAiService);

		const response = yield* _(
			Effect.tryPromise({
				try: () => client.chat.completions.create(body, options),
				catch: (cause): CallOpenAiError => ({
					_tag: "OpenAiResponseError",
					cause,
				}),
			}),
		);

		const choice = response.choices?.[0];
		if (!choice || !choice.message?.content) {
			return yield* Effect.fail<CallOpenAiError>({
				_tag: "OpenAiEmptyResponseError",
			});
		}
		const content = choice.message.content;

		return content;
	});

export const callOpenAiWithFunctionCall = (
	body: ChatCompletionCreateParamsNonStreaming,
	options: RequestOptions = defaultOpenAiOptions,
): Effect.Effect<string, CallOpenAiError, OpenAiService> =>
	Effect.gen(function* (_) {
		const { client } = yield* _(OpenAiService);

		const response = yield* _(
			Effect.tryPromise({
				try: () => client.chat.completions.create(body, options),
				catch: (cause): CallOpenAiError => ({
					_tag: "OpenAiResponseError",
					cause,
				}),
			}),
		);

		const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
		const args = toolCall?.function?.arguments;

		if (!args) {
			return yield* Effect.fail({
				_tag: "OpenAiEmptyResponseError",
			} satisfies CallOpenAiError);
		}

		console.log("args: ", args);

		return args;
	});

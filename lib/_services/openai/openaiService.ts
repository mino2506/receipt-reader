import { openai } from "@/lib/openai";
import { Context, Effect, Layer } from "effect";
import type OpenAI from "openai";

export type OpenAiServiceInitError = {
	_tag: "OpenAiServiceInitError";
	cause: unknown;
};

export class OpenAiService extends Context.Tag("OpenAiService")<
	OpenAiService,
	{ client: OpenAI }
>() {}

export const makeOpenAiService = Effect.try({
	try: () => ({ client: openai }),
	catch: (cause): OpenAiServiceInitError => ({
		_tag: "OpenAiServiceInitError",
		cause,
	}),
});

export const OpenAiServiceLayer = Layer.effect(
	OpenAiService,
	makeOpenAiService,
);

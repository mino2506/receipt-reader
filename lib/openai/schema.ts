import { createApiResponseSchema } from "@/lib/api/common.schema";
import { z } from "zod";

// [General]
const GPTModelSchema = z.enum([
	"gpt-4o",
	"gpt-4o-mini",
	"gpt-4-turbo",
	"gpt-3.5-turbo",
	"gpt-3.5-turbo-0613",
	"gpt-4-0613",
	// 🔽 必要に応じて追加せよ
]);

const GPTMessageRoleSchema = z.enum(["system", "user", "assistant", "tool"]);

// [Request]
const GPTMessageSchema = z.discriminatedUnion("role", [
	z.object({
		role: z.literal("system"),
		content: z.string(),
	}),
	z.object({
		role: z.literal("user"),
		content: z.string(),
	}),
	z.object({
		role: z.literal("assistant"),
		content: z.string().nullable(),
	}),
	z.object({
		role: z.literal("tool"),
		content: z.string(),
		tool_call_id: z.string(), // ✅ 必須にする
	}),
]);

// Function Calling 用ツールの型（必要に応じて拡張可能）
const ToolFunctionSchema = z.strictObject({
	type: z.literal("function"),
	function: z.strictObject({
		name: z.string(),
		description: z.string(),
		strict: z.union([z.boolean(), z.null()]),
		parameters: z.object({
			type: z.literal("object"),
			properties: z.record(z.string(), z.any()),
			required: z.array(z.string()).optional(),
			additionalProperties: z.boolean().optional(),
		}),
	}),
});

// tool_choice の具体的構造（function呼び出し名または auto / none）
const ToolChoiceSchema = z.union([
	z.literal("none"),
	z.literal("auto"),
	z.object({
		type: z.literal("function"),
		function: z.object({
			name: z.string(),
		}),
	}),
]);

export const OpenAIRequestSchema = z.object({
	model: GPTModelSchema,
	messages: z.array(GPTMessageSchema).nonempty(),
	temperature: z.number().min(0).max(2).default(0.1),
	max_tokens: z.number().int().positive().default(1500),
	top_p: z.number().min(0).max(1).default(1),
	frequency_penalty: z.number().min(-2).max(2).default(0),
	presence_penalty: z.number().min(-2).max(2).default(0),

	// 🔽 以下、追加項目
	// 🌟 OpenAI型に厳密に準拠したかったけど、複雑すぎるので必要になったら追加して！
	// n: z.union([z.number(), z.null()]),
	// stop: z.union([z.string(), z.array(z.string())]).optional(),
	// logprobs: z.union([z.boolean(), z.null()]),
	// seed: z.union([z.number(), z.null()]),
	// user: z.string().optional(),
	// response_format: z.enum(["text", "json_object", "json_schema"]).optional(),
	// ❗（オプション）tools を .nonempty() にしてもよい
	// tools: z.array(ToolFunctionSchema).optional(),
	tools: z.array(ToolFunctionSchema).nonempty().optional(),
	tool_choice: ToolChoiceSchema.optional(),
	// 🔼 ここまで追加
});

export type OpenAIRequest = z.infer<typeof OpenAIRequestSchema>;

// [Response]
const OpenAIToolCallsSchema = z
	.array(
		z.object({
			id: z.string(),
			type: z.literal("function"),
			function: z.object({
				name: z.string(),
				arguments: z.string(), // ← JSON文字列形式
			}),
		}),
	)
	.optional();

export const OpenAIChatCompletionChoiceSchema = z.object({
	index: z.number(),
	message: z.object({
		role: GPTMessageRoleSchema,
		content: z.string().nullable(),
		tool_calls: OpenAIToolCallsSchema,
	}),
	finish_reason: z.union([
		z.literal("stop"),
		z.literal("length"),
		z.literal("content_filter"),
		z.literal("tool_calls"),
		z.null(),
	]),
	logprobs: z.unknown().nullable().optional(), // or z.record(z.string(), z.any())
});

const OpenAIChatCompletionUsageSchema = z.object({
	prompt_tokens: z.number(),
	completion_tokens: z.number(),
	total_tokens: z.number(),
});

export const OpenAIChatCompletionResponseSchema = z.object({
	id: z.string(),
	object: z.string(),
	created: z.number(),
	choices: z.array(OpenAIChatCompletionChoiceSchema).nonempty(),
	usage: OpenAIChatCompletionUsageSchema.optional(),
	system_fingerprint: z.string().nullable().optional(),
});

export type OpenAIChatCompletionResponse = z.infer<
	typeof OpenAIChatCompletionResponseSchema
>;

export const OpenAIApiResponseSchema = createApiResponseSchema(
	OpenAIChatCompletionResponseSchema,
);

export type OpenAIApiResponse = z.infer<typeof OpenAIApiResponseSchema>;

export type PrismaTaggedError =
	| { _tag: "UniqueConstraintViolation"; target: string[] }
	| { _tag: "ForeignKeyConstraintViolation"; field: string }
	| { _tag: "RecordNotFound"; model?: string }
	| { _tag: "ValidationError"; reason: string }
	| { _tag: "InternalPrismaError"; cause: unknown };

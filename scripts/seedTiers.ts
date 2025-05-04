import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const tiers = [
		{
			id: "a69623a6-def2-4c12-980c-beefd8b633fe",
			name: "free",
			maxAiTokens: 10000,
			maxAiCalls: 100,
			maxOcrCalls: 100,
			priceJPY: 0,
		},
		{
			id: "e64e155b-6656-4b3e-a1ab-3064fb5f4d22",
			name: "standard",
			maxAiTokens: 100000,
			maxAiCalls: 1000,
			maxOcrCalls: 1000,
			priceJPY: 980,
		},
		{
			id: "e3640c35-ff97-468d-bce8-eadf82c1e648",
			name: "pro",
			maxAiTokens: 1000000,
			maxAiCalls: 10000,
			maxOcrCalls: 10000,
			priceJPY: 2980,
		},
		{
			id: "821dadf0-43f7-458d-b73b-7ab52a78b5d8",
			name: "developer",
			maxAiTokens: 1000000,
			maxAiCalls: 10000,
			maxOcrCalls: 10000,
			priceJPY: 0,
		},
	];

	for (const tier of tiers) {
		await prisma.tier.upsert({
			where: { name: tier.name },
			update: tier,
			create: tier,
		});
		console.log(`✅ Upserted tier: ${tier.name}`);
	}
}

main()
	.catch((e) => {
		console.error("❌ Error seeding tiers", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

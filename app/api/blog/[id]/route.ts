import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { main } from "../route";

/**
 * API: GET POST BY ID
 * supabaseから特定の記事を取得する。
 * url: /api/blog/[id]
 * @param req - Request
 * @param res - NextResponse
 * @returns - Promise< NextResponse< { message; post; } > | NextResponse< { message; error; } > >
 */
export const GET = async (req: Request, res: NextResponse) => {
	console.log("\n\n🫴🎁~~~   GEEEEEEEEEET!!!🤩🤩🤩📦📦📦\n");
	try {
		const id: number =
			req.url && typeof req.url === "string"
				? Number.parseInt(req.url.split("/blog/")[1] as string)
				: 1;

		await main();
		const post = await prisma.post.findFirst({ where: { id } });
		return NextResponse.json({ message: "Success", post }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
};

export const PUT = async (req: Request, res: NextResponse) => {
	console.log("\n\n~~~🔄📝  UPDAAAAAAATE!!!⚡⚡⚡🔥🔥🔥\n");
	try {
		const id: number =
			req.url && typeof req.url === "string"
				? Number.parseInt(req.url.split("/blog/")[1] as string)
				: 1;
		const { title, description } = await req.json();

		await main();
		const post = await prisma.post.update({
			where: { id },
			data: { title, description },
		});
		return NextResponse.json({ message: "Success", post }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
};

export const DELETE = async (req: Request, res: NextResponse) => {
	console.log("\n\n~~~💀❌   DELEEEEEEETE!!!☠️☠️☠️💢💢💢\n");
	try {
		const id: number =
			req.url && typeof req.url === "string"
				? Number.parseInt(req.url.split("/blog/")[1] as string)
				: 0; // id = 0 は存在しないためエラー

		await main();
		const post = await prisma.post.delete({
			where: { id },
		});
		return NextResponse.json({ message: "Success", post }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
};

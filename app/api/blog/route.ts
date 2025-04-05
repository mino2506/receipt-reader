import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function main() {
	try {
		await prisma.$connect();
	} catch (error) {
		return Error("DB接続に失敗しました");
	}
}

/**
 * API: GET ALL POSTS
 * supabaseからすべての記事を取得する。
 * @param req - Request
 * @param res - NextResponse
 * @returns -Promise< NextResponse< { message; posts[]; } > | NextResponse< { message; error; } > >
 */
export const GET = async (req: Request, res: NextResponse) => {
	console.log("\n\n🫴🎁~~~   GEEEEEEEEEET!!!🤩🤩🤩📦📦📦\n");
	try {
		await main();
		const posts = await prisma.post.findMany();
		return NextResponse.json({ message: "Success", posts }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
};

/**
 * API: CREATE POST
 * supabaseに新しい記事を作成する。
 * @param req - Request
 * @param res - NextResponse
 * @returns - Promise< NextResponse< { message; post; } > | NextResponse< { message; error; } > >
 */

export const POST = async (req: Request, res: NextResponse) => {
	console.log("\n\n~~~📨📮   POOOOOOOOOST!!!🚀🚀🚀🆕🆕🆕\n");
	try {
		const { title, description } = await req.json();

		await main();
		const post = await prisma.post.create({
			data: {
				title,
				description,
			},
		});
		return NextResponse.json({ message: "Success", post }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ message: "Error", error }, { status: 500 });
	} finally {
		await prisma.$disconnect();
	}
};

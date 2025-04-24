import { trpc } from "@/lib/trpc/client";

import ReceiptTable from "./ReceiptTable";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, Loader2, Plus } from "lucide-react";

export default function AllReceiptsTable() {
	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = trpc.receipt.getReceipts.useInfiniteQuery(
		{
			limit: 10,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	if (isLoading) return <div>読み込み中...</div>;

	if (error) return <div>エラー: {error.message}</div>;

	if (!data) return <div>データがありません</div>;

	return (
		<div className="flex flex-col items-center justify-center w-max-full">
			<Card className="w-full mb-4 border shadow-sm">
				<CardContent className="p-2">
					<CardHeader className="p-3 text-base font-semibold">
						📃レシート一覧
					</CardHeader>
					<ReceiptTable data={data.pages.flatMap((p) => p.receipts)} />

					{hasNextPage && (
						<div className="flex justify-center mt-4">
							<Button
								variant="secondary"
								type="button"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
								className="flex items-center gap-2"
							>
								{isFetchingNextPage ? (
									<>
										<Loader2 className="animate-spin w-4 h-4" />
										読み込み中...
									</>
								) : (
									<>
										<ChevronDown className="w-4 h-4" />
										もっと見る
									</>
								)}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

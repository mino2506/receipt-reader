import { trpc } from "@/lib/trpc/client";

import { ReceiptTable } from "./ReceiptTable";

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
			limit: 5,
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
			<h1 className="text-xl font-bold m-4">📃レシート一覧</h1>
			<ReceiptTable data={data.pages.flatMap((p) => p.receipts)} />
		</div>
	);
}

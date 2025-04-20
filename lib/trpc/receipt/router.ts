import { router } from "../core";
import { getReceiptById } from "./getReceiptById";
import { getReceipts } from "./getReceipts";
import { updateDetail } from "./updateDetail";

export const receiptRouter = router({
	getReceipts,
	getReceiptById,
	updateDetail,
});

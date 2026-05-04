import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"

export function TransactionViewModal({
    open,
    onOpenChange,
    transaction,
    onEdit,
    onDelete,
}: any) {
    if (!transaction) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
                {/* HEADER */}
                <div className="p-5 border-b bg-muted/30">
                    <p className="text-xs text-muted-foreground">Transação</p>
                    <h2 className="text-base font-semibold truncate">
                        {transaction.name}
                    </h2>
                </div>

                {/* BODY */}
                <div className="p-5 space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Valor</span>
                        <span
                            className={`text-lg font-bold ${transaction.type === "entrada"
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            {transaction.type === "entrada" ? "+" : "-"} R${" "}
                            {transaction.amount.toFixed(2)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground text-xs">Categoria</p>
                            <p className="font-medium">{transaction.category}</p>
                        </div>

                        <div>
                            <p className="text-muted-foreground text-xs">Conta</p>
                            <p className="font-medium">{transaction.account}</p>
                        </div>

                        <div className="col-span-2">
                            <p className="text-muted-foreground text-xs">Data</p>
                            <p className="font-medium">
                                {new Date(transaction.date + "T00:00").toLocaleDateString("pt-BR")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {

                            if (!onEdit) {
                                return
                            }

                            onEdit(transaction)
                        }}
                    >
                        Editar
                    </Button>

                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={onDelete}
                    >
                        Excluir
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

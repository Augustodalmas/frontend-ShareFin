"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, FileX, Plus } from "lucide-react"

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T extends { id: number | string }> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onAdd?: () => void
  addButtonText?: string
  emptyMessage?: string
  emptyDescription?: string
}

import React from "react"

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  onRowClick,
  onEdit,
  onDelete,
  onAdd,
  addButtonText = "Adicionar",
  emptyMessage = "Nenhum registro encontrado",
  emptyDescription = "Adicione itens para começar a visualizar dados aqui",
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden w-full shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="text-right w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {onAdd && (
              <TableRow className="hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors border-b-2 border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10">
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="py-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/30 font-medium"
                    onClick={onAdd}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {addButtonText}
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    <FileX className="h-12 w-12 text-muted-foreground/50" />
                    <div>
                      <p className="text-muted-foreground font-medium">{emptyMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
                    </div>
                    {onAdd && (
                      <Button size="sm" onClick={onAdd} className="mt-1">
                        <Plus className="mr-2 h-4 w-4" />
                        {addButtonText}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  {columns.map((column, index) => (
                    <TableCell key={index} className={column.className}>
                      {typeof column.accessor === "function"
                        ? column.accessor(row)
                        : String(row[column.accessor])}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); onEdit(row) }}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); onDelete(row) }}
                            aria-label="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

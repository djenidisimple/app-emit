'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'

type TableRootProps = ComponentProps<typeof ark.table>
type TableHeaderProps = ComponentProps<typeof ark.thead>
type TableBodyProps = ComponentProps<typeof ark.tbody>
type TableRowProps = ComponentProps<typeof ark.tr>
type TableCellProps = ComponentProps<typeof ark.td>
type TableHeadProps = ComponentProps<typeof ark.th>

const tableStyles = {
  root: "w-full caption-bottom text-sm",
  header: "border-b border-neutral-200",
  body: "",
  row: "border-b border-neutral-200 transition-colors hover:bg-[#F7F7FA]",
  cell: "p-3 align-middle text-[13px] text-[#555A6E]",
  head: "p-3 align-middle text-[11px] font-bold text-[#8A8FA3] uppercase tracking-wider",
  footer: "border-t border-neutral-200 bg-[#F7F7FA] font-medium",
}

const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function Table(props, ref) {
  const { className, ...rest } = props
  return <ark.table ref={ref} className={`${tableStyles.root}${className ? ` ${className}` : ''}`} {...rest} />
})

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(props, ref) {
  const { className, ...rest } = props
  return <ark.thead ref={ref} className={`${tableStyles.header}${className ? ` ${className}` : ''}`} {...rest} />
})

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(props, ref) {
  const { className, ...rest } = props
  return <ark.tbody ref={ref} className={`${tableStyles.body}${className ? ` ${className}` : ''}`} {...rest} />
})

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(props, ref) {
  const { className, ...rest } = props
  return <ark.tr ref={ref} className={`${tableStyles.row}${className ? ` ${className}` : ''}`} {...rest} />
})

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(props, ref) {
  const { className, ...rest } = props
  return <ark.td ref={ref} className={`${tableStyles.cell}${className ? ` ${className}` : ''}`} {...rest} />
})

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(props, ref) {
  const { className, ...rest } = props
  return <ark.th ref={ref} className={`${tableStyles.head}${className ? ` ${className}` : ''}`} {...rest} />
})

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Head: TableHead,
})

export { TableHeader, TableBody, TableRow, TableCell, TableHead }

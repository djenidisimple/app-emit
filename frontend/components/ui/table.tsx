'use client'
import { ark } from '@ark-ui/react/factory'
import { type ComponentProps, forwardRef } from 'react'
import { cx } from 'styled-system/css'
import { table } from 'styled-system/recipes'

type TableRootProps = ComponentProps<typeof ark.table>
type TableHeaderProps = ComponentProps<typeof ark.thead>
type TableBodyProps = ComponentProps<typeof ark.tbody>
type TableRowProps = ComponentProps<typeof ark.tr>
type TableCellProps = ComponentProps<typeof ark.td>
type TableHeadProps = ComponentProps<typeof ark.th>

const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function Table(props, ref) {
  const { className, ...rest } = props
  const styles = table()
  return <ark.table ref={ref} className={cx(styles.root, className)} {...rest} />
})

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(props, ref) {
  const { className, ...rest } = props
  const styles = table()
  return <ark.thead ref={ref} className={cx(styles.header, className)} {...rest} />
})

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(props, ref) {
  const { className, ...rest } = props
  const styles = table()
  return <ark.tbody ref={ref} className={cx(styles.body, className)} {...rest} />
})

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(props, ref) {
  const { className, ...rest } = props
  const styles = table()
  return <ark.tr ref={ref} className={cx(styles.row, className)} {...rest} />
})

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(props, ref) {
  const { className, ...rest } = props
  const styles = table()
  return <ark.td ref={ref} className={cx(styles.cell, className)} {...rest} />
})

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(props, ref) {
  const { className, ...rest } = props
  const styles = table()
  return <ark.th ref={ref} className={cx(styles.head, className)} {...rest} />
})

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Head: TableHead,
})

export { TableHeader, TableBody, TableRow, TableCell, TableHead }

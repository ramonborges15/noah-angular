import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';

export interface TableAction {
  title: string;
  callback: (row: any) => void;
  icon?: string; // opcional, caso queira um ícone para a ação
}

export interface TableColumn {
  title: string;
  prop: string;
  sortable?: boolean;
  width?: string;
  actions?: TableAction[]; // Adiciona as ações à coluna
}

@Component({
  selector: 'lib-table',
  imports: [CommonModule, DropdownComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  @Input() public columns: TableColumn[] = [];
  @Input() public data: any[] = [];
  @Input() public columnTypes: { [key: string]: 'string' | 'date' | 'time' | 'tag' } = {};
  @Input() public page: number = 1;
  @Input() public pageSize: number = 10;
  @Input() public totalItems: number = 0;
  @Input() public pageSizeOptions: { value: number, label: string }[] = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get hasActions(): boolean {
    return this.columns.some(c => !!c.actions && c.actions.length > 0);
  }

  get actionsList(): TableAction[] {
    const col = this.columns.find((c: TableColumn) => !!c.actions && c.actions.length > 0);
    return col?.actions || [];
  }

  public onPageSizeChange(newSize: number): void {
    this.pageSizeChange.emit(newSize);
  }

  // Paginação
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get currentPage(): number {
    return this.page;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  getPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 8) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total - 1, total);
      } else if (current >= total - 3) {
        pages.push(1, 2);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1, 2);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total - 1, total);
      }
    }
    return pages;
  }

  toNumber(val: any): number {
    return typeof val === 'number' ? val : parseInt(val, 10);
  }
}

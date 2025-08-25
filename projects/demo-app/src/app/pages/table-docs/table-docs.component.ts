import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableComponent } from '../../../../../shared-components/src/lib/table/table.component';

@Component({
    selector: 'app-table-docs',
    imports: [CommonModule, TableComponent],
    templateUrl: './table-docs.component.html'
})
export class TableDocsComponent {
    columns = [
        { title: 'ID', prop: 'id', sortable: true },
        { title: 'Nome', prop: 'name', sortable: true },
        { title: 'Email', prop: 'email' },
        { title: 'Data de Cadastro', prop: 'createdAt', sortable: true },
        { title: 'Status', prop: 'status', sortable: true, },
        {
            title: 'Ações', prop: 'actions', actions: [
                { title: 'Editar', icon: 'edit', callback: (row: any) => this.onEdit(row) },
                { title: 'Excluir', icon: 'delete', callback: (row: any) => this.onDelete(row) }
            ]
        }
    ];

    data = [
        { id: 1, name: 'João Silva', email: 'joao@email.com', createdAt: new Date(2024, 2, 10), status: 'Ativo', statusClass: 'text-bg-success' },
        { id: 2, name: 'Maria Souza', email: 'maria@email.com', createdAt: new Date(2024, 5, 22), status: 'Inativo', statusClass: 'text-bg-secondary' },
        { id: 3, name: 'Carlos Lima', email: 'carlos@email.com', createdAt: new Date(2024, 7, 1), status: 'Ativo', statusClass: 'text-bg-success' },
        { id: 4, name: 'Ana Paula', email: 'ana@email.com', createdAt: new Date(2024, 8, 15), status: 'Pendente', statusClass: 'text-bg-warning' },
        { id: 5, name: 'Bruno Costa', email: 'bruno@email.com', createdAt: new Date(2024, 9, 3), status: 'Ativo', statusClass: 'text-bg-success' },
        { id: 6, name: 'Fernanda Alves', email: 'fernanda@email.com', createdAt: new Date(2024, 10, 12), status: 'Inativo', statusClass: 'text-bg-secondary' },
        { id: 7, name: 'Lucas Pereira', email: 'lucas@email.com', createdAt: new Date(2024, 11, 20), status: 'Ativo', statusClass: 'text-bg-success' },
        { id: 8, name: 'Patrícia Gomes', email: 'patricia@email.com', createdAt: new Date(2024, 3, 8), status: 'Pendente', statusClass: 'text-bg-warning' },
        { id: 9, name: 'Ricardo Martins', email: 'ricardo@email.com', createdAt: new Date(2024, 4, 17), status: 'Ativo', statusClass: 'text-bg-success' },
        { id: 10, name: 'Juliana Dias', email: 'juliana@email.com', createdAt: new Date(2024, 5, 25), status: 'Inativo', statusClass: 'text-bg-secondary' },
        { id: 11, name: 'Gabriel Rocha', email: 'gabriel@email.com', createdAt: new Date(2024, 6, 30), status: 'Ativo', statusClass: 'text-bg-success' }
    ];

    columnTypes: { [key: string]: 'string' | 'date' | 'time' | 'tag' } = {
        createdAt: 'date',
        status: 'tag'
    };

    public columnsSnippet = `[
    { title: 'Nome', prop: 'name' },
    { title: 'Status', prop: 'status', width: '120px', sortable: true },
    { title: 'Ações', prop: 'actions', actions: [...] }
]`

    public dataSnippet = `[
    { name: 'João', status: 'Ativo', statusClass: 'text-bg-success' },
    { name: 'Maria', status: 'Inativo', statusClass: 'text-bg-danger' }
]`;

    public columnTypesSnippet = `{ [key: string]: 'string' | 'date' | 'time' | 'tag' }`;
    public columnTypesExampleSnippet = `{
    status: 'tag',
    createdAt: 'date'
}`;

    public statusClassSnippet = `{
    status: 'Ativo',
    statusClass: 'text-bg-success'
}`;

    public actionsSnippet = `actions: [
    { title: 'Editar', icon: 'edit', callback: (row) => ... },
    { title: 'Excluir', icon: 'delete', callback: (row) => ... }
]`;

    public page: number = 1;
    public pageSize: number = 10;
    public totalItems: number = 50;

    onEdit(row: any) {
        alert('Editar: ' + JSON.stringify(row));
    }

    onDelete(row: any) {
        alert('Excluir: ' + JSON.stringify(row));
    }

    public onPageChange(goTo: number): void {
        this.page = goTo;
        console.log('Página atual:', this.page);
    }

    public onPageSizeChange(newSize: number): void {
        this.pageSize = newSize;
        this.page = 1;
        console.log('Novo tamanho de página:', this.pageSize);
    }
}
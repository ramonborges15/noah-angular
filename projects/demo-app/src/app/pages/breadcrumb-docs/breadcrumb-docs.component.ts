import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { BreadcrumbComponent } from "../../../../../shared-components/src/lib/breadcrumb/breadcrumb.component";

@Component({
    selector: 'app-breadcrumb-docs',
    imports: [CommonModule, BreadcrumbComponent],
    templateUrl: './breadcrumb-docs.component.html',
})
export class BreadcrumbDocsComponent {
    public breadcrumbItems: Array<{ label: string, url?: string }> = [
        { label: 'Home', url: '/' },
        { label: 'Library', url: '/breadcrumb' },
        { label: 'Data', url: '/data' }
    ];
}
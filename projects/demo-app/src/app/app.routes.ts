import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { DropdownDocsComponent } from './pages/dropdown-docs/dropdown-docs.component';
import { InputDocsComponent } from './pages/input-docs/input-docs.component';
import { ButtonDocsComponent } from './pages/button-docs/button-docs.component';
import { TableDocsComponent } from './pages/table-docs/table-docs.component';
import { BreadcrumbDocsComponent } from './pages/breadcrumb-docs/breadcrumb-docs.component';
import { CheckboxDocsComponent } from './pages/checkbox-docs/checkbox-docs.component';
import { ToggleDocsComponent } from './pages/toggle/toggle-docs.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: '/home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'dropdown', component: DropdownDocsComponent },
            { path: 'input', component: InputDocsComponent },
            { path: 'table', component: TableDocsComponent },
            { path: 'button', component: ButtonDocsComponent },
            { path: 'breadcrumb', component: BreadcrumbDocsComponent },
            { path: 'checkbox', component: CheckboxDocsComponent },
            { path: 'toggle', component: ToggleDocsComponent }
        ]
    }
];

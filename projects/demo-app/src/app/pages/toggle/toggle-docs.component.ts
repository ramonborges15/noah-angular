import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ToggleComponent } from "../../../../../shared-components/src/lib/toggle/toggle.component";

@Component({
    selector: 'app-toggle-docs',
    imports: [ToggleComponent, ReactiveFormsModule, CommonModule],
    templateUrl: './toggle-docs.component.html',
})
export class ToggleDocsComponent {
    form = new FormGroup({
        toggle1: new FormControl(false),
        toggle2: new FormControl(true),
        toggleFiltro: new FormControl(false)
    });

    get toggle1Control() {
        return this.form.get('toggle1') as FormControl;
    }
    get toggle2Control() {
        return this.form.get('toggle2') as FormControl;
    }
    get toggleFiltroControl() {
        return this.form.get('toggleFiltro') as FormControl;
    }
}
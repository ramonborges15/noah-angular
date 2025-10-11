import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CheckboxComponent } from "../../../../../shared-components/src/lib/checkbox/checkbox.component";

@Component({
    selector: 'app-checkbox-docs',
    imports: [CheckboxComponent, ReactiveFormsModule, CommonModule],
    templateUrl: './checkbox-docs.component.html',
})
export class CheckboxDocsComponent {
    // Opções para múltipla e única seleção
    multiOptions = [
        { label: 'Opção A', value: 'A' },
        { label: 'Opção B', value: 'B' },
        { label: 'Opção C', value: 'C' }
    ];
    singleOptions = [
        { label: 'Sim', value: true },
        { label: 'Não', value: false }
    ];

    // Reactive Forms
    form = new FormGroup({
        multi: new FormControl(['A'], Validators.required),
        single: new FormControl(null, Validators.required),
        multiDisabled: new FormControl({ value: ['B'], disabled: true })
    });

    get multiControl(): FormControl {
        return this.form.get('multi') as FormControl;
    }

    get singleControl(): FormControl {
        return this.form.get('single') as FormControl;
    }
    get multiDisabledControl(): FormControl {
        return this.form.get('multiDisabled') as FormControl;
    }

    get multiSelected() {
        return this.multiControl.value;
    }
    get singleSelected() {
        return this.singleControl.value;
    }
    get multiSelectedDisabled() {
        return this.multiDisabledControl.value;
    }
}
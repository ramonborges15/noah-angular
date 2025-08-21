import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ButtonComponent } from "../../../../../shared-components/src/lib/button/button.component";

@Component({
    selector: 'app-button-docs',
    imports: [ReactiveFormsModule, CommonModule, ButtonComponent],
    templateUrl: './button-docs.component.html',
})
export class ButtonDocsComponent {

    public loading: boolean = false;

    public clicouNoBotao(): void {
        console.log('Botão clicado!');
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
        }, 3000);
    }
}
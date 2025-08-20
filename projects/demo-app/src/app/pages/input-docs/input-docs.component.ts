import { Component } from "@angular/core";
import { DropdownComponent, InputComponent } from "../../../../../shared-components/src/public-api";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-input-docs',
  imports: [InputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './input-docs.component.html',
})
export class InputDocsComponent {
  public form!: FormGroup;

  public editData = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    dateOfBirth: '1990-04-30',
    phoneNumber: '12345678901'
  };

  public customErrorMessages = {
    required: 'Este campo é obrigatório',
    email: 'Por favor, insira um email válido',
    minlength: 'O valor deve ter pelo menos 3 caracteres',
    maxlength: 'O valor não pode exceder 50 caracteres',
    min: 'O valor é muito baixo',
    max: 'O valor é muito alto',
    pattern: 'Formato inválido'
  };

  public formSnippet = `
    this.form = this.fb.group({
      name: [{ value: null, disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [null, [Validators.required, Validators.email]],
      dateOfBirth: [null, [Validators.required, Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]],
      phoneNumber: [null, [Validators.required, Validators.pattern('^\\d{2}\\d{4,5}\\d{4}$')]]
    })
  `;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: [{ value: null, disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: [null, [Validators.required, Validators.email]],
      dateOfBirth: [null, [Validators.required, Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]],
      phoneNumber: [null, [Validators.required, Validators.pattern('^\\d{2}\\d{4,5}\\d{4}$')]]
    })
  }

  loadEditData() {
    this.form.patchValue(this.editData);
  }

  clearForm() {
    this.form.reset();
  }

  public onSubmit() {
    if (this.form.valid) {
      console.log('Form Value:', this.form.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
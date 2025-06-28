import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownComponent } from '../../../shared-components/src/public-api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [DropdownComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'demo-app';

  public form!: FormGroup;

  public options = [
    { value: 'brasil', label: 'Brasil' },
    { value: 'eua', label: 'Estados Unidos' },
    { value: 'canada', label: 'Canadá' },
    { value: 'argentina', label: 'Argentina' }
  ];

  // Valores para simular dados de edição
  public editData = {
    country: 'brasil' // Valor pré-selecionado
  };

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      country: [null, Validators.required],
    });
  }

  // Simula carregar dados para edição
  loadEditData() {
    this.form.patchValue(this.editData);
  }

  // Limpa o formulário
  clearForm() {
    this.form.reset();
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Form Value:', this.form.value);
    } else {
      console.log('Form is invalid');
    }
  }
}

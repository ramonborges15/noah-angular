import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, Injector } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, NgControl } from '@angular/forms';

export type InputType = 'text' | 'number' | 'date' | 'email' | 'password';

@Component({
  selector: 'lib-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements OnInit, ControlValueAccessor {

  @Input() public label: string = 'Nome do campo';
  @Input() public placeholder: string = 'Digite aqui...';
  @Input() public type: InputType = 'text';
  @Input() public customErrorMessages: { [key: string]: string } = {};

  // Detects if the field is required based on FormControl validator
  public get isRequired(): boolean {
    if (this.control?.control?.validator) {
      const validator = this.control.control.validator({} as FormControl);
      return !!(validator && validator['required']);
    }
    return false;
  }

  // Detects if the field is disabled
  public get isDisabled(): boolean {
    return (this.control?.control?.disabled ?? false);
  }

  public value: any = '';
  public isFocused: boolean = false;
  public control?: NgControl;

  // ControlValueAccessor implementation
  private onChange = (value: any) => { };
  private onTouched = () => { };

  // Mapeamento padrão de mensagens de erro
  private defaultErrorMessages: { [key: string]: string } = {
    required: 'Campo obrigatório',
    email: 'Email inválido',
    minlength: 'Muito curto',
    maxlength: 'Muito longo',
    min: 'Valor muito baixo',
    max: 'Valor muito alto',
    pattern: 'Formato inválido'
  };

  constructor(private injector: Injector) { }

  ngOnInit() {
    // Injeta o NgControl para acessar os erros do FormControl
    this.control = this.injector.get(NgControl, null) || undefined;
  }

  public onFocus(): void {
    this.isFocused = true;
    this.onTouched();
  }

  public onBlur(): void {
    this.isFocused = false;
  }

  public onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let newValue: any = target.value;

    // Conversão de tipos
    if (this.type === 'number') {
      newValue = newValue === '' ? null : Number(newValue);
    }

    this.value = newValue;
    this.onChange(newValue);
  }

  // Verifica se deve mostrar erro
  public get showError(): boolean {
    return !!(this.control?.invalid && (this.control?.dirty || this.control?.touched));
  }

  public get showRequiredAsterisk(): boolean {
    return !!this.isRequired && !!this.control?.invalid;
  }

  // Obtém a mensagem de erro do FormControl
  public get errorMessage(): string {
    if (!this.control?.errors) {
      return '';
    }

    const errors = this.control.errors;

    // Primeiro verifica se há mensagem customizada
    for (const errorKey in errors) {
      if (this.customErrorMessages[errorKey]) {
        const errorValue = errors[errorKey];
        return this.interpolateErrorMessage(this.customErrorMessages[errorKey], errorValue);
      }
    }

    // Depois verifica mensagens padrão
    for (const errorKey in errors) {
      if (this.defaultErrorMessages[errorKey]) {
        const errorValue = errors[errorKey];
        return this.interpolateErrorMessage(this.defaultErrorMessages[errorKey], errorValue);
      }
    }

    // Retorna erro genérico se não encontrar mensagem específica
    return 'Campo inválido';
  }

  // Interpola valores dinâmicos na mensagem de erro
  private interpolateErrorMessage(message: string, errorValue: any): string {
    if (typeof errorValue === 'object') {
      // Para erros como minlength, maxlength, min, max
      if (errorValue.requiredLength) {
        message = message.replace('{{requiredLength}}', errorValue.requiredLength);
        message = message.replace('{{actualLength}}', errorValue.actualLength);
      }
      if (errorValue.min !== undefined) {
        message = message.replace('{{min}}', errorValue.min);
        message = message.replace('{{actual}}', errorValue.actual);
      }
      if (errorValue.max !== undefined) {
        message = message.replace('{{max}}', errorValue.max);
        message = message.replace('{{actual}}', errorValue.actual);
      }
    }
    return message;
  }

  private validateField(): void {
    // Removido - agora usa a validação do FormControl
  }

  public hasValue(): boolean {
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

}

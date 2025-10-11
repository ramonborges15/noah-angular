import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-checkbox',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  /** Array de opções: [{ label: string, value: any }] */
  @Input() options: Array<{ label: string; value: any }> = [];
  /** Se true, permite múltipla seleção */
  @Input() multiple = false;
  /** FormControl do Reactive Forms */
  @Input() control?: FormControl;
  /** Emite valor selecionado ao pai (opcional) */
  @Output() selectedChange = new EventEmitter<any[] | any>();

  get disabled(): boolean {
    return !!this.control?.disabled;
  }

  get selected(): any[] | any {
    return this.control?.value;
  }

  isChecked(value: any): boolean {
    if (this.multiple) {
      return Array.isArray(this.selected) && this.selected.includes(value);
    }
    return this.selected === value;
  }

  onOptionChange(event: Event, value: any) {
    if (this.disabled) return;
    if (this.multiple) {
      const checked = (event.target as HTMLInputElement).checked;
      let newSelected = Array.isArray(this.selected) ? [...this.selected] : [];
      if (checked) {
        if (!newSelected.includes(value)) newSelected.push(value);
      } else {
        newSelected = newSelected.filter(v => v !== value);
      }
      this.control?.setValue(newSelected);
      this.control?.markAsDirty();
      this.selectedChange.emit(newSelected);
    } else {
      this.control?.setValue(value);
      this.control?.markAsDirty();
      this.selectedChange.emit(value);
    }
  }

  get showError(): boolean {
    return !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get errorMessage(): string | null {
    if (!this.control || !this.control.errors) return null;
    if (this.control.errors['required']) return 'Seleção obrigatória.';
    // Adicione outras mensagens customizadas conforme necessário
    return 'Valor inválido.';
  }
}

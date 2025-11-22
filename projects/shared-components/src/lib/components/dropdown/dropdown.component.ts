import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'lib-dropdown',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input() public label: string = 'Nome do campo';
  @Input() public placeholder: string = 'Selecione uma opção';
  @Input() public options: { value: any, label: any }[] = [];
  @Input() public disabled: boolean = false;
  @Input() public required: boolean = false;
  @Input() public errorMessage: string = 'Campo obrigatório';
  @Input() public selectedOption: any = null;
  @Input() public hideLabel: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  private internalValue: any = null;
  public isOpen: boolean = false;

  // ControlValueAccessor implementation
  private onChange = (value: any) => { };
  private onTouched = () => { };

  constructor() { }

  ngOnInit() {
    // Se selectedOption foi passado como Input, use-o como valor inicial
    if (this.selectedOption !== null && this.selectedOption !== undefined) {
      this.internalValue = this.selectedOption;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Detecta mudanças no selectedOption Input
    if (changes['selectedOption'] && !changes['selectedOption'].firstChange) {
      const newValue = changes['selectedOption'].currentValue;
      if (newValue !== this.internalValue) {
        this.internalValue = newValue;
      }
    }
  }

  public selectOption(option: { value: any, label: any }): void {
    this.internalValue = option.value;
    this.isOpen = false;
    this.onChange(option.value);
    this.onTouched();
    this.valueChange.emit(option.value);
  }

  public toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }

  public getSelectedLabel(): string {
    if (this.internalValue !== null && this.internalValue !== undefined) {
      const option = this.options.find(opt => opt.value === this.internalValue);
      return option ? option.label : '';
    }
    return this.placeholder;
  }

  public hasValue(): boolean {
    return this.internalValue !== null && this.internalValue !== undefined;
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.internalValue = value;
    this.valueChange.emit(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

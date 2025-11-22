import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() public title: string = 'Salvar informação';
  @Input() public backgroundColor: string = '#007bff';
  @Input() public color: string = '#fff';
  @Input() public borderColor: string = '#007bff';
  @Input() public minWidth: string = '8rem';
  @Input() public disabled: boolean = false;

  @Input() public loading: boolean = false;
  @Input() public loadingText: string = 'Carregando...';

  @Output() public onClickEvent: EventEmitter<void> = new EventEmitter<void>();

  public onClick(): void {
    if (!this.loading && !this.disabled) {
      this.onClickEvent.emit();
    }
  }
}

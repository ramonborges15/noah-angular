import { Component } from '@angular/core';
import { DropdownComponent } from '../../../../../shared-components/src/public-api';

@Component({
  selector: 'app-dropdown-docs',
  imports: [DropdownComponent],
  template: `
    <div class="container-fluid">
      <h1>Dropdown Component</h1>
      
      <section class="mb-5">
        <h2>Visão Geral</h2>
        <p>O componente Dropdown é um componente de seleção customizável que implementa Reactive Forms e Bootstrap styling com tipografia Poppins.</p>
      </section>

      <section class="mb-5">
        <h2>Exemplo Básico</h2>
        <div class="row">
          <div class="col-md-6">
            <lib-dropdown 
              [options]="basicOptions"
              label="País"
              placeholder="Selecione um país">
            </lib-dropdown>
          </div>
        </div>
      </section>

      <section class="mb-5">
        <h2>Com Valor Inicial</h2>
        <div class="row">
          <div class="col-md-6">
            <lib-dropdown 
              [options]="basicOptions"
              [selectedOption]="'brasil'"
              label="País (Pré-selecionado)"
              placeholder="Selecione um país">
            </lib-dropdown>
          </div>
        </div>
      </section>

      <section class="mb-5">
        <h2>Propriedades</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Propriedade</th>
              <th>Tipo</th>
              <th>Padrão</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>options</code></td>
              <td><code>{{ '{value: any, label: any}[]' }}</code></td>
              <td><code>[]</code></td>
              <td>Array de opções para o dropdown</td>
            </tr>
            <tr>
              <td><code>label</code></td>
              <td><code>string</code></td>
              <td><code>'Nome do campo'</code></td>
              <td>Label exibido acima do dropdown</td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td><code>string</code></td>
              <td><code>'Selecione uma opção'</code></td>
              <td>Texto exibido quando nenhuma opção está selecionada</td>
            </tr>
            <tr>
              <td><code>selectedOption</code></td>
              <td><code>any</code></td>
              <td><code>null</code></td>
              <td>Valor inicial para o dropdown (útil para edição)</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Se verdadeiro, desabilita o dropdown</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="mb-5">
        <h2>Código de Exemplo</h2>
        <pre class="bg-light p-3 rounded"><code>{{ exampleCode }}</code></pre>
      </section>
    </div>
  `
})
export class DropdownDocsComponent {
  basicOptions = [
    { value: 'brasil', label: 'Brasil' },
    { value: 'eua', label: 'Estados Unidos' },
    { value: 'canada', label: 'Canadá' },
    { value: 'argentina', label: 'Argentina' }
  ];

  exampleCode = `// No TypeScript
public options = [
  { value: 'brasil', label: 'Brasil' },
  { value: 'eua', label: 'Estados Unidos' }
];

// No Template
<lib-dropdown 
  [options]="options"
  label="País"
  placeholder="Selecione um país"
  [selectedOption]="'brasil'">
</lib-dropdown>`;
}

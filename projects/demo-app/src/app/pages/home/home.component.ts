import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [RouterLink],
    template: `
    <div class="container-fluid">
      <div class="jumbotron bg-primary text-white p-5 rounded mb-4">
        <h1 class="display-4">Noah Angular Components</h1>
        <p class="lead">Uma biblioteca de componentes Angular customizados com Bootstrap e tipografia Poppins.</p>
      </div>

      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">
                <i class="material-icons me-2">arrow_drop_down</i>
                Dropdown
              </h5>
              <p class="card-text">Componente de seleção com suporte a Reactive Forms, Material Icons e Bootstrap styling.</p>
              <a routerLink="/dropdown" class="btn btn-primary">Ver Documentação</a>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">
                <i class="material-icons me-2">input</i>
                Input (Em breve)
              </h5>
              <p class="card-text">Componente de input customizado com validações e styling consistente.</p>
              <a href="#" class="btn btn-secondary disabled">Em desenvolvimento</a>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">
                <i class="material-icons me-2">smart_button</i>
                Button (Em breve)
              </h5>
              <p class="card-text">Componente de botão com diferentes variações e estados.</p>
              <a href="#" class="btn btn-secondary disabled">Em desenvolvimento</a>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-5">
        <h2>Características</h2>
        <div class="row">
          <div class="col-md-6">
            <ul class="list-unstyled">
              <li><i class="material-icons text-success me-2">check_circle</i>Reactive Forms Support</li>
              <li><i class="material-icons text-success me-2">check_circle</i>Bootstrap Integration</li>
              <li><i class="material-icons text-success me-2">check_circle</i>Material Icons</li>
            </ul>
          </div>
          <div class="col-md-6">
            <ul class="list-unstyled">
              <li><i class="material-icons text-success me-2">check_circle</i>Tipografia Poppins</li>
              <li><i class="material-icons text-success me-2">check_circle</i>TypeScript Support</li>
              <li><i class="material-icons text-success me-2">check_circle</i>Customizável via SCSS</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent { }

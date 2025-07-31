import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowcaseDropdownComponent } from './showcase-dropdown.component';

describe('ShowcaseDropdownComponent', () => {
  let component: ShowcaseDropdownComponent;
  let fixture: ComponentFixture<ShowcaseDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowcaseDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowcaseDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

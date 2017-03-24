import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTemplateComponent } from './product-template.component';

describe('ProductTemplateComponent', () => {
  let component: ProductTemplateComponent;
  let fixture: ComponentFixture<ProductTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

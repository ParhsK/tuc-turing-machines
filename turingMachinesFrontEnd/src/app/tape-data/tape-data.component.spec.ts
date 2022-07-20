import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TapeDataComponent } from './tape-data.component';

describe('TapeDataComponent', () => {
  let component: TapeDataComponent;
  let fixture: ComponentFixture<TapeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TapeDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TapeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

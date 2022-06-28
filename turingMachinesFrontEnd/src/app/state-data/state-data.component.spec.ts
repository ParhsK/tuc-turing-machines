import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateDataComponent } from './state-data.component';

describe('StateDataComponent', () => {
  let component: StateDataComponent;
  let fixture: ComponentFixture<StateDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StateDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

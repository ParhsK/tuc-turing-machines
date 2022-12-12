import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDeltaDataComponent } from './new-delta-data.component';

describe('NewDeltaDataComponent', () => {
  let component: NewDeltaDataComponent;
  let fixture: ComponentFixture<NewDeltaDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewDeltaDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDeltaDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { TuringMachineService } from './turing-machine.service';

describe('TuringMachineService', () => {
  let service: TuringMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TuringMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

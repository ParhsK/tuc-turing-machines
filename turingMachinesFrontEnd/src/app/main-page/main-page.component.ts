import { Component, OnInit } from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  public ls = localStorage;

  constructor(public turingMachine: TuringMachineService) { }

  ngOnInit(): void {
    this.turingMachine.loadMachineState();
  }
}

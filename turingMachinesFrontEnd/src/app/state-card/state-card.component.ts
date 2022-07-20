import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';
import { State } from '../utils';

@Component({
  selector: 'app-state-card',
  templateUrl: './state-card.component.html',
  styleUrls: ['./state-card.component.css']
})
export class StateCardComponent implements OnInit {

  @Input() state?: State;
  constructor(public turingMachine: TuringMachineService, public element: ElementRef) { }

  ngOnInit(): void {
  }

}

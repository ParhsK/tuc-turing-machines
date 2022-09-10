import { Component, OnInit } from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';
import { EMPTY_INPUT,EMPTY_DISPLAY_CHARACTER } from '../utils';

@Component({
  selector: 'app-tape-data',
  templateUrl: './tape-data.component.html',
  styleUrls: ['./tape-data.component.css']
})
export class TapeDataComponent implements OnInit {

  inputSymbol: string = '';
  tape: Array<string> = [];


  constructor(public turingMachine: TuringMachineService) { }

  ngOnInit(): void {
  }

  replaceEmptyCharacter(character: string): string {
    if (character == EMPTY_INPUT) {
      return EMPTY_DISPLAY_CHARACTER
    }
    return character
  }

  onAddClicked(symbol: string): void {
    if (symbol === undefined){
      throw Error('undefined alphabet');
    }
    this.turingMachine.addToAlphabet(symbol);
  }

  onAddToTapeClicked(symbol: string): void {
    if (this.tape === undefined){
      throw Error('undefined tape');
    }
    this.turingMachine.addToTape(symbol);
  }

  onDeleteClicked(symbol: string): void {
    if (symbol === undefined){
      throw Error('undefined alphabet');
    }
    if (this.turingMachine.isSymbolUsed(symbol) === true) {
      console.log("symbol exists!");
      return;
    }
    this.turingMachine.deleteFromAlphabet(symbol);
  }

  onDeleteFromTapeClicked(): void {
    this.turingMachine.deleteFromTape();
  }

  onEmptyTapeClicked(): void {
    this.turingMachine.emptyTape();
  }
}

import { Component } from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';
import { replaceEmptyCharacter } from '../utils';

@Component({
  selector: 'app-tape-data',
  templateUrl: './tape-data.component.html',
  styleUrls: ['./tape-data.component.css']
})
export class TapeDataComponent {

  inputSymbol: string = '';
  tape: string = '';

  public replaceEmptyCharacter = replaceEmptyCharacter;

  constructor(public turingMachine: TuringMachineService) {
    this.tape = this.turingMachine.tape.join('');
  }

  onAddClicked(symbol: string): void {
    if (symbol === undefined){
      throw Error('undefined alphabet');
    }
    this.turingMachine.addToAlphabet(symbol);
    this.inputSymbol = '';
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

  onSaveTapeClicked(): void {
    const newTape = this.tape.split('');
    this.tape = this.turingMachine.newTape(newTape).join('');
  }

  onDeleteFromTapeClicked(): void {
    this.turingMachine.deleteFromTape();
  }

  onEmptyTapeClicked(): void {
    this.turingMachine.emptyTape();
    this.tape = this.turingMachine.tape.join('')
  }

  onHeadToStartClicked(): void {
    this.turingMachine.moveHeadToStart();
  }

  onHeadToEndClicked(): void {
    this.turingMachine.moveHeadToEnd();
  }

  onHeadRightClicked(): void {
    this.turingMachine.moveHeadRight();
  }

  onHeadLeftClicked(): void {
    this.turingMachine.moveHeadLeft();
  }
}

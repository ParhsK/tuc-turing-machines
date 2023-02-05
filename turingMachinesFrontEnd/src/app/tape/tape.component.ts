import { Component, OnInit } from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';
import { MatDialog } from '@angular/material/dialog';
import { TapeDataComponent } from '../tape-data/tape-data.component';
import { replaceEmptyCharacter } from '../utils';

@Component({
  selector: 'app-tape',
  templateUrl: './tape.component.html',
  styleUrls: ['./tape.component.css']
})
export class TapeComponent implements OnInit {
  public replaceEmptyCharacter = replaceEmptyCharacter

  constructor(public turingMachine: TuringMachineService, public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openDialog(): void {
    this.dialog.open(TapeDataComponent, {});
  }

  scrollToHead() {
    const head = document.getElementsByClassName('head')[0];
    head.scrollIntoView();
  }

}

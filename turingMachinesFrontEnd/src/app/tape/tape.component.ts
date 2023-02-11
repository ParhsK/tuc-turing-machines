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

  head: number = 0;
  public replaceEmptyCharacter = replaceEmptyCharacter;

  constructor(public turingMachine: TuringMachineService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.turingMachine.head$.subscribe((head) => {
      this.head = head;
      this.scrollToHead();
    });
  }

  openDialog(): void {
    this.dialog.open(TapeDataComponent, {});
  }

  scrollToHead() {
    console.log("scrolling to view", this.head);''
    // const head = document.getElementsByClassName('head')[0]
    const head = document.querySelector(`app-tape > div > div:nth-child(${this.head + 2})`);
    console.log("head", head, `app-tape > div > div:nth-child(${this.head + 2})`)
    head?.scrollIntoView();
  }
}

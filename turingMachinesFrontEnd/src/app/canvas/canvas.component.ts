import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { TuringMachineService } from '../turing-machine.service';
import { MatDialog } from '@angular/material/dialog';
import { StateDataComponent } from '../state-data/state-data.component';
import { StateCardComponent } from '../state-card/state-card.component';

declare var LeaderLine: any;

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
})
export class CanvasComponent implements OnInit, AfterViewInit {
  @ViewChildren(StateCardComponent) stateCards?: QueryList<StateCardComponent>;
  deltaLines: Array<typeof LeaderLine> = [];

  constructor(
    public turingMachine: TuringMachineService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.turingMachine.newStateEmitter.subscribe((stateId) => {
      this.openDialog(stateId);
    });
  }

  ngAfterViewInit(): void {
    this.redrawAllLines();
  }

  redrawAllLines(): void {
    this.deltaLines.forEach((line) => {
      line.remove();
    });
    this.deltaLines = [];
    this.turingMachine.deltas.forEach((delta) => {
      console.log(delta)
      const startingElement = this.stateCards?.find((item) => {
        return item.state?.id === delta.prevStateId;
      })?.element.nativeElement;
      const endingElement = this.stateCards?.find((item) => {
        return item.state?.id === delta.newStateId;
      })?.element.nativeElement;
      console.log(startingElement, endingElement)
      const line = new LeaderLine(startingElement, endingElement, {
        color: 'black',
        path: 'grid',
        startSocket: delta.startSocket,
        endSocket: delta.endSocket,
        startLabel: LeaderLine.captionLabel(delta.input.join(', '), {
          color: 'blue',
          // offset: [1000, 1000],
          lineOffset: 50
        }),
      });
      this.deltaLines.push(line);
    });
  }

  onDragMove(): void {
    this.deltaLines.forEach((line) => {
      line.position();
    });
  }

  openDialog(stateId: number): void {
    this.dialog.open(StateDataComponent, {
      data: stateId,
    });
  }
}

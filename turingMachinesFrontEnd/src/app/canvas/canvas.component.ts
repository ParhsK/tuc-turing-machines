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
import { Delta, replaceEmptyCharacter } from '../utils';

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
    this.turingMachine.stateDialogOpen.subscribe((stateId) => {
      this.openDialog(stateId);
    });
    this.turingMachine.redrawEmitter.subscribe(() => {
      this.redrawAllLines();
    });
  }

  ngAfterViewInit(): void {
    this.redrawAllLines();
    this.stateCards?.changes.subscribe(() => {
      this.removeAllLines();
      setTimeout(() => {
        this.redrawAllLines();
      }, 10);
    })
  }

  removeAllLines(): void {
    this.deltaLines.forEach((line) => {
      line.remove();
    });
    this.deltaLines = [];
  }

  redrawAllLines(): void {
    this.removeAllLines();
    this.turingMachine.deltas.forEach((delta) => {
      const startingElement = this.stateCards?.find((item) => {
        return item.state?.id === delta.prevStateId;
      })?.element.nativeElement;
      let endingElement = this.stateCards?.find((item) => {
        return item.state?.id === delta.newStateId;
      })?.element.nativeElement;

      if (delta.prevStateId === delta.newStateId) {
        // Hack for same element
        // https://github.com/anseki/leader-line/issues/181
        endingElement = endingElement.children[0];

        const selfLine = new LeaderLine(startingElement, endingElement, {
          color: 'black',
          path: 'fluid',
          startSocket: 'top',
          endSocket: 'right',
          middleLabel: this.generateCaptionLabel(delta),
        });
        this.deltaLines.push(selfLine);
        return;
      }

      const line = new LeaderLine(startingElement, endingElement, {
        color: 'black',
        path: 'grid',
        startSocket: delta.startSocket,
        endSocket: delta.endSocket,
        startLabel: this.generateCaptionLabel(delta),
      });
      this.deltaLines.push(line);
    });
  }

  generateCaptionLabel(delta: Delta): string {
    let missingCharacters = 0;
    let lastMissingCharacter = undefined;
    this.turingMachine.alphabet.forEach((character) => {
      if (!delta.input.includes(character)) {
        missingCharacters++;
        lastMissingCharacter = character;
      }
    });

    // Regular caption
    let text = delta.input.map((c) => replaceEmptyCharacter(c)).join(', ');
    // Empty caption if all characters are included
    if (missingCharacters === 0) {
      text = '';
    }
    // Different from caption if only one character is not included
    else if (missingCharacters === 1 && lastMissingCharacter) {
      text = 'NOT' + replaceEmptyCharacter(lastMissingCharacter);
    }

    const options = {
      color: 'black',
      // offset: [1000, 1000],
      lineOffset: 50
    };
    return LeaderLine.captionLabel(text, options);
  }

  onDragMove(): void {
    this.deltaLines.forEach((line) => {
      line.position();
    });
  }

  onDragRelease(stateId: number): void {
    // Save new location
    const stateElement = this.stateCards?.find((item) => {
      return item.state?.id === stateId;
    })?.element.nativeElement;
    console.log(`Moved state ${stateId}`);
    const matrixRegex = /matrix\(([0-9]*), ([0-9]*), ([0-9]*), ([0-9]*), ([0-9]*), ([0-9]*)\)/;
    const matrixString = window.getComputedStyle(stateElement, null).getPropertyValue('transform');
    const translateX = matrixString.match(matrixRegex)?.[5];
    const translateY = matrixString.match(matrixRegex)?.[6];
    console.log(translateX, translateY);
    if (!translateX || !translateY) {
      return;
    }
    this.turingMachine.changeStatePosition(stateId, translateX, translateY);
  }

  openDialog(stateId: number): void {
    this.dialog.open(StateDataComponent, {
      data: stateId,
    });
  }
}

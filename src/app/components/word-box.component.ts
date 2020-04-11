import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Word} from '../models/word.model';

@Component({
  selector: 'app-word-box',
  templateUrl: 'word-box.component.html',
  styleUrls: ['word-box.component.scss']
})
export class WordBoxComponent implements OnInit, OnChanges {
  @Input() word: Word;
  @Input() size: number;
  @Input() column: number;
  @Input() printMod = false;
  @Output() removeWord = new EventEmitter<string>();
  letters: string[];

  ngOnInit(): void {
    this.refreshLetters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!this.letters && this.letters.length !== this.size) {
      this.refreshLetters();
    }
    if (this.word.shift + this.word.word.length > this.size) {
      this.word.shift -= this.word.shift + this.word.word.length - this.size;
      this.refreshLetters();
    }
  }

  shiftLeft() {
    if (this.word.shift !== 0) {
      this.word.shift--;
      this.refreshLetters();
    }
  }

  shiftRight() {
    if (this.word.shift + this.word.word.length < this.size) {
      this.word.shift++;
      this.refreshLetters();
    }
  }

  private refreshLetters() {
    const letters = [];
    for (let i = 0; i < this.word.shift; i++) {
      letters.push('');
    }
    letters.push(...this.word.word.split(''));
    for (let i = 0; i < (this.size - this.word.word.length) - this.word.shift; i++) {
      letters.push('');
    }
    this.letters = letters;
  }
}

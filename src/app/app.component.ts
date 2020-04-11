import {Component} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Word} from './models/word.model';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  words: Word[] = [];
  size = 0;
  column = 0;
  columns = [];
  rows = [];
  printMod = false;

  formTitle = new FormControl('Rejtvény');
  formNotes = new FormControl('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' +
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in' +
    'reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.');

  formWord = new FormControl();
  formDescription = new FormControl();
  formBatch = new FormControl();

  constructor(private snackBar: MatSnackBar, private clipboard: Clipboard) {
    // this.refresh();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.words, event.previousIndex, event.currentIndex);
    console.log(this.words);
  }

  remove(word: string) {
    this.words = this.words.filter(w => w.word !== word);
    this.refresh();
  }

  addWord() {
    const word = !!this.formWord.value ? this.formWord.value.trim().toUpperCase() : '';
    const description = !!this.formDescription.value ? this.formDescription.value.trim() : '';
    if (!!word && !!description) {
      if (!this.words.some(w => w.word === word)) {
        const shift = this.column > word.length ? this.column - word.length + 1 : 0;
        this.words.push({word, description, shift});
        this.alert('Word has been added', 'Success');
        this.formWord.setValue('');
        this.formDescription.setValue('');
        this.refresh();
      } else {
        this.alert('Duplicated word!');
      }
    } else {
      this.alert('All of the fields are required!');
    }
  }

  addBatch() {
    const field = !!this.formBatch.value ? this.formBatch.value.trim() : '';
    if (!!field) {
      let wrong = '';
      const lines = field.split('\n');
      const words: Word[] = lines.map(line => {
        const params = line.split('|');
        if (params.length !== 3) {
          wrong = 'Missing or too many \'|\' character. It should be exactly 3 per line.';
          return;
        } else if (params.some(p => !p.trim().length)) {
          wrong = 'One of the parts (word, shift, description) is missing.';
          return;
        } else if (isNaN(params[1])) {
          wrong = 'Shift value should be number, e.g. 1 or 0.';
          return;
        }
        const word = params[0].trim().toUpperCase();
        if (this.words.some(w => w.word === word)) {
          wrong = 'The word should be unique!';
          return;
        }
        return {word, shift: parseInt(params[1], 10), description: params[2].trim()}
      });
      if (wrong) {
        this.alert(wrong);
        return;
      }
      let wordKeys = words.map(w => w.word);
      let unique = words.filter((w, i) => wordKeys.indexOf(w.word) === i);
      this.words.push(...unique);
      this.formBatch.setValue('');
      this.refresh();
    } else {
      this.alert('Field is required!');
    }
  }

  getBatch() {
    let out = '';
    this.words.forEach(w => out += w.word + '|' + w.shift + '|' + w.description + '\n');
    this.clipboard.copy(out);
    this.alert('Content has been copied to the clipboard.', 'Information');
  }

  private alert(message: string, label = 'Error!') {
    this.snackBar.open(message, label, {duration: 3000});
  }

  private refresh() {
    this.size = 0;
    this.words.forEach(w => w.word.length > this.size ? this.size = w.word.length : {});
    this.columns = [...Array(this.size).keys()];
    if (this.column > this.size - 1) {
      this.column = this.size - 1;
    }
    if (this.column === 0) {
      this.column = Math.floor(this.size / 2);
    }
    this.rows = [...Array(this.words.length).keys()];
  }
}

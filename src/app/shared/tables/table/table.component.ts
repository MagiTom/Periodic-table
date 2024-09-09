import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { TableEdit, TableElement } from '../../../models/TableElement.model';
import { EditDialogComponent } from '../../dialogs/edit-dialog/edit-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatTableModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements AfterViewInit, OnDestroy {
  input = viewChild<ElementRef>('input');
  columns = input<string[]>([]);
  data = input<any[]>([]);
  onEdit = output<TableEdit<any>>();
  dataSource!: MatTableDataSource<any>;

  displayedColumns: string[] = [];
  private unsub = new Subject<void>();
  tableEffect = effect(() => {
    const data = this.data();

    untracked(() => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource._updateChangeSubscription();
      this.setFilter();
    });
  });

  constructor(public dialog: MatDialog) {}

  ngAfterViewInit(): void {
    fromEvent(this.input()?.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.unsub),
        filter(Boolean),
        debounceTime(2000),
        distinctUntilChanged(),
        tap(() => this.setFilter())
      )
      .subscribe();
  }

  setFilter() {
    this.dataSource.filter = this.input()
      ?.nativeElement.value.trim()
      .toLowerCase();
  }

  openEditDialog(element: TableElement, column: string) {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      width: 'auto',
      data: { element, column },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const newElement: TableElement = {
          ...element,
          [column]: result,
        };

        this.onEdit.emit({ newElement, oldElement: element });
      }
    });
  }

  ngOnDestroy() {
    this.unsub.next();
    this.unsub.complete();
  }
}

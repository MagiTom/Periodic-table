import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { PeriodicElement } from './models/PeriodicElement.model';
import { TableEdit } from './models/TableElement.model';
import { TableDataService } from './services/table-data.service';
import { TableComponent } from './shared/tables/table/table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TableComponent, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);
  private tableDataService = inject(TableDataService);
  columns = ['position', 'name', 'weight', 'symbol'];
  dataSource = signal<PeriodicElement[]>([]);
  isLoading = this.tableDataService.isLoading;

  ngOnInit(): void {
    this.tableDataService.getTableData().subscribe({
      next: (data) => this.dataSource.set(data),
      error: () => alert('Data cannot be downloaded!'),
    });
  }

  editElement(editData: TableEdit<PeriodicElement>) {
    const { newElement, oldElement } = editData;
    if (newElement.position != oldElement.position) {
      if (this.checkIfPositionExist(newElement)) {
        this._snackBar.open('This position number already exist!', 'ok', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        return;
      }
    }
    this.dataSource.update((items) =>
      items.map((item) =>
        item.position == oldElement.position ? newElement : item
      )
    );
  }

  checkIfPositionExist(element: PeriodicElement): boolean {
    return !!this.dataSource().find((el) => el.position == element.position);
  }
}

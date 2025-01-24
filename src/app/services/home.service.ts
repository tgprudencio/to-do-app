import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private baseUrl = environment.apiURL;

  constructor(
    private http: HttpClient
  ) { }

  getUsers(): Observable<any> {
    return this.http.get<Object>(this.baseUrl+'/users').pipe(
      catchError((error) => {
        return of([]);
      })
    );
  }

  getTasks(userId: number): Observable<any> {
    return this.http.get<Object>(this.baseUrl+'/user/'+userId).pipe(
      catchError((error) => {
        return of([]);
      })
    );
  }

  insertTask(data: any): Observable<any> {
    return this.http.post<Object>(this.baseUrl+'/add', data).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  editTask(taskId: string, updatedData: any): Observable<any> {
    return this.http.put<Object>(this.baseUrl+'/'+taskId, updatedData).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete<Object>(this.baseUrl+'/'+taskId).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}

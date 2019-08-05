import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {IDeactivateComponent} from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class ExamGuard implements CanDeactivate<IDeactivateComponent> {
  component: {};
  route: ActivatedRouteSnapshot;

  constructor() {
  }

  public canDeactivate(
    component: IDeactivateComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return component.canExit ? component.canExit() : true;
  }

}
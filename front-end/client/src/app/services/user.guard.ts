import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {UserService} from './user.service';

@Injectable()
export class UseGuard implements CanActivate{
    
    constructor(
        private _router: Router,
        private _userSerivece: UserService
    ){

    }

    canActivate(){
        let identity = this._userSerivece.getIdentity();

        if(identity && (identity.role =='ROLE_USER' || identity.role =='ROLE_ADMIN')){
            return true;
        }else{
            this._router.navigate(['/login']);
            return false;
        }
    }
}
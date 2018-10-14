import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../../models/message';
import { MessageService } from '../../../services/messages.service';
import { GLOBAL } from '../../../services/global';
import { FollowService } from '../../../services/follow.service';
import { Follow } from '../../../models/follow';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user';

@Component({
    selector: 'add',
    templateUrl: './add.component.html',
    providers: [FollowService, MessageService, UserService]
})
export class AddComponent implements OnInit {
    public title: string;
    public message: Message;
    public identity;
    public token;
    public url: string;
    public status;
    public follows;


    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _followService: FollowService,
        private _messageService: MessageService,
        private _userService: UserService
    ) {
        this.title = 'Mensajes privados';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.message = new Message('', '', '', '', this.identity._id, '');
    }

    ngOnInit() {
        console.log('add cargado');
        this.getMyFollows();
    }

    onSubmit(form){
        console.log(this.message);
        this._messageService.addMessage(this.token, this.message).subscribe(
            response=>{
                if(response.message){
                    this.status ='success';
                    form.reset();
                }
            },
            error=>{
                this.status = 'error';
                console.log(<any>error);
            }
        )
    }

    getMyFollows() {
        this._followService.getMyFollows(this.token).subscribe(
            response => {
                this.follows = response.follows;
            },
            error => {
                console.log(<any>error);
            }
        );
    }
}
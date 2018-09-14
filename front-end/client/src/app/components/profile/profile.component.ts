import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Follow } from '../../models/follow';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { GLOBAL } from '../../services/global';


@Component({
    selector: 'profile',
    templateUrl: 'profile.component.html',
    providers: [UserService, FollowService]
})
export class ProfileComponent implements OnInit {
    public title: string;
    public user: User;
    public status: string;
    public identity;
    public token;
    public url;
    public stats;
    public followed;
    public following;

    constructor(
        private _userService: UserService,
        private _followService: FollowService,
        private _route: ActivatedRoute,
        private _router: Router,
    ) {
        this.title = "Perfil";
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.following = false;
        this.followed = false;
    }

    ngOnInit() {
        console.log("profile ha sido cargado");
        this.loadPage();
    }

    loadPage() {
        this._route.params.subscribe(params => {
            let id = params['id'];
            this.getUser(id);
            this.getCounters(id);
        })
    }

    getUser(id) {
        this._userService.getUser(id).subscribe(
            response => {
                if (response.user) {
                    this.user = response.user;
                    // console.log(response);

                    if (response.following && response.following._id) {
                        this.following = true;
                    } else {
                        this.following = false;
                    }

                    if (response.followed && response.followed._id) {
                        this.followed = true;
                    } else {
                        this.followed = false;
                    }

                } else {
                    this.status = 'error';
                }
            },
            error => {
                console.log(<any>error);
                this._router.navigate(['/perfil', this.identity._id]);
            }
        )
    }

    getCounters(id) {
        this._userService.getCounters(id).subscribe(
            response => {
                this.stats = response;
            },
            error => { console.log(<any>error); }
        )
    }

    followUser(followed) {
        var follow = new Follow('', this.identity._id, followed);
        this._followService.addFollow(this.token, follow).subscribe(
            response => {
                this.following = true;
            },
            error => {
                console.log(<any>error);
            }
        );
    }

    unfollowUser(followed) {
        this._followService.deleteFollow(this.token, followed).subscribe(
            response => {
                this.following = false;
            },
            error => {
                console.log(<any>error);
            }
        );
    }

    public followUserOver;
    mouseEnter(userId){
        this.followUserOver = userId;
    }

    mouseLeave(){
        this.followUserOver = 0;
    }
}
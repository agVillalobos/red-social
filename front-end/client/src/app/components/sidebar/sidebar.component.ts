import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { UserService } from '../../services/user.service';
import { GLOBAL } from '../../services/global';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'sidebar',
    templateUrl: 'sidebar.component.html',
    providers: [UserService, PublicationService]
})
export class SidebarComponent implements OnInit {
    public identity;
    public token;
    public stats;
    public url;
    public status;
    public publication: Publication;
    

    constructor(
        private _userService: UserService,
        private _publicationService: PublicationService,
        private _route: ActivatedRoute,
        private _router: Router,
    ) {
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.stats = this._userService.getStats();
        console.log(this.stats);
        this.url = GLOBAL.url;
        this.publication = new Publication("", "", "", "", this.identity._id);
    }

    ngOnInit() {
        // console.log("se ha cargado sidebar");
    }

    onSubmit(form) {
        this._publicationService.addPublication(this.token, this.publication).subscribe(
            response => {
                if (response.publication) {
                    this.status = 'success';
                    form.reset();
                    this._router.navigate(['/timeline']);
                } else {
                    this.status = 'error';
                }
            },
            error => {
                var erroreMessage = <any>error;
                console.log(erroreMessage);
                if (erroreMessage != null) {
                    this.status = 'error';
                }
            }
        );
    }

    //Output
    @Output() sended = new EventEmitter();
    sendPublication(event){
        // console.log(event);
        this.sended.emit({send :'true'});
    }
}
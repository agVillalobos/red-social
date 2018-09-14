import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';
import { GLOBAL } from '../../services/global';
import { PublicationService } from '../../services/publication.service';
import { Publication } from '../../models/publication';

@Component({
    selector: 'publications',
    templateUrl: './publications.component.html',
    providers: [UserService, UploadService, PublicationService]
})
export class PublicationsComponent implements OnInit {
    public identity;
    public token;
    public title: string;
    public url: string;
    public status: string;
    public page;
    public total;
    public pages;
    public itemsPerPages;
    public publications: Publication[];
    @Input() user: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _publicationService: PublicationService
    ) {
        this.title = 'Publications';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;
        this.page = 1;
    }

    ngOnInit() {
        console.log(' publicaitons se ha cargado');
        this.getPublications(this.user, this.page);
    }

    getPublications(user, page, adding = false) {
        this._publicationService.getPublicationsUser(this.token, user, page).subscribe(
            response => {
                if (response.publications) {
                    this.total = response.total_items;
                    this.pages = response.pages;
                    this.itemsPerPages = response.items_per_pages;
                    if (!adding) {
                        this.publications = response.publications;
                    } else {
                        var arrayA = this.publications;
                        var arrayB = response.publications;
                        this.publications = arrayA.concat(arrayB);

                        //scroll
                        //$("html, body").animate({ scrollTop: $('html').prop("scrollHeight") }, 500);
                    }

                    if (page > this.pages) {
                        // this._router.navigate(['/home']);
                    }

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
        )
    }

    public noMore = false;
    viewMore() {
        this.page += 1;

        if (this.page == (this.pages)) {
            this.noMore = true;
        } else {
            this.page += 1;
        }
        this.getPublications(this.user, this.page, true);
    }
}
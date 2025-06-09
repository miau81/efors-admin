import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { ApiService } from '../../services/api.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterLink } from '@angular/router';
import { MyErpWorkspace } from '@myerp/interfaces/interface';



@Component({
  selector: 'app-side-menu',
  imports: [ShareModule, NgbModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  // public companyConfig: any = { companyLogo: '/' };
  public moduleGroups: MyErpWorkspace[] = [];

  constructor(private api: ApiService, private router: Router) { }

  async ngOnInit() {
    await this.loadModuleGroups();
  }

  async loadModuleGroups() {
    this.moduleGroups = await this.api.getConfig('workspace', 'workspace')
  }


}

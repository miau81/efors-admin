import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MyErpWorkSpaceNav } from '@myerp/interfaces/interface';



@Component({
  selector: 'app-workspace',
  imports: [ShareModule,],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  public title?: string;
  public workspaceNav: MyErpWorkSpaceNav[] = [];
  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {
  }
  ngOnInit() {


    this.route.params.subscribe(p => {
      this.loadWorkSpaceNav(p['id']);
    });
  }



  async loadWorkSpaceNav(id: string) {
    const res: any = await this.api.getConfig('workspace-nav', id);
    this.workspaceNav = res.config;
    this.title = res.title;
  }


}

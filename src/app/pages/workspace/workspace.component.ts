import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ShareModule } from '../../@modules/share/share.module';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MyErpWorkSpaceNav } from '../../@interfaces/interface';




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
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }
  ngOnInit() {
    // Only subscribe to params in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.route.params.subscribe(p => {
        this.loadWorkSpaceNav(p['id']);
      });
    }
  }



  async loadWorkSpaceNav(id: string) {
    const res: any = await this.api.getConfig('workspace-nav', id);
    this.workspaceNav = res.config;
    this.title = res.title;
  }


}

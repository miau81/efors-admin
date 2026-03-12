import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ShareModule } from '../../@modules/share/share.module';
import { ApiService } from '../../services/api.service';
import { NgbModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterLink } from '@angular/router';
import { MyErpWorkspace } from '../../@interfaces/interface';



@Component({
  selector: 'app-side-menu',
  imports: [ShareModule, NgbModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  // public companyConfig: any = { companyLogo: '/' };
  public moduleGroups: MyErpWorkspace[] = [];

  constructor(
    private api: ApiService, 
    private router: Router, 
    private offcanvasService: NgbOffcanvas,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  async ngOnInit() {
    // Only load module groups in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      await this.loadModuleGroups();
    } else {
      // For SSR, set empty array to prevent errors
      this.moduleGroups = [];
    }
  }

  async loadModuleGroups() {
    const res: any = await this.api.getConfig('workspace', 'workspace');
    this.moduleGroups = res.config;
  }


  dismissOffCanvas() {
    this.offcanvasService.dismiss()
  }


}

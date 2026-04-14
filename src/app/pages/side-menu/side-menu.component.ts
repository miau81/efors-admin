import { Component, Inject, PLATFORM_ID, inject, signal } from '@angular/core';
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
  // Using signals for reactive state
  readonly moduleGroups = signal<MyErpWorkspace[]>([]);

  // Using inject()
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly offcanvasService = inject(NgbOffcanvas);
  private readonly platformId = inject(PLATFORM_ID);

  async ngOnInit() {
    // Only load module groups in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      await this.loadModuleGroups();
    } else {
      // For SSR, set empty array to prevent errors
      this.moduleGroups.set([]);
    }
  }

  async loadModuleGroups() {
    const res: any = await this.api.getConfig('workspace', 'workspace');
    this.moduleGroups.set(res.config);
  }

  dismissOffCanvas() {
    this.offcanvasService.dismiss()
  }
}

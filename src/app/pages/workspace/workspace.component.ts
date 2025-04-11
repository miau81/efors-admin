import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MyErpWorkspace, MyErpWorkSpaceNav } from '../../@interfaces/interface';
import { MyCoreService } from 'myerp-core'

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
    private coreService: MyCoreService,
  ) {
  }
  ngOnInit() {


    this.route.params.subscribe(p => {
      this.loadWorkSpaceNav(p['id']);
    });
  }



  async loadWorkSpaceNav(id: string) {
    this.workspaceNav = await this.api.getConfig('workspace-nav', id);
  }

  async showAlert() {
    console.log(await this.coreService.showAlertMessage({ message: '123', type: "success" }))
  }
  async showConfirm() {
    console.log(await this.coreService.showConfirmMessage({ message: '123', title: '456', cancelButton: true }))
  }

  async showLoading() {
    this.coreService.showLoading();
    setTimeout(() => this.coreService.dismissLoading(), 3000);
  }

  async showToast() {

    this.coreService.showToast({
      message: "Success Test",
      color: "success",
      horizontalPosition: "end",
      verticalPosition: "bottom",
      duration: 2000
    })
  }
}

import { Routes } from '@angular/router';
import { MainLayoutComponent } from './pages/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SyetemSettingsComponent } from './pages/syetem-settings/syetem-settings.component';
import { authGuard } from './@guards/auth.guard';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { DocumentListComponent } from './pages/document-list/document-list.component';
import { DocumentComponent } from './pages/document/document.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {

        path: '',
        canActivate: [authGuard],
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard'
            },
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'system-settings',
                component: SyetemSettingsComponent
            },
            {
                path: 'doc/:documentType',
                component: DocumentListComponent
            },
            {
                path: 'doc/new/:documentType',
                component: DocumentComponent
            },
            {
                path: 'doc/:documentType/:id',
                component: DocumentComponent
            },
            {
                path: ':id',
                component: WorkspaceComponent
            }
        ]
    },
];

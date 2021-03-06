// Copyright Project Harbor Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Project } from '../project';

import { SessionService } from '../../shared/session.service';
import { ProjectService } from '../../project/project.service';

import { AppConfigService } from "../../app-config.service";
import { UserPermissionService, USERSTATICPERMISSION, ErrorHandler } from "@harbor/ui";
import { forkJoin } from "rxjs";
@Component({
  selector: 'project-detail',
  templateUrl: 'project-detail.component.html',
  styleUrls: ['project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {

  hasSignedIn: boolean;
  currentProject: Project;

  isMember: boolean;
  roleName: string;
  projectId: number;
  hasHelmChartsListPermission: boolean;
  hasRepositoryListPermission: boolean;
  hasMemberListPermission: boolean;
  hasReplicationListPermission: boolean;
  hasLabelListPermission: boolean;
  hasLabelCreatePermission: boolean;
  hasLogListPermission: boolean;
  hasConfigurationListPermission: boolean;
  hasRobotListPermission: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private appConfigService: AppConfigService,
    private userPermissionService: UserPermissionService,
    private errorHandler: ErrorHandler,
    private projectService: ProjectService) {

    this.hasSignedIn = this.sessionService.getCurrentUser() !== null;
    this.route.data.subscribe(data => {
      this.currentProject = <Project>data['projectResolver'];
      this.isMember = this.currentProject.is_member;
      this.roleName = this.currentProject.role_name;
    });
  }
  ngOnInit() {
    this.projectId = this.route.snapshot.params['id'];
    this.getPermissionsList(this.projectId);
  }
  getPermissionsList(projectId: number): void {
    let permissionsList = [];
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.LOG.KEY, USERSTATICPERMISSION.LOG.VALUE.LIST));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.CONFIGURATION.KEY, USERSTATICPERMISSION.CONFIGURATION.VALUE.READ));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.MEMBER.KEY, USERSTATICPERMISSION.MEMBER.VALUE.LIST));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.REPLICATION.KEY, USERSTATICPERMISSION.REPLICATION.VALUE.LIST));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.LABEL.KEY, USERSTATICPERMISSION.LABEL.VALUE.LIST));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.REPOSITORY.KEY, USERSTATICPERMISSION.REPOSITORY.VALUE.LIST));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.HELM_CHART.KEY, USERSTATICPERMISSION.HELM_CHART.VALUE.LIST));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.ROBOT.KEY, USERSTATICPERMISSION.ROBOT.VALUE.LIST));
    permissionsList.push(this.userPermissionService.getPermission(projectId,
      USERSTATICPERMISSION.LABEL.KEY, USERSTATICPERMISSION.LABEL.VALUE.CREATE));
    forkJoin(...permissionsList).subscribe(Rules => {
      this.hasLogListPermission = Rules[0] as boolean;
      this.hasConfigurationListPermission = Rules[1] as boolean;
      this.hasMemberListPermission = Rules[2] as boolean;
      this.hasReplicationListPermission = Rules[3] as boolean;
      this.hasLabelListPermission = Rules[4] as boolean;
      this.hasRepositoryListPermission = Rules[5] as boolean;
      this.hasHelmChartsListPermission = Rules[6] as boolean;
      this.hasRobotListPermission = Rules[7] as boolean;
      this.hasLabelCreatePermission = Rules[8] as boolean;

    }, error => this.errorHandler.error(error));
  }

  public get isSessionValid(): boolean {
    return this.sessionService.getCurrentUser() != null;
  }

  public get withAdmiral(): boolean {
    return this.appConfigService.getConfig().with_admiral;
  }

  public get withHelmChart(): boolean {
    return this.appConfigService.getConfig().with_chartmuseum;
  }

  backToProject(): void {
    if (window.sessionStorage) {
      window.sessionStorage.setItem('fromDetails', 'true');
    }
    this.router.navigate(['/harbor', 'projects']);
  }

}

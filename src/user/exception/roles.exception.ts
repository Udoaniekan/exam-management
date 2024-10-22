import { ForbiddenException } from "@nestjs/common";

export class forBiddenRoleException extends ForbiddenException {
    constructor(role:string){
      super(`sorry you are not allowed access to this endpoint: ${role}`)
    }
  }
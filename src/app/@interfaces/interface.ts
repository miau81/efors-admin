
//////////// COMMON ////////////////////////////////

import { StringLike } from "bun";

export interface LiteralObject {
  [key: string]: any;
}


//////////////// WORKSPACE //////////////////////////

export interface MyErpWorkspace {
  id: string;
  label: string;
  isSingle?: boolean;
  isHidden?: boolean;
  children?: MyErpWorkspace[];
  sorting: number;
  icon?: string;
  link?: string;
  isCollapse?: boolean;
}

export interface MyErpWorkSpaceNav {
  id: string;
  label: string;
  children?: MyErpWorkSpaceNav[];
  link?: string;
  isSingle?: boolean;
  linkType?: MyErpWorkSpaceLinkType;
  sorting: number;
  refId?: string;
}

export type MyErpWorkSpaceLinkType = "list" | "document" | "report";

//////////// DOCUMENT ///////////////////////
export interface MyERPDocument {
  id: string;
  cretedDate: Date;
  createdBy: string;
  modifiedDate: Date;
  lastModifiedBy: string;
  docStatus: string;
  isActive: boolean;
  isDeleted: boolean;
  sysAcct: string;
}

export interface MyERPDocType {
  id: string;
  label: string;
  isVirtual?: boolean;
  fields: MyERPField[];
  canSubmit?: boolean;
  canDelete?: boolean;
  isSingle?: boolean;
  isChildTable?: boolean;
  parentDocType?: string;
  defaultSorting?: string;
  defaultSortBy?: "ASC" | "DESC"
  submitTable?: boolean;
  namingType: MyERPDocNamingType
  namingFormat?: string;
  searchFields?: string[];
  printScript?: "SERVER" | "CLIENT";
  printFormats?: MyERPPrintFormat[];
  actionButtons?: { code: string, label: string, script?: "SERVER" | "CLIENT" }[];
  tabs?: MyERPFieldGroup[];
  sections?:MyERPFieldGroup[];
}

export interface MyERPFieldGroup {
  id: string;
  parent?: string;
  isHidden?: boolean;
  label: string;
  sorting?: number;
  sectionExpanded?:boolean;

}

export interface MyERPField {
  id: string;
  isPrimaryKey?: boolean
  type: MyErpFieldType;
  formComponentType?: FormComponentType;
  isVirtual?: boolean;
  sectionId?: string;
  sectionExpanded?: boolean;
  tabId?: string;
  label?: string;
  defaultValue?: any;
  options?: any;
  callServerScript?: boolean;
  callClientScript?: boolean;
  linkOptions?: { isDoc?: boolean, valueField: string, labelField: string, format?: string, customSql?: string, filters?: string[] }

  mandatory?: boolean;
  isUnique?: boolean;
  uniqueBy?: string[];
  sorting?: number;
  canAddNew?: boolean;
  canView?: boolean;
  canEdit?: boolean;

  isTranslatable?: boolean;
  isNotEditable?: boolean;
  isReadOnly?: boolean;
  isHidden?: boolean;
  isPassword?: boolean;
  parentField?: any;

  tableColumnWidth?: number;
  formColumnSize?: string;
  showInTable?: boolean;
  showInForm?: boolean;
  showInFilter?: boolean;
  filterSorting?: number;
  fieldsDocType?: MyERPDocType;

}

export interface ChangeScriptResponse {
  formValue?: any;
  componentOptions?: any;
  parentFormValue?: any;
  formConfig?: any
}

export interface MyERPPrintFormat {
  fileName: string;
  label: string;
  code: string;
  isDefault?: boolean;
}

export interface MyErpSortAndPagination {
  page: number;
  limit: number;
  sortField?: string;
  sortBy?: "ASC" | "DESC";
}

export type MyERPDocNamingType = "random" | "sequence" | "date-sequence" | "byField"

export type MyErpFieldType =
  "text" | "currency" | "number" | "date" | "time" | "datetime" | "textarea"
  | "boolean" | "link" | "table" | "section" | "tab" | "dropdown" | "breakline"

export type FormComponentType = "text" | "password" | "email" | "number" | "tel" | "select" | "date" | "time"
  | "datetime-local" | "hidden" | "checkbox" | 'readOnly' | 'textarea'
  | "checkboxGroup" | "datePicker" | "image" | "table" | "link" | "dropdown" | "breakline"

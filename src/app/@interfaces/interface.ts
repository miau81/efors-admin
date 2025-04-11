
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
  isSingle?: boolean;
  isChildTable?: boolean;
  parentDocType?: string;
  defaultSorting?: string;
  defaultSortBy?: "asc" | "desc"
  submitTable?: boolean;
  namingType: MyERPDocNamingType
  namingFormat?: string;
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
  isTranslatable?: boolean;
  notEditable?: boolean;
  label?: string;
  defaultValue?: any;
  options?: any;
  linkOptions?: { valueField: any, labelField: string | string[], labelSplit?: string }
  isReadOnly?: boolean;

  mandatory?: boolean;
  isUnique?: boolean;
  uniqueBy?: string[];
  sorting?: number;

  isHidden?: boolean;
  isPassword?: boolean;
  tableColumnWidth?: number;
  formColumnSize?: string;
  hideInTable?: boolean;
  hideInForm?: boolean;
  showInFilter?: boolean;
  filterSorting?: number;

}

export type MyERPDocNamingType = "random" | "sequence" | "date-sequence" | "byField"

export type MyErpFieldType =
  "text" | "currency" | "number" | "date" | "time" | "datetime"
  | "boolean" | "link" | "table" | "section" | "tab" | "dropdown" | "breakline"

export type FormComponentType = "text" | "password" | "email" | "number" | "tel" | "select" | "date" | "time"
  | "datetime-local" | "hidden" | "checkbox" | 'readOnly' | 'textarea'
  | "checkboxGroup" | "datePicker" | "image" | "table" | "link" | "dropdown" | "breakline"
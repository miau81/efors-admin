import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "user",
        label: '{"en":"User"}',
        namingType: "byField",
        namingFormat: "email",
        sections: [
            { id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 },
            { id: 'sectionBranchAccess', label: '{"en":"Branch Access"}', sorting: 1 }
        ],
        fields: [
            { id: 'firstName', type: 'text', label: '{"en":"First Name"}', showInTable: true, showInForm: true, sectionId: "sectionDetails", },
            { id: 'lastName', type: 'text', label: '{"en":"Last Name"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
            { id: 'fullName', type: 'text', label: '{"en":"Full Name"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
            { id: 'email', mandatory: true, type: 'text', formComponentType: "email", label: '{"en":"Email"}', showInTable: true, showInForm: true, sectionId: "sectionDetails", },
            { id: 'language', type: 'text', isHidden: true, defaultValue: 'en', label: '{"en":"Language"}', sectionId: "sectionDetails" },
         
            { id: 'lastLoginOn', type: 'datetime', isReadOnly: true, label: '{"en":"Last Logged-in On"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
           
            { id: 'sectionChangePassword', type: 'section', label: '{"en":"Change Password"}', sorting: 2, sectionExpanded: false },
            { id: 'password', type: 'text', formComponentType: "password", label: '{"en":"New Password"}', isPassword: true, showInForm: true, sectionId: "sectionChangePassword" },
            
            { id: 'accessAllBranch', type: 'boolean',  label: '{"en":"Access All Branch"}',  showInForm: true,sectionId: "sectionBranchAccess"},
            {
                id: 'accessBranches', type: "table", formColumnSize: "col-12", showInForm: true, 
                formComponentType: "table", label: '{"en":"Access Branches"}',
                sectionId: 'sectionBranchAccess', options: "user_access_branch"
            },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})




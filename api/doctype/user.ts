import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "user",
        label: '{"en":"User"}',
        namingType: "field",
        namingFormat: "email",
        sections: [
            { id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 },
            { id: 'sectionBranchAccess', label: '{"en":"Branch Access"}', sorting: 1 }
        ],
        fields: [
            { id: 'fullName', mandatory: true, type: 'text', label: '{"en":"Full Name"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
            { id: 'email', mandatory: true, type: 'text', formComponentType: "email", label: '{"en":"Email"}', showInTable: true, showInForm: true, sectionId: "sectionDetails", },
            {
                id: 'userType', mandatory: true, type: "text", formComponentType: "select", label: '{"en":"User Type"}', isReadOnly: true, defaultValue: "User", showInForm: true, sectionId: "sectionDetails",
                options: [
                    { value: "SUPER_ADMIN", label: '{"en":"Super Admin"}' },
                    { value: "SYSTEM_ADMIN", label: '{"en":"System Admin"}' },
                    { value: "USER", label: '{"en":"User"}' }
                ],
            },
            { id: 'roleProfile', isHidden: true, type: 'text', label: '{"en":"Full Name"}', sectionId: "sectionDetails" },
            { id: 'language', type: 'text', isHidden: true, defaultValue: 'en', label: '{"en":"Language"}', sectionId: "sectionDetails" },
            { id: 'lastLoginOn', type: 'datetime', isReadOnly: true, label: '{"en":"Last Logged-in On"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
            { id: 'sectionChangePassword', type: 'section', label: '{"en":"Change Password"}', sorting: 2, sectionExpanded: false },
            { id: 'password', type: 'text', formComponentType: "password", label: '{"en":"New Password"}', isPassword: true, showInForm: true, sectionId: "sectionChangePassword" },

            { id: 'accessAllBranch', type: 'boolean', label: '{"en":"Access All Branch"}', showInForm: true, sectionId: "sectionBranchAccess" },
            {
                id: 'accessBranches', type: "table", formColumnSize: "col-12", showInForm: true,
                formComponentType: "table", label: '{"en":"Access Branches"}',
                sectionId: 'sectionBranchAccess', options: "user_access_branch"
            },
            { id: "companyId", type: "text", isHidden: true, defaultValue: false, label: '' },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})




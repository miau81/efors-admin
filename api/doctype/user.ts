import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "user",
        label: '{"en":"User"}',
        namingType: "byField",
        namingFormat: "email",
        fields: [...myErpFields,

        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'firstName', type: 'text', label: '{"en":"First Name"}', showInTable: true, showInForm: true, sectionId: "sectionDetails", },
        { id: 'lastName', type: 'text', label: '{"en":"Last Name"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
        { id: 'fullName', type: 'text', label: '{"en":"Full Name"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
        { id: 'email', mandatory: true, type: 'text', formComponentType: "email", label: '{"en":"Email"}', showInTable: true, showInForm: true, sectionId: "sectionDetails", },
        { id: 'language', type: 'text', isHidden: true, defaultValue: 'en', label: '{"en":"Language"}', sectionId: "sectionDetails" },
        { id: 'isSuperAdmin', type: 'boolean', isHidden: true, defaultValue: false, label: '{"en":"Super Admin"}', sectionId: "sectionDetails" },
        { id: 'lastLoginOn', type: 'datetime', isReadOnly: true, label: '{"en":"Last Logged-in On"}', showInTable: true, showInForm: true, sectionId: "sectionDetails" },
        { id: 'isSystemAdmin', type: 'text', isHidden: true, defaultValue: false },
        { id: 'sectionChangePassword', type: 'section', label: '{"en":"Change Password"}', sorting: 2, sectionExpanded: false },
        { id: 'password', type: 'text', formComponentType: "password", label: '{"en":"New Password"}', isPassword: true, showInForm: true, sectionId: "sectionChangePassword" },
        { id: 'defaultCompany', type: 'text', isHidden: true, isReadOnly: true },
        ]
    }
    return type;
})




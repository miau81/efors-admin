import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "customer",
        label: '{"en":"Customer"}',
        namingType:"byField",
        namingFormat:"email",
        fields: [...myErpFields,

        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'firstName', type: 'text', label: '{"en":"First Name"}', sectionId: "sectionDetails", hideInTable: true },
        { id: 'lastName', type: 'text', label: '{"en":"Last Name"}', sectionId: "sectionDetails", hideInTable: true },
        { id: 'fullName', type: 'text', label: '{"en":"Full Name"}', sectionId: "sectionDetails", hideInTable: true },
        { id: 'email', type: 'text', formComponentType:"email", label: '{"en":"Email"}', sectionId: "sectionDetails", hideInTable: true },
        { id: 'language', type: 'text', isHidden:true, defaultValue:'en', label: '{"en":"Language"}', sectionId: "sectionDetails", hideInTable: true },
        { id: 'isSuperAdmin', type: 'boolean', isHidden:true, defaultValue:false, label: '{"en":"Super Admin"}', sectionId: "sectionDetails"},
        { id: 'lastLoginOn', type: 'datetime', isReadOnly:true, label: '{"en":"Last Logged-in On"}', sectionId: "sectionDetails"},
        { id: 'isSystemAdmin', type: 'text', isHidden: true, defaultValue:false },
        { id: 'sectionChangePassword', type: 'section', label: '{"en":"Change Password"}', sorting: 2 ,sectionExpanded:false},
        { id: 'password', type: 'text', formComponentType:"password", label: '{"en":"New Password"}', hideInTable:true, isPassword:true, sectionId: "sectionChangePassword"},
        { id: 'defaultCompany', type: 'text', isHidden:true, isReadOnly:true},
        ]
    }
    return type;
})




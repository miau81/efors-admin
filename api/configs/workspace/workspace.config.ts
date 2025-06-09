

export const config=[
    {
      id: 'dashboard',
      label: '{"en":"Dashboard","zh":"仪表板"}',
      isSingle: true,
      children: [],
      icon: 'microsoft',
      sorting: 1,
      isHidden: false,
      link: 'dashboard'
    },
    {
      id: 'company',
      label: 'Company',
      isSingle: true,
      children: [],
      icon: 'bi bi-building',
      sorting: 2,
      isHidden: false,
      link: 'doc/company'
    },
    {
      id: 'master_data',
      label: 'Master Data',
      isSingle: true,
      icon: 'bi bi-database',
      sorting: 3,
      link:"master_data",
      isHidden: false,
      // children: [
      //   {
      //     id: 'item',
      //     label: 'Item',
      //     sorting: 1,
      //     icon: 'bi bi-box-seam',
      //     link: 'item'
      //   },
      // ]
      //   // {
      //   //   code: 'CUSTOMER',
      //   //   name: 'Customer',
      //   //   sorting: 1,
      //   //   icon: 'bi bi-people',
      //   //   link: 'customer'
      //   // }
      // ],
    },
    {
      id: 'selling',
      label: 'Selling',
      isSingle: false,
      icon: 'bi bi-currency-dollar',
      sorting: 4,
      isHidden: false,
      children: [
        {
          id: 'invoice',
          label: 'Invoice',
          sorting: 1,
          icon: 'bi bi-file-text',
          link: 'invoice'
        },
        {
          id: 'e_invoice',
          label: 'E-Invoice',
          sorting: 1,
          icon: 'bi bi-file-text',
          link: 'e-invoice'
        }
      ],

    },
     {
      id: 'user',
      label: 'Users',
      icon: 'people',
      isSingle: true,
      sorting: 999,
      isHidden: false,
      link: 'doc/user'
     }
    // {
    //   id: 'system_settings',
    //   label: 'System Settings',
    //   icon: 'database-gear',
    //   isSingle: true,
    //   sorting: 999,
    //   isHidden: false,
    //   link: 'system-settings'
    // }

  ]
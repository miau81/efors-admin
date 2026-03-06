import { DocTypeRegistry } from './doctype.registry';

// 这里的 import('./...') 是静态路径，Angular 编译器能识别并分包
DocTypeRegistry.register('sales_invoice', () => import('../sales_invoice'));
DocTypeRegistry.register('sales_invoice_item',()=> import('../sales_invoice_item'));
DocTypeRegistry.register('sales_invoice_charge_discount',()=> import('../sales_invoice_charge_discount'));
export interface IInvoice {
    amountFormatted: string;
    invoicePDF: string;
    invoiceURL: string;
    paid: boolean;
    status: string;
    dueDate?: Date;
}

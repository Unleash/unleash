export interface IInvoice {
    amountFomratted: string;
    invoicePDF: string;
    invoiceURL: string;
    paid: boolean;
    status: string;
    dueDate?: Date;
}

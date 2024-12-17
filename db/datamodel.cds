namespace OrdersMaster.db;
using { managed,cuid, Currency} from '@sap/cds/common';

entity Orders : cuid,managed{
    PRNumber           : String(10) @readonly;
    PRType             : String;
    OVERALL_STATUS         :OrderStatus; // Using the enum here instead of String; // Association to Status
    RequestDescription  : String;
    // CreatedBy          : String; // Managed by system
    // ChangedBy          : String; // Managed by system
    // CreatedAt          : Timestamp; // Managed by system
    // ChangedAt          : Timestamp; // Managed by system
    RequestNo          : String(10);
     TotalItemCost    : AmountT;
     Currency : Currency;
    Items             : Composition of  many PurchaseRequestItems on Items.Parent = $self;
    _Attachments       : Composition of many MediaFile on _Attachments.PurchaseHeader = $self;
}

entity MediaFile {
      key id       : UUID;
    PurchaseHeader              : Association to Orders;
    @Core.ContentDisposition.Type: 'inline'
    @Core.MediaType: mediaType
    content       : LargeBinary; // The binary content of the file
    @Core.IsMediaType: true
    mediaType     : String; // MIME type of the file
    fileName      : String; // Name of the uploaded file
    size          : Integer; // Size of the file in bytes
    url           : String; // URL to access the uploaded file
      
}

entity PurchaseRequestItems:managed {
   key UUID                 : UUID ;
    Parent             : Association to Orders;
    PRItemNumber            : Int16;
    Material                : String;
    MaterialDescription      : String;
    PurOrg                  : String;
    Plant                   : String;
    OVERALL_STATUS                 : OrderStatus; // Using the enum here instead of String;
    // CreatedBy               : String; // Managed by system
    // ChangedBy               : String; // Managed by system
    // CreatedAt               : Timestamp; // Managed by system
    // ChangedAt               : Timestamp; // Managed by system
    Quantity                : Integer;
    UoM                     : String;
    Price                   : Decimal;
    ReqItemNo              : String;
    TotalCost : AmountT;
     Currency : Currency;
}

type OrderStatus : String enum{
    Approval = 'A';
    Ordered = 'O';
    Rejected = 'R';
    Saved = 'S';
    Open = 'OP';
}
type AmountT : Decimal(10,2)@(
    Semantics.amount.currencyCode: 'CURRENCY_CODE',
    sap.unit:'CURRENCY_CODE'
);

using { OrdersMaster.db } from '../db/datamodel';

service purchase@(path : '/media')  {
entity purchaseRequestd @(odata.draft.enabled: true) as projection on db.Orders{
    *,
    Items,
    _Attachments,
        case OVERALL_STATUS
            when 'O' then 2
            when 'S' then 2
            when 'A' then 3
            when 'R' then 1
            when 'OP' then 2
            end as ColorCode : Integer
};
entity reqItem as projection on db.PurchaseRequestItems;
entity media as projection on db.MediaFile;

}

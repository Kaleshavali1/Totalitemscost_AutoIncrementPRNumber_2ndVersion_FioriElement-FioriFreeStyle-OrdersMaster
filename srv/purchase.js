const { foreach } = require('@sap/cds');

module.exports = cds.service.impl( async function(){
    const { v4: uuidv4 } = require('uuid');
    const { purchaseRequestd,media,reqItem } = this.entities;
    this.before('CREATE', media.drafts, req => {
        
        req.data.url = `/media/purchaseRequestd(ID=${req.data.PurchaseHeader_ID},IsActiveEntity=true)/_Attachments(id='${req.data.id}',IsActiveEntity=true)/content`
    });

    this.after('CREATE', media, async ( req) => {
        return req.data;
    });

     //////////// here auto increment by 10 at reqItem 'PRItemNumber' when you create new record
      this.before('NEW', reqItem.drafts, async req => {
     
        const DEFAULT_START = 10;
     
        // Check existing items for the same header
        const existingItems = await SELECT.columns('PRItemNumber')
          .from(reqItem.drafts)
          .orderBy`PRItemNumber desc`
          .limit(1);
     
        if (existingItems.length === 0) {
          req.data.PRItemNumber = DEFAULT_START;
        } else {
          const highestReqItemNo = Math.max(...existingItems.map(item => item.PRItemNumber));
          req.data.PRItemNumber = highestReqItemNo + 10;
        }
     
      });
    

      this.after('DELETE', reqItem.drafts, async req => {

        // Step 1: Select all remaining items after the deletion
        var existingItems = await SELECT.from(reqItem.drafts);
        console.log(existingItems)
  
        // Step 2: Renumber the remaining items
        let baseNumber = 10;
  
        // Loop through the existing items and update their PRItemNumber
        for (let item of existingItems) {
          item.PRItemNumber = baseNumber;
  
          // Step 3: Update each item in the drafts table
          await UPDATE(reqItem.drafts)
            .set({ PRItemNumber: item.PRItemNumber })  // Update the PRItemNumber field
            .where({ UUID: item.UUID });  // Use the item's ID to identify it for updating
  
          const updateitems = await SELECT.from(reqItem.drafts);
          console.log(updateitems);
  
          baseNumber += 10;  // Increment baseNumber for the next item
        }
  
        // Optionally, log the updated data to verify
        console.log('Items renumbered successfully');
      });


     ////////////  here auto increment by 10 at purchaseRequestd 'PRNumber' when you create new record
      this.before('CREATE', purchaseRequestd, async (req) => {
        const existingRecords = await cds.run(
            SELECT.from(purchaseRequestd).columns('PRNumber')
        );
   
        // Find the highest existing PRNumber
        let maxNumber = 0;
        if (existingRecords.length > 0) {
            maxNumber = Math.max(
                ...existingRecords.map(record => parseInt(record.PRNumber.substring(2), 10))
            );
        }
   
        // Generate the next PRNumber
        const nextPRNumber = `PR${(maxNumber + 1).toString().padStart(4, '0')}`;
        req.data.PRNumber = nextPRNumber;
    });


////////////////////After delete the record below records are auto increment at PRNumber like'PR10002',"PR10003".....
    this.after('DELETE', purchaseRequestd, async (req) => {
        const remainingRecords = await cds.run(
            SELECT.from(purchaseRequestd).columns('ID').orderBy('PRNumber')
        );
   console.log(remainingRecords);
        // Reassign PRNumbers to ensure sequential order
        for (let i = 0; i < remainingRecords.length; i++) {
            const newPRNumber = `PR${((i + 1) * 1).toString().padStart(4, '0')}`;
           // console.log(newPRNumber);
            await cds.run(
                UPDATE(purchaseRequestd)
                    .set({ PRNumber: newPRNumber })
                    .where({ ID: remainingRecords[i].ID })
            );
        };
    });
//  ////////// It is not working
    this.after('DELETE',reqItem,async(req)=>{
        const remainingRecords1 = await cds.run(SELECT.from(purchaseRequestd).columns('ID'));
  console.log(remainingRecords1);
  for(let i=0;i<remainingRecords1.length;i++){
  const items = await SELECT.from(reqItem).where({ Parent: remainingRecords1[i].ID });
  console.log(items);
  
        for (let i = 0; i < items.length; i++) {
          const newPRItemNumber = (i + 1) * 10; // Increment by 10
          await cds.run(
            UPDATE(reqItem)
                .set({ PRItemNumber : newPRItemNumber })
                .where({ UUID : items[i].UUID})
        );
       
        }
      }
 })
   

//////////// When Items are created or updated, calculate Price for each item
///////////// Same answer but different apporac
   this.after('READ',purchaseRequestd , async(req) => {
        const remainingRecords = await cds.run(SELECT.from(purchaseRequestd).columns('ID'));
      //console.log(remainingRecords);
      let totalCost = 0,totalCost1=0;
      for(let i=0;i<remainingRecords.length;i++){
      const items = await SELECT.from(reqItem).where({ Parent: remainingRecords[i].ID });
     // console.log(items);
      
            for (const item of items) {
            //  console.log(item.Price);
              totalCost = item.Quantity * item.Price; // Calculate item cost
              totalCost1 = totalCost1+totalCost;
            //  console.log(totalCost);
              await cds.run(
                UPDATE(reqItem)
                    .set({ TotalCost : totalCost })
                    .where({ UUID : item.UUID})
            );
           
            }
           // console.log(totalCost1);
            await cds.run(
              UPDATE(purchaseRequestd)
                  .set({ TotalItemCost : totalCost1 })
                  .where({ ID : remainingRecords[i].ID})
          );
          totalCost=0,totalCost1=0;
      }
       });



  // After creating a new PurchaseRequestItem, recalculate the total cost of the associated PurchaseRequest
  this.after('NEW', reqItem, async (newItem) => {
    const  totalCost =0;
    for(const parentID of newItem){
    const items = await cds.run(SELECT.from(reqItem).where({ Parent: parentID }));
    console.log(items)
    // Recalculate the total cost for the parent PurchaseRequest
    for (const item of items) {
      totalCost += item.Quantity * item.Price;
      
    }
    console.log(totalCost);
    const i=await cds.run(
     UPDATE(purchaseRequestd).set({ TotalItemCost: totalCost }).where({ ID: parentID })
    );
    console.log(i+"item")
  }
  });
   
  });
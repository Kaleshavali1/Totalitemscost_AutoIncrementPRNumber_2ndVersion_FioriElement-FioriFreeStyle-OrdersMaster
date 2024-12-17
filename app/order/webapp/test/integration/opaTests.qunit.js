sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'order/test/integration/FirstJourney',
		'order/test/integration/pages/purchaseRequestdList',
		'order/test/integration/pages/purchaseRequestdObjectPage',
		'order/test/integration/pages/reqItemObjectPage'
    ],
    function(JourneyRunner, opaJourney, purchaseRequestdList, purchaseRequestdObjectPage, reqItemObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('order') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThepurchaseRequestdList: purchaseRequestdList,
					onThepurchaseRequestdObjectPage: purchaseRequestdObjectPage,
					onThereqItemObjectPage: reqItemObjectPage
                }
            },
            opaJourney.run
        );
    }
);
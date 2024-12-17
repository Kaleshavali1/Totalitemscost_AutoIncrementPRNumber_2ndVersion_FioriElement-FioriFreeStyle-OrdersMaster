sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        _Approval: function(oEvent) {
            MessageToast.show("Custom handler invoked.");
            
        }
    };
});

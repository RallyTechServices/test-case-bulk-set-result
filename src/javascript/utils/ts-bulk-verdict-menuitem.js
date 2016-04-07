Ext.define('CA.techservices.bulk.BulkVerdictMenuItem',{
    extend: 'Rally.ui.menu.item.RecordMenuItem',
    alias: 'widget.tsbulkverdictmenuitem',
    
    config: {
        text: 'Add Verdict...', 
        handler: function() {
            this._launchVerdictDialog();
        },
            
        predicate: function(record) {
            return true;
        }
    },
    
    _launchVerdictDialog: function() {
        var records = this.records || [this.record];
        
        if ( records.length > 0 ) {
            Deft.Chain.pipeline([
                this._getTCRModel,
                this._getRequiredFields,
                this._launchDialog
            ],this).then({
                scope: this,
                success: function(dialog){
                    
                },
                failure: function(msg) {
                    Ext.Msg.alert('',msg);
                }
            });
            
        }
    },
    
    _launchDialog: function(fields) {
        var dialog = Ext.create('CA.techservices.dialog.VerdictDialog',{
            autoShow: true,
            maxHeight: Rally.getApp().getHeight() - 25,
            maxWidth: Rally.getApp().getWidth() - 50,
            fields: fields,
            listeners: {
                scope: this,
                valueschosen: function(dialog,values){
                    this._setResults(values);
                }
            }
        });
        
        return dialog;
    },
    
    _getTCRModel: function() {
        var deferred = Ext.create('Deft.Deferred');
        
        Rally.data.ModelFactory.getModel({
            type: 'TestCaseResult',
            scope: this,
            success: function(model) {
                this.tcr_model = model;
                deferred.resolve(model);
            }
        });
        return deferred.promise;
    },
    
    _getRequiredFields: function(model) {
        var blacklist = ['TestCase'];
        return Ext.Array.filter(model.getFields(), function(field){
            if ( field.hidden ) {
                return false;
            }
            
            if ( Ext.Array.contains(blacklist, field.name) ) {
                return false;
            }
            
            return ( field.required && !field.readOnly );
        });
    },
    
    _setResults: function(values) {
        var me = this;
        
        var promises =  Ext.Array.map(this.records, function(record){
            return function() {
                return me._setResult(values, record);
            };
        });
        
        Rally.getApp().setLoading('Saving verdicts...');
        Deft.Chain.sequence(promises).then({
            success: function() {
                Rally.getApp().setLoading(false);
            },
            failure: function(msg) {
                Ext.Msg.alert('Problem saving verdicts', msg);
                Rally.getApp().setLoading(false);
            }
        });
    },
    
    _setResult: function(values, testcase) {
        var deferred = Ext.create('Deft.Deferred');
        var tcr_model = this.tcr_model;
        values.TestCase = testcase.get('_ref');
        var tcr = Ext.create(tcr_model, values);
        tcr.save({
            callback: function(result, operation, success) {
                if ( success ) {
                    testcase.save();  // force reload in grid
                    deferred.resolve(result);
                } else {
                    deferred.reject(operation.Error && operation.Error.Errors.join(' '));
                }
            }
        });
        return deferred.promise;
    }
});
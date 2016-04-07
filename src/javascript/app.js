Ext.define("TSTestCaseBulkResult", {
    extend: 'Rally.app.GridBoardApp',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    modelNames: ['TestCase'],
    statePrefix: 'ts-tcbr-customlist',

    disallowedAddNewTypes: ['user', 'userprofile', 'useriterationcapacity', 'testcaseresult', 'task', 'scmrepository', 'project', 'changeset', 'change', 'builddefinition', 'build', 'program'],
    orderedAllowedPageSizes: [10, 25, 50, 100, 200],
    allowExpansionStateToBeSaved: false,
    isEditable: true,

    config: {
        defaultSettings: {
            showControls: true,
            type: 'TestCase',
            columnNames: ['FormattedID','Name']
        }
    },

    getFieldPickerConfig: function () {
        var config = this.callParent(arguments);
        config.gridFieldBlackList = _.union(config.gridFieldBlackList, [
            'Artifacts',
            'CreationDate',
            'Projects',
            'VersionId'
        ]);
        return _.merge(config, {
            gridAlwaysSelectedValues: ['FormattedID', 'Name']
        });
    },

    getFilterControlConfig: function() {
        return {
            filterControlConfig: {
                blackListFields: ['Project']
            }
        };
    }, 
    
    _loadWsapiRecords: function(config){
        var deferred = Ext.create('Deft.Deferred');
        var me = this;
        var default_config = {
            model: 'Defect',
            fetch: ['ObjectID']
        };
        this.logger.log("Starting load:",config.model);
        Ext.create('Rally.data.wsapi.Store', Ext.Object.merge(default_config,config)).load({
            callback : function(records, operation, successful) {
                if (successful){
                    deferred.resolve(records);
                } else {
                    me.logger.log("Failed: ", operation);
                    deferred.reject('Problem loading: ' + operation.error.errors.join('. '));
                }
            }
        });
        return deferred.promise;
    },
    
    getPermanentFilters: function() {
        console.log(this.getSettings());
        if ( Ext.isEmpty(this.getSetting('query') ) ) {
            return [];
        }
        return Rally.data.wsapi.Filter.fromQueryString( this.getSetting('query') );
    },
    
    getSettingsFields: function() {
        return Rally.apps.customlist.Settings.getFields(this);
    },

    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    },
    
    //onSettingsUpdate:  Override
    onSettingsUpdate: function (settings){
        this.logger.log('onSettingsUpdate',settings);
        // Ext.apply(this, settings);
        this.launch();
    }
});

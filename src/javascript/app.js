Ext.define("TSTestCaseBulkResult", {
    extend: 'Rally.app.GridBoardApp',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    modelNames: ['TestSet'],
    statePrefix: 'ts-tcbr-customlist',

    disallowedAddNewTypes: ['user', 'userprofile', 'useriterationcapacity', 'testcaseresult', 'task', 'scmrepository', 'project', 'changeset', 'change', 'builddefinition', 'build', 'program'],
    orderedAllowedPageSizes: [10, 25, 50, 100, 200],
    allowExpansionStateToBeSaved: false,
    isEditable: true,

    config: {
        defaultSettings: {
            showControls: true,
            type: 'TestCase',
            columnNames: ['FormattedID','Name'],
            explanationText: TSSettings.defaultExplanation
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
           blackListFields: ['Project','LastResult','ObjectUUID','WorkProduct']
        };
    }, 
    
    getGridConfig: function(options) {
        return {
            xtype: 'rallytreegrid',
            alwaysShowDefaultColumns: false,
            columnCfgs: this.getColumnCfgs(),
            enableBulkEdit: true,
            enableRanking: Rally.data.ModelTypes.areArtifacts(this.modelNames),
            expandAllInColumnHeaderEnabled: true,
            plugins: this.getGridPlugins(),
            stateId: this.getScopedStateId('grid'),
            stateful: true,
            store: options && options.gridStore,
            storeConfig: {
                filters: this.getPermanentFilters()
            },
            summaryColumns: [],
            listeners: {
                afterrender: this.publishComponentReady,
                storeload: {
                    fn: function () {
                        this.fireEvent('contentupdated', this);
                    },
                    single: true
                },
                select: function(selModel, record) {
                    record.cascadeBy(function(child){
                        selModel.select(child, true, true);
                    });
                },
                deselect: function(selModel, record) {
                    record.cascadeBy(function(child) {
                        selModel.deselect(child, true);
                    });

                    // if parent node is selected, deselect it, too
                    selModel.deselect(record.parentNode,true);
                },
                scope: this
            },
            bulkEditConfig: {
                items:  [{ xtype: 'tsbulkverdictmenuitem' }]
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

        if ( Ext.isEmpty(this.getSetting('query') ) ) {
            return [];
        }
        return Rally.data.wsapi.Filter.fromQueryString( this.getSetting('query') );
    },
    
    getSettingsFields: function() {
        return TSSettings.getFields(this);
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
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{
            title: 'Information',
            informationalConfig: {
                html: this.getSetting('explanationText')
            }
        });
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

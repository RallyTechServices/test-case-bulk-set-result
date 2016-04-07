
Ext.define('CA.techservices.dialog.VerdictDialog', {
    
    extend: 'Rally.ui.dialog.Dialog',
    alias: 'widget.tsverdictdialog',
    
    height: 400,
    width: 600,
    closable: true,
    draggable: true,

    config: {
        /**
         * @cfg {String}
         * Title to give to the dialog
         */
        title: 'Set Required Verdict Information',
        /**
         * @cfg [{Rally.data.wsapi.Field}] (required)
         * List of required field objects
         */
        fields: [],
        
        /**
         * @cfg {String}
         * Text to be displayed on the button when selection is complete
         */
        selectionButtonText: 'Save'
    },

    constructor: function(config) {
        this.mergeConfig(config);

        this.callParent([this.config]);
    },


    initComponent: function() {
        this.callParent(arguments);

        this.addEvents(
            /**
             * @event valueschosen
             * Fires when user clicks done after choosing an artifact
             * @param {CA.techservices.dialog.VerdictDialog} source the dialog
             * @param {Object} field values
             */
            'valueschosen'
        );
    },

    destroy: function() {
        this.callParent(arguments);
    },

    beforeRender: function() {
        this.callParent(arguments);

        this.addDocked({
            xtype: 'toolbar',
            dock: 'bottom',
            padding: '0 0 10 0',
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            ui: 'footer',
            items: [
                {
                    xtype: 'rallybutton',
                    itemId: 'doneButton',
                    text: this.selectionButtonText,
                    cls: 'primary rly-small',
                    scope: this,
                    disabled: true,
                    userAction: 'clicked done in dialog',
                    handler: function() {
                        this.fireEvent('valueschosen', this, this.getValues());
                        this.close();
                    }
                },
                {
                    xtype: 'rallybutton',
                    text: 'Cancel',
                    cls: 'secondary rly-small',
                    handler: this.close,
                    scope: this,
                    ui: 'link'
                }
            ]
        });

        if (this.introText) {
            this.addDocked({
                xtype: 'component',
                componentCls: 'intro-panel',
                html: this.introText
            });
        }

        this.buildForm(this.fields);

    },

    getValues: function() {
        var values = this.form.getForm().getFieldValues();
        
        Ext.Object.each(values, function(key,value) {
            if ( Ext.isDate(value) ) {
                values[key] = Rally.util.DateTime.toIsoString(value);
            }
        });
        return values;
    },

    buildForm: function(fields) {
        var me = this;
        if (this.form) {
            this.form.destroy();
        }
        
        var items = Ext.Array.map(fields, function(field){

            var config = {
                name: field.name,
                fieldLabel: field.displayName,
                allowBlank: false,
                xtype: 'rallytextfield',
                listeners: {
                    scope: this,
                    change: function() {
                        me._checkValidity(field);
                    }
                }
            };
            
            var editor = field.editor;
            if ( editor ) {
                if ( editor.field ) {
                    editor = { 
                        xtype: editor.field.xtype,
                        field: field.name,
                        model: 'TestCaseResult'
                    };
                }
                config = Ext.Object.merge(config, editor);
            }
            
            return config;
        });
        
        this.form = Ext.create('Ext.form.Panel', {
            bodyPadding: 5,

            // Fields will be arranged vertically, stretched to full width
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },

            // The fields
            defaultType: 'rallytextfield',
            items: items
        });

        this.add(this.form);
    },
    
    _checkValidity: function() {
        // form not recognizing rally fields
        var valid = true;
        var values = this.getValues();
        
        Ext.Object.each(values, function(key,value){
            if ( Ext.isEmpty(value) ) {
                valid = false;
            }
        });
        
        if ( valid ) {
            this.down('#doneButton').setDisabled(false);
        } else {
            this.down('#doneButton').setDisabled(true);
        }
    }
});
var getHiddenFieldConfig = function (name) {
    return {
        name: name,
        xtype: 'rallytextfield',
        hidden: true,
        handlesEvents: {
            typeselected: function (type) {
                this.setValue(null);
            }
        }
    };
};

Ext.define('TSSettings', {
    singleton: true,
    requires: [
        'Rally.ui.combobox.FieldComboBox',
        'Rally.ui.combobox.ComboBox',
        'Rally.ui.CheckboxField'
    ],

    getFields: function (app) {
        this.app = app;
        return [
//            {
//                name: 'showControls',
//                xtype: 'rallycheckboxfield',
//                fieldLabel: 'Show Control Bar',
//                labelWidth: 105
//            },
            {
                xtype:'label',
                text:'Configurable Information Text',
                forId: 'explanationText'
            },
            {
                name: 'explanationText',
                xtype: 'rallyrichtexteditor',
                allowImageUpload: false,
                height: 150
            },
//            { type: 'query' },
            
            getHiddenFieldConfig('columnNames'),
            getHiddenFieldConfig('order')
        ];
    },
    
    defaultExplanation: "The TestCase Bulk Result app is provided as a method for setting the same result on more than one" +
        " test case at a time.  A user can select criteria to filter test sets by (e.g., Iteration).  Test sets and " +
        " their test cases are displayed in tree format.  Tick the boxes next to test cases you wish to assign a " +
        " verdict and then choose the gear icon.  The menu displayed will now include an option to 'Add Verdict'.  " +
        " Choosing this menu option will launch a dialog that provides an entry point for the required fields of a test case " +
        " so that a verdict can be assigned to the selected test cases."
});
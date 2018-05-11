/**
 * @class dw.model.WSDL
 * @extends Ext.data.Model
 * @author Danny Gehl
 *
 * The model for a WSDL
 *
 * @constructor
 */
Ext.define('dw.model.SOAPInfo', {
	extend : 'Ext.data.Model',
	fields : ['ID', 'name', 'type', 'sample'],
	idProperty : 'ID'
});

var soapStore = Ext.create('Ext.data.TreeStore',{
    model:'dw.model.SOAPInfo',
    storeId: 'SOAPInfoStore',
    defaultRootProperty: 'info',
    proxy: {
        type: 'ajax',
        url : 'Services-SOAPExplorer',
        reader: {
            type: 'json'
        }
    }
});

/**
 * @class dw.ext.SOAPExplorer
 * @extends Ext.Window
 * @author Danny Gehl
 *
 * The window which renders the SOAP explorer.
 *
 * @constructor
 */
Ext.define('dw.ext.SOAPExplorer', {
	extend: 'Ext.Window',
    width: 900,
    height: 600,
    minHeight: 400,
    minWidth: 550,
    hidden: false,
    maximizable: true,
    title: 'SOAP Explorer',
    layout: {
        type: 'vbox',       // Arrange child items vertically
        align: 'stretch',    // Each takes up full width
        padding: 3
    },
    closeAction: 'hide',
    tbar: [{
        id:'wsdlName',
	        emptyText:'Enter a WSDL name',
	        text: '',    
	        xtype: 'textfield',
	        width: 150,
	        qtip : 'The name of the WSDL file as placed in webreferences folder excluding the file extension.<br />'+
	        		'Note: The defining carridge must be assigned to the Business Manager site'
	    },{
	    	text: 'Add',
	        iconCls: 'add',
	        handler: function() {
	        	var value = Ext.getCmp('wsdlName').getRawValue();
	        	Ext.getCmp('soapinfotree').getRootNode().appendChild({
	    			ID      : value,
	    			name    : value,
	    			type    : 'WSDL',
	    			leaf    : false,
	    			iconCls : 'folder_explore'
	        	});
	        }
	    },'->',{
	        text: 'Clear data',
	        iconCls: 'arrow_refresh',
	        handler: function() {
	        	//Ext.getCmp('soapinfotree').getRootNode().expand();
	        	soapStore.load();
	        }
	    }],
	items: [{
		id: 'soapinfotree',
        xtype: 'treepanel',
        store: soapStore,
        rootVisible: false,
        displayField: 'name',
        flex: 2,
        listeners: {
        	'itemclick' : function( panel, record, item, index, e, eOpts ){
        		console.log(record);
        		var codepanel = Ext.getCmp('codepanel');
        		var brush = new SyntaxHighlighter.brushes.JScript();
        		brush.init({ toolbar: false });
        		codepanel.update(brush.getHtml(record.data.sample));
        		//SyntaxHighlighter.all();
        	}
        }
    },{
        xtype: 'panel',
        id:    'codepanel',
        title: 'Sample code snippet',
        flex:  1
    }]
})

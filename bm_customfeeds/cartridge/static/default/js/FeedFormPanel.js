/**
 * @class FeedFormPanel
 * @extends Ext.FormPanel
 * @author Danny Gehl
 *
 * The form to edit the feeds.
 *
 * @constructor
 * Create a new Feed Form Panel
 * @param {Object} the main panel
 */

 Ext.create('Ext.data.Store', {
	storeId: 'FeedTypes',
    fields: ['id'],
    data : [
	    {id: 'XML'},
	    {id: 'CSV'}
	],
    autoLoad:true
});

FeedFormPanel = function(main){
    // turn on validation errors beside the field globally
    Ext.form.Field.prototype.msgTarget = 'side';
    
    var pidField = new Ext.form.TextField({
        id:'preview-product-id',
        emptyText:'Enter a product ID',
        text: '',    
        xtype: 'textfield',
        width: 150
    });
    FeedFormPanel.superclass.constructor.call(this, {
       monitorValid: true,
	   labelAlign: 'top',
	   region:'center',
	   frame:true,
	   bodyStyle:'padding:5px 5px 0',
	   fit: true,
       tbar:[
         'Set preview product:',
         pidField
         ,{
        	text: '...',
            handler : function(){
            	var picker = Ext.create('dw.ext.ProductPicker');
            	picker.items.get(0).on('itemdblclick',function(grid, record, item, index, e, eOpts){
            		pidField.setRawValue(record.data.ID);
            		picker.hide();
            	});
            	picker.show();
            }
        },
         ,{
        	iconCls: 'find',
            scope: this,
            handler : function(){
            	Ext.Ajax.request({
            		url : 'BMCustomFeeds-Preview',
            		params: {pid:pidField.getValue(),feed:main.record.data.id},
            		callback : function(options, success, response) {
            			console.log(response);
            			main.preview.items.first().setValue(response.responseText);
        		    }
        		});
            }
        },
        '->',
        Ext.create('Ext.button.Split',{
        	iconCls:'layout',
            text:'Preview pane',
            tooltip: {title:'Preview',text:'Show, move or hide the preview Pane'},
            handler: main.movePreview,
            scope: main,
            menu:{
                id:'reading-menu',
                cls:'reading-menu',
                width:100,
                items: [{
                    text:'Right',
                    checked:true,
                    group:'rp-group',
                    checkHandler: main.movePreview,
                    scope:main,
                    iconCls:'preview-right'
                },{
                    text:'Bottom',
                    checked:false,
                    group:'rp-group',
                    checkHandler: main.movePreview,
                    scope:main,
                    iconCls:'preview-bottom'
                },{
                    text:'Hide',
                    checked:false,
                    group:'rp-group',
                    checkHandler: main.movePreview,
                    scope:main,
                    iconCls:'preview-hide'
                }]
            }
        })],
        items: [{
            xtype: 'container',
	        anchor: '100%',
	        layout: 'hbox',
            items:[{
                xtype: 'container',
	            flex: 1,
	            layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'ID',
                    name: 'id',
                    anchor:'95%',
                    allowBlank: false
                }, {
                    xtype:'combo',
                    selectOnFocus:true,
                    forceSelection: true,
                    autoSelect: true,
                    allowBlank:false,
                    editable: false,
	                queryMode: 'local',
	                lastQuery: '',
	                displayField: 'id',
	                valueField: 'id',
	                triggerAction: 'all',
                    store: 'FeedTypes',
                    fieldLabel: 'Type',
                    name: 'type',
                    anchor:'95%'
                }]
            },{
                xtype: 'container',
	            flex: 1,
	            layout: 'anchor',
                items: [{
                    xtype:'textfield',
                    fieldLabel: 'Folder Name',
                    name: 'folderName',
                    anchor:'95%',
                    allowBlank: false,
                    validator:function(val){
                    	return /^(IMPEX|REALMDATA|LIBRARIES|TEMP|CATALOGS).*/.test(val)?true:'Please specify a valid root folder for dw.io.File';
                	}
                },{
                    xtype:'textfield',
                    fieldLabel: 'File Name',
                    name: 'fileName',
                    anchor:'95%',
                    allowBlank: false,
                    validator:function(val){
                    	return /^([a-zA-Z0-9_,\s-]*(\{\{[^\{\}]+\}\})?)+(\.[A-Za-z]*)*$/.test(val)?true:'Please enter a valid filename!';
                	}
                },{
                    xtype:'textfield',
                    fieldLabel: 'File Encoding',
                    name: 'fileEncoding',
                    anchor:'95%'
                }]
            }]
        },{
        	// it might be better to create a new file for this
            xtype:'textareafield',
            name:'configuration',
            fieldLabel:'Template',
            height:200,
            anchor:'98%',
            allowBlank: false,
            listeners:{
            	// add context menu event
            	'render': function(cmp) {
            		cmp.getEl().on('contextmenu', function(e,b,c,d){
            			e.preventDefault();
            			this.fireEvent('contextmenu',e,b,c,d);
            		},this);
            	},
            	'contextmenu':function(e){
            		// create a dummy menu for now, should support adding fields later
            		var onAttributeSelect = function(item,checked){
            			if(checked){
                			var rawEl = this.inputEl.dom;
                			this.setRawValue(rawEl.value.substring(0, rawEl.selectionStart)+'{{'+item.text+'}}'+rawEl.value.substring(rawEl.selectionEnd));
            			}
            		};
            		if(!this.menu){
                		this.menu = new Ext.menu.Menu({
            		        id: 'mainMenu',
            		        scope: this,
            		        items: [
    	        		            {
    						            id:'field',
    						            text: 'Insert field',
    						            iconCls: 'insert-field',
    						            scope: this,
    					                menu: {        // <-- submenu by nested config object
    					                    scope: this,
    					                	items: [
    					                        // this needs to be filled dynamically
    					                        '<b class="menu-title">Available attributes</b>',
    					                        {
    	    					                    scope: this,
    					                            text: 'name',
    					                            checked: false,
    					                            group: 'attribute',
    					                            checkHandler: onAttributeSelect
    					                        }, {
    	    					                    scope: this,
    					                            text: 'shortDescription',
    					                            checked: false,
    					                            group: 'attribute',
    					                            checkHandler: onAttributeSelect
    					                        }, {
    	    					                    scope: this,
    					                            text: 'color',
    					                            checked: false,
    					                            group: 'attribute',
    					                            checkHandler: onAttributeSelect
    					                        }, {
    	    					                    scope: this,
    					                            text: 'size',
    					                            checked: false,
    					                            group: 'attribute',
    					                            checkHandler: onAttributeSelect
    					                        }
    					                    ]
    					                }
    						        }

            		        ]
            		    });
            		}
            		this.menu.showAt(e.getXY());

	            }
	        }
        }],

        buttons: [{
            text: 'Save',
            formBind: true,
            scope: this,
            iconCls:'disk',
            handler: function(){
        		main.saveFeed();
            }
        },{
            text: 'Revert changes',
            iconCls:'cross',
            handler: function(){
            	Ext.MessageBox.confirm('Status', 'Do you really want to discard your changes?',function(action){
            		if(action == 'yes'){
                		main.loadFeed(main.record);
            		}
            	});
            	
            }
        }]
    });

};

Ext.extend(FeedFormPanel, Ext.FormPanel, {

});
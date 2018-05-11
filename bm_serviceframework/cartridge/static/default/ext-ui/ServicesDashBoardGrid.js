/*
 * Ext JS Library 2.3.0
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */

Ext.onReady(function() {
	Ext.QuickTips.init();

	// shorthand alias
	var fm = Ext.form;

	var comboBox = new Ext.form.ComboBox({
		store : (new dw.ext.CustomObjectStore('WebserviceCredentials', [ "ID" ])),
		forceSelection : true,
		triggerAction : 'all',
		valueField : 'ID',
		displayField : 'ID',
		emptyText : 'Select a target environment...',
		selectOnFocus : true
	});
	
	
	var values = new Array();

	var fullLogFormat = new Ext.data.Store({
		fields : [ 'id', 'displayValue' ],
		data : []
	});
	
	var formatEditor = new Ext.form.ComboBox({
		store : fullLogFormat,
		forceSelection : true,
		triggerAction : 'all',
		valueField : 'id',
		displayField : 'displayValue',
		emptyText : 'Select a format...',
		queryMode : 'local',
		selectOnFocus : true
	});
	

	// the column model has information about grid columns
	// dataIndex maps the column to the specific data field in
	// the data store (created below)
	var cm = [ {
		id : 'ID',
		header : "ID",
		dataIndex : 'ID',
		flex : 1,
		width : 200,
		editor : new fm.TextField({
			allowBlank : false
		})
	}, {
		header : "Webservice Credentials",
		dataIndex : 'targetEnvironment',
		width : 180,
		flex : 1,
		editor : comboBox
	}, {
		header : "Timeout",
		dataIndex : 'timeout',
		width : 70,
		align : 'right',
		editor : new fm.NumberField({
			allowBlank : false,
			allowNegative : false,
			maxValue : 100000
		})
	}, {
		header : "Use Locking",
		dataIndex : 'serviceEnableLocking',
		xtype : 'checkcolumn',
		width : 80
	}, {
		header : "Locked For",
		dataIndex : 'lockedFor',
		width : 100,
		align : 'right',
		editor : new fm.NumberField({
			allowBlank : false,
			allowNegative : false,
			maxValue : 100000
		})
	}, {
		header : "Maximum Attempts",
		dataIndex : 'maximumAttempts',
		width : 100,
		align : 'right',
		editor : new fm.NumberField({
			allowBlank : false,
			allowNegative : false,
			maxValue : 100000
		})
	}, {
		header : "Log status",
		dataIndex : 'logStatus',
		xtype : 'checkcolumn',
		width : 70
	}, {
		header : "Log Format",
		dataIndex : 'logCommunication',
		editor : formatEditor,
		width : 150
	}, {
		header : "Log File Prefix",
		dataIndex : 'logFilePrefix',
		width : 100,
		editor : new fm.TextField({
			allowBlank : false
		}),
	}

	];

	var customObjectServerConfig = new CustomObjectServerConfig('bm_serviceframework/cartridge/scripts/ui/WebserviceConfigHelper.ds', 'ID')
	// create the Data Store
	var store = Ext.create('dw.ext.CustomObjectStore',{
		type   : 'WebserviceConfiguration',
		config : Ext.encode(customObjectServerConfig)
	});

	store.on('load', function() {
		formatEditor.store.loadData(this.customMeta.fullDWDefinition.logCommunication.selectableValues);
	});
	// create the editor grid
	var grid = new Ext.grid.Panel({
		store : store,
		columns : cm,
		selType : 'rowmodel',
		plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit : 2
		}) ],
		// selType: 'rowmodel',
		// plugins: [
		// Ext.create('Ext.grid.plugin.RowEditing', {
		// clicksToEdit: 2
		// })
		// ],
		renderTo : 'customobject-ui',
		width : 960,
		height : 400,
		title : 'Services Dashboard',
		frame : true,
		scope : this,
		viewConfig : {
			forceFit : true,

			getRowClass : function(record, index) {

				return 'STATE_' + record.data.state;
			}
		},
		bbar : [  {
	        xtype: 'pagingtoolbar',
	        store: store,   // same store GridPanel is using
	        dock: 'bottom',
	        displayInfo: true,
	        border: false
		}, 
		"->",
		{
			text : 'Apply',
			handler : function() {
				store.sync()
			},
			iconCls : 'accept',
			ctCls : 'x-btn-over'
		}, {
			text : 'Cancel',
			handler : function() {
				store.rejectChanges();
			},
			iconCls : 'cancel',
			ctCls : 'x-btn-over'
		} ],
		tbar : [ {
			text : 'Add Webservice Configuration',
			iconCls : 'add',
			handler : function() {
				var p = Ext.create(store.getProxy().getModel().modelName, {
					ID : 'Enter Service ID',
					targetEnvironment : '',
					timeout : 10000
				});
				store.insert(0, p);
			},
			ctCls : 'x-btn-over'
		}, {
			text : 'Remove Configuration',
			tooltip : 'Remove the selected item',
			iconCls : 'delete',
			handler : function() {
				store.remove(grid.getSelectionModel().getSelection());
				store.sync();
			},
			ctCls : 'x-btn-over',
			scope : this
		}, {
			text : 'Edit Webservice Credentials',
			tooltip : 'Remove the selected item',
			iconCls : 'user_edit',
			handler : function() {
				window.open(Ext.get('credentialsUrl').dom.getAttribute('data-credentialsurl'), "_blank");
			},
			ctCls : 'x-btn-over'
		}, {
			text : 'Analytics BETA',
			tooltip : 'View charts with service runtimes.<br /><b>NOTE:</b> You nee to login to WebDAV for this feature.',
			iconCls : 'chart_curve',
			handler : function() {
				if (!this.analytics)
					this.analytics = Ext.create('ServiceChartWindow');
				this.analytics.show();
			},
			ctCls : 'x-btn-over',
			scope : this
		}, {
			text : 'WSDL explorer BETA',
			tooltip : 'View SOAP webservice types and methods.',
			iconCls : 'application_form_magnify',
			handler : function() {
				if (!this.explorer)
					this.explorer = Ext.create('dw.ext.SOAPExplorer');
				this.explorer.show();
			},
			ctCls : 'x-btn-over',
			scope : this
		}

		]
	});

});

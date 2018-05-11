/**
 * @class dw.model.ServiceLog
 * @extends Ext.data.Model
 * @author Danny Gehl
 *
 * The model for a service header log entry
 *
 * @constructor
 */
Ext.define('dw.model.ServiceLog', {
	extend : 'Ext.data.Model',
	fields : [ {name:'time', type:'date'}, 'service', 'code', 'ccode','error','msg','requestId','clarification','site',{name:'duration',type:'number'},'errorMessage' ],
	idProperty : 'time'
});


/**
 * @class dw.data.reader.ServiceLog
 * @extends Ext.data.reader.Json
 * @author Danny Gehl
 *
 * The the reader for a service header log file
 * This reader converts each line into a JSON object which is then consumed by hte parent JsonReader 
 *
 * @constructor
 */
Ext.define('dw.data.reader.ServiceLog',{
	extend : 'Ext.data.reader.Json',
	alias  : 'reader.servicelog',
	getResponseData : function(response){
        var data, error, line, lines, el, attrs, attr;
        
        try {
        	lines = response.responseText.split('\n');
            data = { success : true, total: lines.length, root : [  ]};
            for(var i = 0; i < lines.length; i++){
            	line = lines[i];
            	if(line.indexOf('[') != 0) continue;
            	el = {};
            	el.time = new Date(line.split(']')[0].split('[')[1].replace(/-/g,'/').replace(/\.[0-9]{3}/,''));
            	attrs = line.split('  ')[1].split(',');
            	for(var j = 0; j < attrs.length; j++){
            		attr = attrs[j].split('=');
            		el[attr[0]]= attr[1];
            	}
            	data.root.push(el);
            }
            //console.log(data);
            return this.readRecords(data)
        } catch (ex) {
            error = new Ext.data.ResultSet({
                total  : 0,
                count  : 0,
                records: [],
                success: false,
                message: ex.message
            });
        
            this.fireEvent('exception', this, response, error);
            Ext.log('Unable to parse the JSON returned by the server');
            return error;
        }
	}
});

/**
 * @class dw.data.reader.WebDAVDirectory
 * @extends Ext.data.reader.Json
 * @author Danny Gehl
 *
 * The the reader for a WebDAV directory
 *
 * @constructor
 */
Ext.define('dw.data.reader.WebDAVDirectory',{
	extend : 'Ext.data.reader.Json',
	alias  : 'reader.webdavdir',
	getResponseData : function(response){
        var data, error, line, lines, el, attrs, attr;
        
        try {
        	lines = response.responseText.split('\n');
            data = { success : true, total: lines.length, root : [  ]};
            for(var i = 0; i < lines.length; i++){
            	// @TODO Read all files and also save size and type (dir/file)
            	// the store should then filter on *.log 
            	// The file data can then be more generically used
            	line = lines[i];
            	attrs = /<a href="([^"]*\/(custom-sf-header[^\/]*))">/.exec(line);
            	if(attrs != null && attrs.length == 3 && attrs[1].indexOf('.log') > -1){
                	data.root.push({name:attrs[2],path:attrs[1]});
            	}
            }
            //console.log(data);
            return this.readRecords(data)
        } catch (ex) {
            error = new Ext.data.ResultSet({
                total  : 0,
                count  : 0,
                records: [],
                success: false,
                message: ex.message
            });
        
            this.fireEvent('exception', this, response, error);
            Ext.log('Unable to parse the JSON returned by the server');
            return error;
        }
	}
});

/**
 * The store with the log lines
 */
Ext.create('Ext.data.Store', {
	storeId: 'AnalyticsStore',
    model: 'dw.model.ServiceLog',
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url : '',
        reader: {
            type: 'servicelog',
            root: 'root'
        }
    },
});

/**
 * The store with the log files
 */
Ext.create('Ext.data.Store', {
	storeId: 'FileStore',
    fields: ['name','path'],
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url : '/on/demandware.servlet/webdav/Sites/Logs/',
        reader: {
            type: 'webdavdir',
            root: 'root'
        }
    },
});

/**
 * The chart showing the runtimes
 */

var chart = Ext.create('Ext.chart.Chart', {
    style: 'background:#fff',
    animate: true,
    store: 'AnalyticsStore',
    shadow: true,
    theme: 'Category1',
    legend: {
        position: 'right'
    },
    axes: [{
        type: 'Numeric',
        minimum: 0,
        position: 'left',
        fields: ['duration'],
        title: 'Duration',
        grid: {
            odd: {
                opacity: 1,
                fill: '#ddd',
                stroke: '#bbb',
                'stroke-width': 0.5
            }
        }
    }, {
        type: 'Time',
        position: 'bottom',
        fields: ['time'],
        title: 'Time',
        dateFormat: 'G:i',
        step:[Ext.Date.HOUR, 1]
    }],
    series: [{
        type: 'line',
        fill: true,
        smooth: true,
        xField: 'time',
        yField: 'duration',
        markerConfig: {
            type: 'circle',
            size: 4,
            radius: 4,
            'stroke-width': 0
        },
        tips: {
            trackMouse: true,
            items: [ 
                Ext.create('Ext.grid.property.Grid', {
                	id   : 'tipgrid',
	                width: 300
	            })
	        ],
            renderer: function(storeItem, item) {
              this.setTitle(storeItem.get('service') + ' service call');
              Ext.getCmp('tipgrid').setSource(storeItem.data);
            }
        }
    }]
});

Ext.define('ServiceChartWindow', {
	extend: 'Ext.Window',
    width: 900,
    height: 600,
    minHeight: 400,
    minWidth: 550,
    hidden: false,
    maximizable: true,
    title: 'Service runtime',
    layout: 'fit',
    closeAction: 'hide',
    tbar: [{
        text: 'Save Chart',
        iconCls: 'disk',
        handler: function() {
            Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
                if(choice == 'yes'){
                    chart.save({
                        type: 'image/png'
                    });
                }
            });
        }
    }, {
        text: 'Reload Data',
        iconCls: 'arrow_refresh',
        handler: function() {
        	var store = Ext.data.StoreManager.lookup('AnalyticsStore');
        	store.clearFilter();
        	store.load();
        }
    },'-','->', {
    	id: 'filecombo',
        fieldLabel: 'Select file',
        xtype: 'combobox',
        store: 'FileStore',
        valueField: 'path',
        displayField: 'name',
        editable: false,
        width: 400,
        labelWidth: 60,
        listeners: {
        	select : function(store, records) {
            	var store = Ext.data.StoreManager.lookup('AnalyticsStore');
        		store.getProxy().url=records[0].data.path;
            	store.clearFilter();
            	store.load();
            }
        }
    }, {
    	id: 'servicecombo',
        xtype: 'combobox',
        valueField: 'ID',
        displayField: 'ID',
        value: 'All services',
        editable: false,
        forceSelect: true,
        listeners: {
        	select : function(store, records) {
            	var store = Ext.data.StoreManager.lookup('AnalyticsStore');
            	if(records[0].data.ID == 'All services'){
                	// bug in Ext, this should be the way
                	store.removeFilter('service');
            	}else{
                	store.filter({id : 'service',property : 'service', value :records[0].data.ID});
            	}
            }
        }
    }, {
    	id: 'sitecombo',
        xtype: 'combobox',
        valueField: 'ID',
        displayField: 'ID',
        value: 'All sites',
        editable: false,
        forceSelect: true,
        listeners: {
        	select : function(store, records) {
            	var store = Ext.data.StoreManager.lookup('AnalyticsStore');
            	if(records[0].data.ID == 'All sites'){
                	// bug in Ext, this should be the way
                	store.removeFilter('site');
            	}else{
                	store.filter({id : 'site',property : 'site', value :records[0].data.ID});
            	}
            }
        }
    }],
    items: chart,
    listeners:{
    	afterrender : function(){
    		var store = Ext.data.StoreManager.lookup('AnalyticsStore');
    		store.on('load',function(){
    			var i,ids,data,combo;
            	// fill combobox with services from file
    			ids = store.collect('service');
    			data = [['All services']];
    			for(i = 0; i<ids.length; i++){
    				data.push([ids[i]]);
    			}
    			combo = Ext.getCmp('servicecombo');
    			if(combo){
    				combo.reset();
    				combo.bindStore(Ext.create('Ext.data.ArrayStore', {
        			    fields: ['ID'],
        			    data: data
        			}));
    			} 	
            	// fill combobox with sites from file
    			ids = store.collect('site');
    			data = [['All sites']];
    			for(i = 0; i<ids.length; i++){
    				data.push([ids[i]]);
    			}
    			combo = Ext.getCmp('sitecombo');
    			if(combo){
    				combo.reset();
    				combo.bindStore(Ext.create('Ext.data.ArrayStore', {
        			    fields: ['ID'],
        			    data: data
        			}));
    			} 	
    		});
    		// select first file when available and load its data
    		var files = Ext.data.StoreManager.lookup('FileStore');
    		files.on('load',function(s,records){
    			var combo = Ext.getCmp('filecombo');
    			if(combo){
    				combo.select(records[0]);
    				// manually fire event as select does not
    				combo.fireEvent('select', combo, [records[0]]);
    			}
    		});
    		files.load();
        }
    }
})

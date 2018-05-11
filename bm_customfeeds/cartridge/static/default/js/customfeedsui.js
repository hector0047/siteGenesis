/**
 * The main class to create the UI.
 *
 * @author Danny Gehl
 */

Ext.onReady(function(){
    Ext.QuickTips.init();

    // create the central store which loads and saves the feeds
    var store = new dw.ext.CustomObjectTreeStore({type:'CustomFeedConfig'});

    var feeds = new dw.ext.FeedPanel({
        region: 'west',
	    collapsible: true,
	    width: 225,
	    //floatable: false,
	    split: true,
	    minWidth: 175,
    	store : store
    });
    var mainPanel = new MainPanel(store);

    feeds.on('feedselect', function(panel, feed){
        if(feed) {
        	mainPanel.loadFeed(feed);
        }
    });
    
    mainPanel.statusBar = new Ext.ux.StatusBar({
        defaultText: 'Feeds loaded: 0',
        id: 'feeds-statusbar',
        items: []
    });
    var viewport = new Ext.Panel({
		height: 	600,
        layout:		'border',
        renderTo: 	'customfeeds-ui',
        items:[
            new Ext.Panel({html:'<div class="x-form-field" style="padding:5px"><p>This extension allows you to easily configure product export feeds.</p>'+
            	'<p>Click the "Add feed" to get started and then follow the steps outlined below.</p>'+
    			'<p><i>Note that the Integration Framework is required in order to actually generate the feeds, all required components and Workflows are included within this framework and you basically only need to schedule your feed creation.</i></p></div>',
    			region:		'north',
    	        title:		'Custom feeds management',
    			collapsible: true
            }),
            feeds,
            mainPanel
         ],
         bbar:  mainPanel.statusBar
    });
    
    store.on('beforeload',function(store, records, options){
 	   mainPanel.statusBar.showBusy('Loading feeds...');
     });
    store.on('load',function(store, node, records, options){
	    if(records){
	 	   for(var i = 0; i < records.length; i++){
			   records[i].data.leaf = true;
		   }
	    }
	    feeds.view.getSelectionModel().select(records[0]);
	    mainPanel.statusBar.clearStatus({useDefaults:true});
	    mainPanel.statusBar.setStatus(records.length+' feeds loaded.');
    });
    store.on('update',function(store, record, operation, eOpts ) {
    	if(record.data.id === 'root') return;
        switch(operation) {
	        case Ext.data.Model.EDIT:
	        	mainPanel.statusBar.setStatus('Updating feed '+record.data.id+'...');
	            break;
	        case Ext.data.Model.COMMIT:
	        	mainPanel.statusBar.setStatus('Feed '+record.data.id+' was successfully updated!');
	            break;
	        case Ext.data.Model.REJECT:
	        	mainPanel.statusBar.setStatus('Something went horribly wrong :( Data was rejected!');
	            break;
	    }
	});
    store.on('add',function(store, records, index){
		mainPanel.statusBar.setStatus('New feed '+records[0].data.id+' successfully created.');
     });
    store.on('remove',function(store, record, index){
		mainPanel.statusBar.setStatus('Feed '+record.data.id+' successfully deleted.');
     });
});


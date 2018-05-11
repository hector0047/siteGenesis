JSDOC.PluginManager.registerPlugin(
    "JSDOC.demandwarePlugin",
    {
		onDocCommentTags: function(comment) {
    		var tags = comment.tags;
    		var isPipelet = false;
			for (var i = 0, l = tags.length; i < l; i++) {
				
				if (tags[i].title == "input" || tags[i].title == "output") {
					
					var desc = tags[i].desc;
					var descNew = "";
					var indexNameEnd = desc.indexOf(':');
					var indexTypeEnd = desc.indexOf(' ', indexNameEnd + 2 );
					if (indexTypeEnd == -1) {
						indexTypeEnd = desc.length;
					}
					tags[i].name = desc.substring(0, indexNameEnd); 
					tags[i].type = tags[i].title.replace("put", "") + ": "  +  desc.substring(indexNameEnd + 2, indexTypeEnd); 
					descNew = desc.substring(indexTypeEnd, desc.length); 
					descNew = descNew.replace(/\n/g,'<br/>');
					descNew = descNew.replace(/\r/g,'<br/>');
					tags[i].desc = descNew;
					// treat as param tag
					tags[i].title = "param";
					isPipelet = true;
				}
				if (tags[i].title == "param") {
					
					var desc = tags[i].desc;
					var descNew = "";
					var indexNameEnd = desc.indexOf(':');
					var indexTypeEnd = desc.indexOf(' ', indexNameEnd + 2 );
					if (indexTypeEnd == -1) {
						indexTypeEnd = desc.length;
					}
					if (indexNameEnd != -1) {
						tags[i].type = desc.substring(indexNameEnd + 2, indexTypeEnd);
					}
					descNew = desc.substring(indexTypeEnd, desc.length); 
					descNew = descNew.replace(/\n/g,'<br/>');
					descNew = descNew.replace(/\r/g,'<br/>');
					tags[i].desc = descNew;

				}
				if(isPipelet){
					DemandwarePlugin.scriptComment = comment;
				}
			}
    	},
    	onSymbol : function(symbol) {
    		//print("Processing symbol: "+symbol.alias);
	    	if(symbol.alias == "execute"){
				var path = DemandwarePlugin.createPathFromFileName(symbol.srcFile);
				
				// create symbols for the path
				if(!JSDOC.Parser.symbols.hasSymbol(path.join("."))){
					if(path.length > 1) DemandwarePlugin.createSymbolsForPath(path.slice(0,path.length-1), symbol.srcFile);
					var nsSymbol = new JSDOC.Symbol(path.join("."), [], "PIPELET", new JSDOC.DocComment(""));
					nsSymbol.isNamespace = true;
					nsSymbol.isPrivate = false;
					nsSymbol.srcFile = symbol.srcFile;
					nsSymbol.desc = (JSDOC.Parser.symbols.getSymbol(symbol.srcFile) || {desc: ""}).desc;
					JSDOC.Parser.addSymbol(nsSymbol);
					
					// add saved comment (saving is required due to importScript directives)
					if(DemandwarePlugin.scriptComment){
						nsSymbol.comment = DemandwarePlugin.scriptComment;
						nsSymbol.setTags();
						nsSymbol.classDesc = nsSymbol.desc;
						
						DemandwarePlugin.scriptComment = null;
						/*DEBUG*///print("Updated symbol: "+nsSymbol.alias);
					}
				}
	
				// update the alias
				symbol.alias = path.join(".")+"."+symbol.alias;
	    	}else if(JSDOC.Parser.symbols.hasSymbol(symbol.alias) && symbol.is("CONSTRUCTOR")){
	    		// constructors overwrite previously documented symbols
    			JSDOC.Parser.symbols.deleteSymbol(symbol.alias);
    		}else if(symbol.is("FUNCTION") && symbol.alias.replace(/^.*(?:#|\.|-)/).match(/^[A-Z]/)){
    			symbol.isa = "CONSTRUCTOR";
    			if (symbol.classDesc == "") {
    			symbol.classDesc = symbol.desc;
    			}
    		}
	   	}
    }
);

var DemandwarePlugin = {
		scriptComment : null,
		
		createPathFromFileName : function(fileName){
			var fullPath = fileName.replace(/.ds$/,"").split("\\");
			var path = [];
			for (var i = 0, l = fullPath.length; i < l; i++) {
				if(fullPath[i] == "scripts"){
					path.push(fullPath[i-2]);
				}else if(path.length > 0){
					path.push(fullPath[i]);
				}
			}
			return path;
		},

		createSymbolsForPath : function(path, srcFile){
			if(!JSDOC.Parser.symbols.hasSymbol(path.join("."))){
				// Check and created parents if necessary
				if(path.length > 1) DemandwarePlugin.createSymbolsForPath(path.slice(0,path.length-1), srcFile);
				
				// create current symbol
				var nsSymbol = new JSDOC.Symbol(path.join("."), [], "VIRTUAL", new JSDOC.DocComment(""));
				nsSymbol.isPrivate = false;
				//nsSymbol.srcFile = srcFile;
				JSDOC.Parser.addSymbol(nsSymbol);
				/*DEBUG*///print("Created implicit symbol: "+nsSymbol.alias);
			}
		}
}
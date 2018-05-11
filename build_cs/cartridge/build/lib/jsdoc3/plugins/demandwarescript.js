/**
 * This plugin adds Demandware Script support which basically consists of two things <br />
 *
 * 1. Strip all type definitions as JSDoc cannot understand " : String"
 * 2. Document pipelets
 * 
 * Documenting pipelets is a bit tricky, here is how it roughly works. First the pipelet comment is tagged as module,
 * the way this works is by looking for @input/@output tags in each comment. Input and Output tags are handles separately
 * and the tags are added to array properties of the doclet for later consumption. After a file is done the saved pipelet 
 * doclet is set to type pipelet. This is done as modules get a special treatment which would be hard to achieve without 
 * modification of the core framework.
 */
 
/**
 * Creates a namespace from a given file name.
 *
 * @param   {String} fileName The file name
 * @returns {Array}  The path of the namespace
 */
function createPathFromFileName(fileName){
	var fullPath = fileName.replace(/.ds$/,"").split(/\\|\//);
	var path = [];
	for (var i = 0, l = fullPath.length; i < l; i++) {
		if(fullPath[i] == "scripts"){
			path.push(fullPath[i-2]);
		}else if(path.length > 0){
			path.push(fullPath[i]);
		}
	}
	return path;
}

var pipeletDoclet;

exports.handlers = {
    beforeParse: function(e) {
        // problem is, that our " : <type>" syntax breaks the parser, so we need some magic
        // preserve in and output types
        e.source = e.source.replace(/@input ([A-Za-z0-9_]+)(?:[^:])?:(?:[^:])([A-Z]{1}[A-Za-z0-9]+|dw\.[a-z]+\.[A-Za-z0-9]+|boolean|string)([ ,)=;]{1}|\n|\r|$)/g,'@input {$2} $1$3');
        e.source = e.source.replace(/@output ([A-Za-z0-9_]+)(?:[^:])?:(?:[^:])([A-Z]{1}[A-Za-z0-9]+|dw\.[a-z]+\.[A-Za-z0-9]+|boolean|string)([ ,)=;]{1}|\n|\r|$)/g,'@output {$2} $1$3');
        // remove all other types for now
        // FIXME: Unfortunately this also messes with some documentation that looks syntactically like a type
        e.source = e.source.replace(/(?:[^:A-Za-z0-9"')/]+)?:(?:[^:A-Za-z0-9/]+)(?:[A-Z]{1}[A-Za-z0-9]+|dw\.[a-z]+\.[A-Za-z0-9]+|boolean|string)([ ,)=;]{1}|\n|\r|\t|$)/g,'$1');
    },
    jsdocCommentFound : function(e) {
    	if(e.comment.indexOf('@input') > -1 || e.comment.indexOf('@output') > -1){
		var path = createPathFromFileName(e.filename);
    		e.comment = e.comment.replace('*/','* @module '+path.join('.')+'\n*/').replace(/put ([a-zA-Z0-9._]+) ?: ? ([a-zA-Z0-9._]+)/,'put {$2} $1');
    	}
    },
    newDoclet : function(e) {
        if(e.doclet.name == "execute"){
		e.doclet.undocumented = false;
		//e.doclet.description = e.doclet.description || "Auto-generated";
	}
        if(e.doclet.kind === "module" && e.doclet.pipelet){
		// save the doclet to modify the kind after the file is done
        	pipeletDoclet = e.doclet;
	}
    },
    fileComplete : function(e) {
    	// convert doclet to pipelet
    	if(pipeletDoclet) pipeletDoclet.kind = "pipelet";
    	// and reset
    	pipeletDoclet = undefined;
    }
}

exports.defineTags = function(dictionary) {
	dictionary.defineTag('input', { mustHaveValue : true, canHaveName : true, canHaveType : true,
	    onTagged: function(doclet, tag) {
	   	if(!doclet.input) doclet.input = [];
	   	// add type
		doclet.input.push(tag.value);
		doclet.pipelet = true;
	    } }); 
	dictionary.defineTag('output', { mustHaveValue : true, canHaveName : true, canHaveType : true,
	    onTagged: function(doclet, tag) {
	   	if(!doclet.output) doclet.output = [];
	   	// add type
		doclet.output.push(tag.value);
		doclet.pipelet = true;
	    } }); 
}

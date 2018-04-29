/* global _, sqlFormatter */

sap.ui.controller("app.controllers.executorSPED.eSocial.executeForm", {
	onInit: function() {},
	onDataRefactor: function(data) {
		return $.extend(data, this.data);
	},
	onAfterRendering: function(html) {
		let _self = this;
		let data = _self.getData();
		_self.view = $(html);
		let type = _self.getType(data.subType);
	    let result  = '<pre class="prettyprint lang-sql" >;---------------> Insert template for event '  + data.header.type + ' version '+ data.header.version +'<br/>';
	    result +=  ';---------------> Scenario for ' + type +' (' + data.subheader.subname +') </br>';
	    result += ';---------------> Record Id and Parent Id relation</br></br>';
	    result += _self.setHerarchy(data.herarchy, 1) + '</br>';
	    result += _self.formatData(data.queries);
	    result +=  '</br>';
	    result += " ;---------------> End of " +  data.subheader.name   + " template";
	    result += '</pre>';
	    $('#content').html(result);
	},
	formatData: function(data){
	    let result = "";
	    _.forEach(data, function(value){
	        result += sqlFormatter.format(value);
	        result += ";";
	        result += "</br></br>";
	    });
	    return result;
	},
	
    setHerarchy: function(herarchies, level){
        let _self = this;
    	let result = '';
    	_.forEach(herarchies, function(herarchy) {
    		result += ';' + '\t'.repeat(level) + herarchy.table + '</br>';
    		if (!_.isEmpty(herarchy.children)) {
    			result += _self.setHerarchy(herarchy.children, level + 1);
    		}
    	});

	    return result;
    },
    getType: function (header){
        if(header.indexOf('Insert') != -1){
            return "Insert";
		}else if(header.indexOf('Update') != -1){
            return "Update";
		}else if(header.indexOf('Delete') != -1){
		    return "Delete";
		}
    }
});
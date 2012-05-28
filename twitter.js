var TweetSearch = BTS.SortableList.extend({
	
	url: function(){
		if(!this.search){throw new Error('No search defined');}
		return 'http://search.twitter.com/search.json?rpp=25&q=' + this.search;
	},

	initialize: function(models, opt){
		opt = opt || {};
		this.search = opt.search;
		BTS.SortableList.prototype.initialize.call(this);
	},

	sync: function(method, model, opt){
		opt = opt || {};
		opt.dataType = 'jsonp';
		return Backbone.sync.call(this, method, model, opt);
	},

	parse: function(res){
		return res.results;
	}

});

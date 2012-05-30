/*global _:true, Backbone:true, $: true, BTS: true */

var TweetSearch = BTS.SortableList.extend({
	
	url: 'http://search.twitter.com/search.json',

	initialize: function(models, opt){
		opt = opt || {};
		this.search = opt.search;
		BTS.SortableList.prototype.initialize.call(this);
	},

	sync: function(method, model, opt){
		if(method !== 'read'){throw new Error("I can't do anything but read tweets");}
		if(!this.search){throw new Error('No search defined');}
		opt = opt || {};
		opt.type = "GET";
		opt.dataType = 'jsonp';
		opt.data = {
			rpp: 10, // results per page
			q: this.search
		};
		return Backbone.sync.call(this, method, model, opt);
	},

	parse: function(res){
		return res.results;
	}

});

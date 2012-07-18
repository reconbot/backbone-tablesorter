/*global _:true, Backbone:true, $: true, BTS: true */

(function(){

  BTS.ExpandableTable = BTS.SortableTable.extend({

    // Our parents initialize will copy all the options over we just need to
    // specify a few more defaults
    initialize: function(opt){
      BTS.SortableTable.prototype.initialize.call(this, opt);
      _.defaults(this.opt, {
        expandedView: BTS.ExpandableTableRow,
        keepRow: false
      });
      this.contractedViews = {};
      this.expandedViews = {};
    },

    removeAll: function(){
      _.forEach(this.contractedViews, function(m){m.off();});
      _.forEach(this.expandedViews, function(m){m.off();});
      this.contractedViews = {};
      this.expandedViews = {};
      this.rows = {}; // no need call off on this in the parent
      BTS.SortableTable.prototype.removeAll.call(this);
    },

    remove: function(model){
      var cid = model.cid;
      this.contractedViews[cid].off();
      this.contractedViews[cid].remove();
      delete this.contractedViews[cid];

      this.expandedViews[cid].off();
      this.expandedViews[cid].remove();
      delete this.expandedViews[cid];

      BTS.SortableTable.prototype.remove.call(this, model);
    },

    add: function(model){
      BTS.SortableTable.prototype.add.call(this, model);
      var cid = model.cid;
      var data = {
        model: model,
        col: this.col()
      };

      var ctd = this.contractedViews[cid] = this.rows[cid];
      var exp = this.expandedViews[cid] = new this.opt.expandedView(data);

      ctd.on('toggle', this.toggle, this);
      ctd.on('expand', this.expand, this);
      ctd.on('contract', this.contract, this);
      ctd.on('remove', this.remove, this);

      exp.on('toggle', this.toggle, this);
      exp.on('expand', this.expand, this);
      exp.on('contract', this.contract, this);
      exp.on('remove', this.remove, this);
    },

    expandAll: function(){
      _.forEach(this.rows,function(row){return row.expand();});
    },

    expand: function(cid){
      var row = this.rows[cid];
      var exp = this.expandedViews[cid];

      if(row === exp){return;}

      row.$el.after(exp.el);
      this.rows[cid] = exp;

      if(!this.opt.keepRow){
        row.detach();
      }
      this.trigger('expand', cid);
      row.afterExpand();
      exp.afterExpand();
    },

    contract: function(cid){
      var ctd = this.contractedViews[cid];
      var exp = this.expandedViews[cid];
      var row = this.rows[cid];

      if(row === ctd){return;}

      if(!this.opt.keepRow){
        row.$el.before(ctd.el);
      }
      this.rows[cid] = ctd;
      exp.detach();
      this.trigger('contract', cid);
      ctd.afterContract();
      exp.afterContract();
    },

    contractAll: function(){
      _.forEach(this.rows,function(row){return row.contract();});
    },

    toggle: function(cid){
      if(this.rows[cid] === this.contractedViews[cid]){
        this.expand(cid);
      }else{
        this.contract(cid);
      }
    },

    attachAll: function(){
      this.collection.forEach(function(model){
        var cid = model.cid;
        var row = this.rows[cid];
        if(this.opt.keepRow && this.expandedViews[cid] === this.rows[cid]){
          this.tbody.append(this.contractedViews[cid].el);
        }
        this.tbody.append(row.el);
      }, this);
    }

  });

  BTS.ExpandableTableRow = BTS.SortableTableRow.extend({

    template: 'sortable-table-row',

    events: {
      'click .js-toggle': 'toggle',
      'click .js-expand': 'expand',
      'click .js-contract': 'contract'
    },

    initialize: function(opt){
      BTS.SortableTableRow.prototype.initialize.call(this, opt);
    },

    toggle: function(){
      return this.trigger('toggle', this.model.cid, this);
    },
    
    expand: function(){
      return this.trigger('expand', this.model.cid, this);
    },

    afterExpand: function(){},
    
    contract: function(){
      return this.trigger('contract', this.model.cid, this);
    },

    afterContract: function(){}

  });

}.call(this));
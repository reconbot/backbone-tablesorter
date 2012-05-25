if(typeof this.WC === 'undefined'){ var WC = this.WC = {}; }

WC.SortableList = Backbone.Collection.extend({
  
  sortField: 'cid',

  asc: false,

  sort: function(opt){
    opt = opt || {};
    opt.silent = true;
    Backbone.Collection.prototype.sort.call(this, opt);
    this.trigger('sort', this, opt);
  },

  sortByField: function(field, asc){
    if(!this.checkField(field)){
      return false;
    }

    if(arguments.length === 1){
      if(this.sortField === field){
        this.asc = !this.asc;
      }else{
        this.asc = false;
      }
    }else{
      this.asc = asc;
    }

    this.sortField = field;
    
    this.sort();
  },

  checkField: function(field){
    if(this.length === 0){
      return false;
    }

    if(this.at(0).has(field)){
      return true;
    }

    if(field === 'id' || field === 'cid'){
      return true;
    }
    
    return false;
  },

  comparator: function(m1, m2){
    var field = this.sortField;
    var a,b;

    if(field === 'id'){
      a = m1.id;
      b = m2.id;
    }else if(field === 'cid'){
      a = m1.cid;
      b = m2.cid;
    }else{
      a = m1.get(field);
      b = m2.get(field);
    }

    if(WC.isNumeric(a) && WC.isNumeric(b)){
      a = Number(a);
      b = Number(b);
    

    if(this.asc){
      return a < b ? -1 : a > b ? 1 : 0;
    }else{
      return b < a ? -1 : b > a ? 1 : 0;
    }
  }
});

WC.isNumeric = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

WC.GenericTable = Backbone.View.extend({

  events: {
    'click th' : 'sort'
  },

  initialize: function(opt){
    opt = opt || {};
    _.defaults(opt,{
      template: 'generic-table',
      tableClass: '',
      rowClass: '',
      emptyMessage: 'No Data',
      col: undefined,
      sortable: true
    });

    _.extend(this, opt);

    // need to pickup on collections somehow
    this.collection = this.collection || new WC.SortableList(opt.data);
    this.collection.on('all', this.render, this);
    this.render();
  },

  getCol: function(){
    if(this.col){
      return this.col;
    }
    
    if(!this.collection.length){
      col = [
        {name:"Data", field:"data"}
      ];
    }else{
      var data = this.collection.at(0).attributes;
      col = [];
      var keys = _.keys(data);
      _.each(keys, function(v){
        col.push(
          {'name':v.charAt(0).toUpperCase()+v.slice(1), 'field':v}
        );
      });
      this.col = col;
    }
    return col;
  },

  sort: function(e){
    if(!this.sortable){return;}

    var list = this.collection;
    if(typeof list.checkField !== 'function'){return;}
    
    var field = e.target.getAttribute('data-field');
    if(!list.checkField(field)){return;}

    if(list.sortField === field){
      list.asc = !list.asc;
    }else{
      list.sortField = field;
      list.asc = true;
    }
    if(this.getCol() && this.col){
      _.each(this.col,function(col){
        if(col.field === field){
          if(list.asc){
            col.sortasc = true;
            col.sortdesc = false;
          }else{
            col.sortasc = false;
            col.sortdesc = true;
          }
        }else{
          col.sortasc = false;
          col.sortdesc = false;
        }
      });
    }
    list.sort();
  },

  render: function(){
    var self = this;
    // "render" the data because the template is dumb
    var rendered_data = [];
    this.collection.each(function(model, index){
      var rendered_row = [];
      _.each(self.getCol(), function(field){
        var rowobj = {};
        rowobj.className = field.className;
        rowobj.cid = model.cid;

        if(field.render){
          var value = field.field? model.get(field.field) : undefined;
          rowobj.html = field.render(value,model);
        }else if(field.field){
          rowobj.text = model.get(field.field) || "";
        }
        rendered_row.push(rowobj);
      });
      rendered_data.push({row:rendered_row, cid: model.cid, rowClass: self.rowClass});
    });

    this.$el.html(WC.renderMustache(this.template, {
      'data': rendered_data, 
      col:this.getCol(), 
      tableClass: this.tableClass,
      emptyMessage: this.emptyMessage
    }));
    return this.el;
  }
});

WC.ExpandingTable = Backbone.View.extend({

  tagName: 'table',

  className: 'table',

  events: {
    'click th' : 'triggerSort'
  },

  initialize: function(opt){
    opt = opt || {};
    this.opt = _.defaults(opt,{
      template: 'expandable-table',
      tableClass: false,
      sortable: true,
      view: WC.ExpandableTableRow,
      expandedView: WC.ExpandableTableRow,
      keepRow: false,
      col: undefined,
      emptyMessage: 'No Rows to Display'
    });

    if(this.opt.tableClass){
      this.$el.addClass(this.opt.tableClass);
    }

    this.collection = this.collection || new WC.SortableList();

    // setup the views
    this.render();
    this.reset();

    // if anything changes...
    this.collection.on('reset', this.reset, this);
    this.collection.on('add', this.add, this);
    this.collection.on('remove', this.remove, this);
    this.collection.on('sort', this.sort, this);
  },

  render: function(){
    this.$el.html( WC.renderMustache(this.opt.template,{
      col: this.col()
    }));
    this.tbody = this.$('tbody');
  },

  update: function(){
    this.detatchAll();
    this.render();
    this.attachAll();
  },

  col: function(){
    if(this.opt.col){
      return this.opt.col;
    }
    if(!this.collection.length){
      return [
        {name:"Data", field:"data"}
      ];
    }
    var data = this.collection.at(0).attributes;

    return _.map(_.keys(data), function(v){
      return {'name':v.charAt(0).toUpperCase()+v.slice(1), 'field':v}
    });
  },

  triggerSort: function(e){
    if(!this.opt.sortable){return;}

    var list = this.collection;
    if(typeof list.sortByField !== 'function'){throw new Error("Collection isn't a SortableList");}
    
    var field = e.target.getAttribute('data-field');
    return list.sortByField(field);
  },

  sort: function(){
    this.detatchAll();
    this.updateHeaders();
    this.attachAll();
  },

  updateHeaders: function(){
    var field = this.collection.sortField;
    this.$('.js-sort-sprite').removeClass('icon-chevron-down icon-chevron-up');
    var sprite = this.$('th[data-field="'+ field +'"] > .js-sort-sprite');
    if(this.collection.asc){
      sprite.addClass('icon-chevron-up');
    }else{
      sprite.addClass('icon-chevron-down');
    }
  },
  
  reset: function(){
    this.removeAll();
    this.addEmpty();
    this.updateHeaders(); // the sort is already done during the reset so...
    this.collection.forEach(this.add, this);
  },

  addEmpty: function(){
    if(this.collection.length === 0 && this.opt.emptyMessage){
      var colspan = this.col().length;
      this.tbody.append('<tr class="js-emptyrow"><td colspan='+colspan+' style="text-align:center">' + this.opt.emptyMessage + '</td></tr>');
    }
  },

  removeEmpty: function(){
    this.tbody.find('.js-emptyrow').remove();
  },

  attachAll: function(){
    this.collection.forEach(function(model){
      var cid = model.cid;
      var dis = this.displayedRows[cid];
      var exp = this.expandedRows[cid];
      var row = this.rows[cid];
      if(this.opt.keepRow && dis === exp){
        this.tbody.append(row.el);
      }
      this.tbody.append(dis.el);
    }, this);
  },

  detatchAll: function(){
    this.tbody.find('tr').detach();
  },

  removeAll: function(){
    this.rows = {};
    this.expandedRows = {};
    this.displayedRows = {};
    this.tbody.empty();
  },

  add: function(model){
    var cid = model.cid;
    var data = {
      model: model,
      col: this.col()
    };
    var row = this.rows[cid] = new this.opt.view(data);
    var exp = this.expandedRows[cid] = new this.opt.expandedView(data);

    row.on('toggle', this.toggle, this);
    row.on('expand', this.expand, this);
    row.on('contract', this.contract, this);
    
    exp.on('toggle', this.toggle, this);
    exp.on('expand', this.expand, this);
    exp.on('contract', this.contract, this);

    this.displayedRows[cid] = this.rows[cid];
    this.tbody.append(this.rows[cid].el);

    if(this.collection.length === 1){
      this.removeEmpty();
    }
  },

  remove: function(model){
    var cid = model.cid;
    
    this.rows[cid].remove();
    this.rows[cid].off();

    this.expandedRows[cid].remove();
    this.expandedRows[cid].off();

    delete this.rows[cid];
    delete this.expandedRows[cid];
    delete this.displayedRows[cid];
    this.addEmpty();
  },

  expand: function(cid){
    var dis = this.displayedRows[cid];
    var exp = this.expandedRows[cid];

    if(dis === exp){return;}

    dis.$el.after(exp.el);
    this.displayedRows[cid] = exp;

    if(!this.opt.keepRow){
      dis.detach();
    }
  },

  contract: function(cid){
    var dis = this.displayedRows[cid];
    var exp = this.expandedRows[cid];
    var row = this.rows[cid];

    if(dis === row){return;}

    if(!this.opt.keepRow){
      dis.$el.before(row.el);
    }
    this.displayedRows[cid] = row;
    exp.detach();

  },

  toggle: function(cid){
    if(this.displayedRows[cid] === this.rows[cid]){
      this.expand(cid);
    }else{
      this.contract(cid);
    }
  },

  at: function(index){
    var model = this.collection.at(index);
    if(typeof model === 'undefined'){
      return undefined;
    }
    return this.rows[model.cid];
  }

});


WC.ExpandableTableRow = Backbone.View.extend({

  tagName: 'tr',

  template: 'expandable-table-row',

  context: {},

  events: {
    'click .js-toggle': 'toggle',
    'click .js-expand': 'expand',
    'click .js-contract': 'contract'
  },

  initialize: function(opt){
    opt || (opt = {});
    this.col = opt.col || [];
    this.model.on('change', this.update, this);
    this.render();
  },

  render: function(){ 
    var data = _.map(this.col, function(field){
        var row = {};
        row.className = field.className;
        row.cid = this.model.cid;

        if(field.render){
          var value = field.field? this.model.get(field.field) : undefined;
          row.html = field.render(value, this.model);
        }else if(field.field){
          row.text = this.model.get(field.field);
        }
        return row;
    }, this);

    var context = _.extend({}, this.context, {col:data}); 

    this.$el.html( WC.renderMustache(this.template,context));
    return this.el;
  },

  update: function(){
    return this.render();
  },

  toggle: function(){
    return this.trigger('toggle', this.model.cid, this);
  },
  
  expand: function(){
    return this.trigger('expand', this.model.cid, this);
  },
  
  contract: function(){
    return this.trigger('contract', this.model.cid, this);
  },

  detach: function(){
    this.$el.detach();
  }

});

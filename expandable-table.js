(function(){

  BTS.ExpandableTable = BTS.GenericTable.extend({

    initialize: function(opt){
      BTS.GenericTable.prototype.initialize.call(this, opt);
      _.defaults(this.opt, {
        expandedView: WC.ExpandableTableRow,
        keepRow: false
      });
    }

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

    //todo make this work
    add: function(model){
      var exp = this.expandedRows[cid] = new this.opt.expandedView(data);

      row.on('toggle', this.toggle, this);
      row.on('expand', this.expand, this);
      row.on('contract', this.contract, this);
      
      exp.on('toggle', this.toggle, this);
      exp.on('expand', this.expand, this);
      exp.on('contract', this.contract, this);

      this.displayedRows[cid] = this.rows[cid];
    },

    remove: function(model){
      this.expandedRows[cid].remove();
      this.expandedRows[cid].off();
      delete this.expandedRows[cid];
      delete this.displayedRows[cid];
    },

    attachAll: function(){
      var dis = this.displayedRows[cid];
      var exp = this.expandedRows[cid];
      if(this.opt.keepRow && dis === exp){
        this.tbody.append(row.el);
      }
    }

  });

  BTS.ExpandableTableRow = BTS.GenericTableRow.extend({

    template: 'expandable-table-row',

    events: {
      'click .js-toggle': 'toggle',
      'click .js-expand': 'expand',
      'click .js-contract': 'contract'
    },

    initialize: function(opt){
      BTS.GenericTableRow.prototype.initialize.call(opt);
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

    toggle: function(){
      return this.trigger('toggle', this.model.cid, this);
    },
    
    expand: function(){
      return this.trigger('expand', this.model.cid, this);
    },
    
    contract: function(){
      return this.trigger('contract', this.model.cid, this);
    }

  });

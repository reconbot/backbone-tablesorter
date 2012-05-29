/*global _:true, Backbone:true, $: true, Mustache: true */

(function(){

  var BTS;
  if(typeof this.BTS === 'undefined'){
    BTS = this.BTS = {};
  }else{
    BTS = this.BTS;
  }

  // This is abstracted out becuase.. well you might not want to do it this way
  BTS.renderTemplate = function(template, data){
    var tmpl = BTS.templates[template];
    if(!tmpl){throw new Error("Can't find the template: " + template);}
    return Mustache.render(tmpl, data);
  };

  
  BTS.SortableList = Backbone.Collection.extend({
    
    sortByMe: 'cid',

    asc: false,

    sort: function(opt){
      opt = opt || {};
      var reallySilent = opt.silent;
      opt.silent = true;
      Backbone.Collection.prototype.sort.call(this, opt);
      if(!reallySilent){
        this.trigger('sort', this, opt);
      }
    },

    sortBy: function(me, asc){
      var isValid = (typeof me === 'function' || (typeof me === 'string' && this.checkField(me)) );
      if(!isValid){
        return false;
      }

      if(arguments.length === 2){
        this.asc = asc;
      }else{
        if(this.sortByMe === me){
          this.asc = !this.asc;
        }else{
          this.asc = false;
        }
      }

      this.sortByMe = me;
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
      var me = this.sortByMe;
      var a,b;

      if(typeof me === 'function'){
        a = me(m1);
        b = me(m2);
      }else if(me === 'id'){
        a = m1.id;
        b = m2.id;
      }else if(me === 'cid'){
        a = m1.cid;
        b = m2.cid;
      }else{
        a = m1.get(me);
        b = m2.get(me);
      }

      if(this.asc){
        return a < b ? -1 : a > b ? 1 : 0;
      }else{
        return b < a ? -1 : b > a ? 1 : 0;
      }
    }
  
  });

  BTS.SortableTable = Backbone.View.extend({

    tagName: 'table',

    className: 'table',

    events: {
      'click th' : 'triggerSort'
    },

    initialize: function(opt){
      opt = opt || {};
      this.opt = _.defaults(opt,{
        template: 'sortable-table',
        tableClass: false,
        sortable: true,
        view: BTS.GenericTableRow,
        col: undefined,
        emptyMessage: 'No Rows to Display'
      });

      if(this.opt.tableClass){
        this.$el.addClass(this.opt.tableClass);
      }

      this.collection = this.collection || new BTS.SortableList();
      this.rows = {};

      // if anything changes...
      this.collection.on('reset', this.reset, this);
      this.collection.on('add', this.add, this);
      this.collection.on('remove', this.remove, this);
      this.collection.on('sort', this.sort, this);

      this.render();
      this.reset();
    },

    render: function(){
      this.$el.html( BTS.renderTemplate(this.opt.template,{
        col: this.col()
      }));
      this.tbody = this.$('tbody');
      if(!this.tbody.length){ throw new Error('No table body found');}
    },

    reset: function(){
      this.removeAll();
      this.render(); //needed to redraw the headers
      this.updateHeaders(); // the sort is already done during the reset so...
      this.addEmpty();
      this.collection.forEach(this.add, this);
    },

    update: function(){
      //console.log('update');
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
        return {'name':v.charAt(0).toUpperCase()+v.slice(1), 'field':v};
      });
    },

    triggerSort: function(e){
      var field = e.target.getAttribute('data-field');
      return this.sortBy(field);
    },

    sortBy: function(col){
      if(!this.opt.sortable){return;}
      if(typeof this.collection.sortBy !== 'function'){throw new Error("Collection isn't a SortableList");}
      this.sortField = col;
      //TODO some magic to check the col array for a sorting function
      this.collection.sortBy(col);
    },

    sort: function(){
      //console.log('sort');
      this.detatchAll();
      this.updateHeaders();
      this.attachAll();
    },

    updateHeaders: function(){
      var field = this.sortField;
      this.$('.js-sort-sprite').removeClass('icon-chevron-down icon-chevron-up');
      var sprite = this.$('th[data-field="'+ field +'"] > .js-sort-sprite');
      if(this.collection.asc){
        sprite.addClass('icon-chevron-up');
      }else{
        sprite.addClass('icon-chevron-down');
      }
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
        var row = this.rows[cid];
        this.tbody.append(row.el);
      }, this);
    },

    detatchAll: function(){
      this.tbody.find('tr').detach();
    },

    removeAll: function(){
      _.forEach(this.rows, function(m){m.off();});
      this.rows = {};
      this.tbody.empty();
    },

    remove: function(model){
      var cid = model.cid;
      
      this.rows[cid].remove();
      this.rows[cid].off();

      delete this.rows[cid];
      this.addEmpty();
    },

    add: function(model){
      var cid = model.cid;
      var data = {
        model: model,
        col: this.col()
      };

      var row = this.rows[cid] = new this.opt.view(data);
      this.tbody.append(row.el);
      
      if(this.collection.length === 1){
        this.removeEmpty();
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

BTS.GenericTableRow = Backbone.View.extend({

    tagName: 'tr',

    template: 'sortable-table-row',

    context: {},

    initialize: function(opt){
      opt = opt || {};
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

      this.$el.html( BTS.renderTemplate(this.template,context));
      return this.el;
    },

    update: function(){
      return this.render();
    },

    detach: function(){
      this.$el.detach();
    }

  });


}.call(this));
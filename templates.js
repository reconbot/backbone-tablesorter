(function(){

  var BTS;
  if(typeof this.BTS === 'undefined'){
    BTS = this.BTS = {};
  }else{
    BTS = this.BTS;
  }

  BTS.templates = {
    'sortable-table': '<thead></thead><tbody></tbody>',
    
    'sortable-table-head': '<tr>{{#col}}<th {{#className}}class="{{className}}"{{/className}} data-field="{{field}}">{{name}} <i class="js-sort-sprite"></i></th>{{/col}}</tr>',
    // <tr>
    //   {{#col}}
    //     <th {{#className}}class="{{className}}"{{/className}} data-field="{{field}}">
    //       {{name}} <i class="js-sort-sprite"></i>
    //     </th>
    //   {{/col}}
    //  </tr>
    'sortable-table-row':'{{#col}}<td {{#className}}class="{{className}}"{{/className}}>{{text}}{{{html}}}</td>{{/col}}',
    // {{#col}}
    //   <td {{#className}}class="{{className}}"{{/className}}>
    //     {{text}}
    //     {{{html}}}
    //   </td>
    // {{/col}}
    'expanded-twitter-row': '<td colspan="{{colspan}}"><h1 style="text-align:center;">{{model.from_user}} is awesome!</h1></td>'
  };


}.call(this));
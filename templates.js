(function(){

  var BTS;
  if(typeof this.BTS === 'undefined'){
    BTS = this.BTS = {};
  }else{
    BTS = this.BTS;
  }

  BTS.templates = {
    'sortable-table': '<colgroup>{{#col}}<col {{#className}}class="{{className}}"{{/className}}/>{{/col}}</colgroup><thead><tr>{{#col}}<th {{#className}}class="{{className}}"{{/className}} data-field="{{field}}">{{name}} <i class="js-sort-sprite"></i></th>{{/col}}</tr></thead><tbody></tbody>',
    // <colgroup>
    //   {{#col}}
    //     <col {{#className}}class="{{className}}"{{/className}}/>
    //   {{/col}}
    // </colgroup>
    // <thead>
    //   <tr>
    //     {{#col}}
    //       <th {{#className}}class="{{className}}"{{/className}} data-field="{{field}}">
    //         {{name}} <i class="js-sort-sprite"></i>
    //       </th>
    //     {{/col}}
    //   </tr>
    // </thead>
    // <tbody></tbody>

    'sortable-table-row':'{{#col}}<td {{#className}}class="{{className}}"{{/className}}>{{text}}{{{html}}}</td>{{/col}}',
    // {{#col}}
    //   <td {{#className}}class="{{className}}"{{/className}}>
    //     {{text}}
    //     {{{html}}}
    //   </td>
    // {{/col}}
    'expanded-twitter-row': 'GROOVY BABY!'
  };


}.call(this));